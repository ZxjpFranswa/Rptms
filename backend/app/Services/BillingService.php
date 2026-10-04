<?php

namespace App\Services;

use App\Enums\BillStatus;
use App\Enums\SoaStatus;
use App\Models\BillingSequence;
use App\Models\StatementOfAccount;
use App\Models\TaxBill;
use App\Models\TaxBillInstallment;
use App\Models\TaxDeclaration;
use App\Models\TaxpayerNotification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class BillingService
{
    public function __construct(
        private readonly BillingSettingsService $settings,
        private readonly TaxComputationService $calculator,
        private readonly AuditService $audit,
    ) {}

    /**
     * Generate an annual tax bill with 4 installments for a given Tax Declaration.
     */
    public function generateBill(TaxDeclaration $td, int $taxableYear, User $user): TaxBill
    {
        $existing = TaxBill::query()
            ->where('tax_declaration_id', $td->id)
            ->where('taxable_year', $taxableYear)
            ->first();

        if ($existing) {
            return $existing->load('installments');
        }

        return DB::transaction(function () use ($td, $taxableYear, $user) {
            $config = $this->settings->all();
            $basicRate = (float) $config['basicRatePct'];
            $sefRate = (float) $config['sefRatePct'];

            $computed = $this->calculator->computeAnnualTax(
                (float) $td->total_assessed_value,
                $basicRate,
                $sefRate
            );

            $billKey = sprintf('BILL-%d', $taxableYear);
            $billNo = BillingSequence::nextNumber($billKey, '%s-%05d');

            $app = $td->assessment?->application;
            $taxpayer = $app?->taxpayer;

            /** @var TaxBill $bill */
            $bill = TaxBill::create([
                'bill_no' => $billNo,
                'tax_declaration_id' => $td->id,
                'assessment_id' => $td->assessment_id,
                'taxpayer_id' => $taxpayer?->id,
                'owner_name' => $td->owner_name,
                'pin' => $app?->propertyDetail?->pin ?? $td->assessment?->pin,
                'arp_number' => $app?->propertyDetail?->arp_number ?? $td->assessment?->arp_number,
                'td_number' => $td->td_number,
                'barangay' => $td->barangay,
                'taxable_year' => $taxableYear,
                'assessed_value' => $computed['assessed_value'],
                'basic_rate_pct' => $computed['basic_rate_pct'],
                'sef_rate_pct' => $computed['sef_rate_pct'],
                'basic_tax' => $computed['basic_tax'],
                'sef_tax' => $computed['sef_tax'],
                'total_tax' => $computed['total_tax'],
                'status' => BillStatus::Unpaid,
                'generated_by' => $user->id,
            ]);

            // Create 4 installments
            $installments = $this->calculator->splitInstallments(
                $computed['basic_tax'],
                $computed['sef_tax'],
                $taxableYear,
                $this->settings
            );

            foreach ($installments as $inst) {
                $bill->installments()->create([
                    'quarter' => $inst['quarter'],
                    'due_date' => $inst['due_date'],
                    'basic_due' => $inst['basic_due'],
                    'sef_due' => $inst['sef_due'],
                    'total_due' => $inst['total_due'],
                    'status' => BillStatus::Unpaid,
                ]);
            }

            $this->audit->log($user, 'Generated Tax Bill', '-', $bill->bill_no);

            return $bill->fresh(['installments']);
        });
    }

    /**
     * Generate bills for all effective years up to the current year.
     */
    public function generateBillsForTaxDeclaration(TaxDeclaration $td, User $user, ?int $upToYear = null): array
    {
        $startYear = (int) ($td->effectivity_date ? Carbon::parse($td->effectivity_date)->year : date('Y'));
        $endYear = $upToYear ?? (int) date('Y');

        $bills = [];
        for ($y = $startYear; $y <= $endYear; $y++) {
            $bills[] = $this->generateBill($td, $y, $user);
        }

        return $bills;
    }

    /**
     * Generate a Statement of Account (SOA) for a property.
     * If there are overdue penalties, status is PendingApproval for Treasurer review.
     * Otherwise, status is Issued directly.
     */
    public function generateStatementOfAccount(
        TaxDeclaration $td,
        User $user,
        array $options = []
    ): StatementOfAccount {
        // Ensure bills exist up to current year
        $this->generateBillsForTaxDeclaration($td, $user);

        return DB::transaction(function () use ($td, $user, $options) {
            $asOfDate = Arr::get($options, 'as_of_date', now()->toDateString());
            $validUntil = Arr::get($options, 'valid_until', Carbon::parse($asOfDate)->endOfMonth()->toDateString());
            $remarks = Arr::get($options, 'remarks', 'Statement of Account generated');
            $customAdjustments = Arr::get($options, 'adjustments', []);

            // Supersede any existing pending/issued SOA for this TD so there is only one active
            StatementOfAccount::query()
                ->where('tax_declaration_id', $td->id)
                ->whereIn('status', [SoaStatus::PendingApproval->value, SoaStatus::Issued->value])
                ->update(['status' => SoaStatus::Superseded->value]);

            $config = $this->settings->all();
            $monthlyRate = (float) $config['monthlyPenaltyPct'];
            $maxPenaltyMonths = (int) $config['maxPenaltyMonths'];

            // Fetch all unpaid/partial installments across all years for this TD
            $installments = TaxBillInstallment::query()
                ->whereHas('taxBill', fn ($q) => $q->where('tax_declaration_id', $td->id))
                ->whereIn('status', [BillStatus::Unpaid->value, BillStatus::Partial->value])
                ->with('taxBill')
                ->orderBy('due_date')
                ->get();

            if ($installments->isEmpty()) {
                throw ValidationException::withMessages([
                    'property' => 'This property has no unpaid or outstanding balances.',
                ]);
            }

            $yearStr = date('Y');
            $soaNo = BillingSequence::nextNumber(sprintf('SOA-%s', $yearStr), '%s-%05d');

            $app = $td->assessment?->application;
            $taxpayer = $app?->taxpayer;

            $itemsData = [];
            $totalBasic = 0.0;
            $totalSef = 0.0;
            $totalPrincipal = 0.0;
            $computedPenaltyTotal = 0.0;
            $adjustedPenaltyTotal = 0.0;
            $hasPenalty = false;

            foreach ($installments as $inst) {
                $basicBal = $inst->basic_balance;
                $sefBal = $inst->sef_balance;
                $princBal = $inst->principal_balance;

                if ($princBal <= 0) continue;

                $monthsLate = $this->calculator->calculateMonthsLate(
                    $inst->due_date,
                    $asOfDate,
                    $maxPenaltyMonths
                );

                $pen = $this->calculator->calculatePenalty(
                    $princBal,
                    $monthsLate,
                    $monthlyRate,
                    $maxPenaltyMonths
                );

                $compPenalty = $pen['penalty_amount'];
                $adjPenalty = $compPenalty;
                $adjReason = null;

                // Check if user provided manual adjustments for this installment
                if (isset($customAdjustments[$inst->id])) {
                    $adj = $customAdjustments[$inst->id];
                    if (isset($adj['penalty_amount'])) {
                        $adjPenalty = max(0.0, round((float) $adj['penalty_amount'], 2));
                        $adjReason = $adj['reason'] ?? 'Clerk adjusted';
                    }
                }

                if ($compPenalty > 0 || $adjPenalty > 0) {
                    $hasPenalty = true;
                }

                $totalBasic += $basicBal;
                $totalSef += $sefBal;
                $totalPrincipal += $princBal;
                $computedPenaltyTotal += $compPenalty;
                $adjustedPenaltyTotal += $adjPenalty;

                $itemsData[] = [
                    'tax_bill_installment_id' => $inst->id,
                    'taxable_year' => $inst->taxBill->taxable_year,
                    'quarter' => $inst->quarter,
                    'due_date' => $inst->due_date,
                    'basic_balance' => $basicBal,
                    'sef_balance' => $sefBal,
                    'principal_balance' => $princBal,
                    'months_late' => $monthsLate,
                    'penalty_rate_pct' => $pen['penalty_rate_pct'],
                    'computed_penalty' => $compPenalty,
                    'penalty_amount' => $adjPenalty,
                    'adjustment_reason' => $adjReason,
                ];
            }

            $totalAmountDue = round($totalPrincipal + $adjustedPenaltyTotal, 2);
            $initialStatus = $hasPenalty ? SoaStatus::PendingApproval : SoaStatus::Issued;

            /** @var StatementOfAccount $soa */
            $soa = StatementOfAccount::create([
                'soa_no' => $soaNo,
                'tax_declaration_id' => $td->id,
                'taxpayer_id' => $taxpayer?->id,
                'revision_of_id' => Arr::get($options, 'revision_of_id'),
                'owner_name' => $td->owner_name,
                'pin' => $app?->propertyDetail?->pin ?? $td->assessment?->pin,
                'td_number' => $td->td_number,
                'barangay' => $td->barangay,
                'as_of_date' => $asOfDate,
                'valid_until' => $validUntil,
                'total_basic' => round($totalBasic, 2),
                'total_sef' => round($totalSef, 2),
                'total_principal' => round($totalPrincipal, 2),
                'computed_penalty' => round($computedPenaltyTotal, 2),
                'total_penalty' => round($adjustedPenaltyTotal, 2),
                'total_amount_due' => $totalAmountDue,
                'has_penalty' => $hasPenalty,
                'status' => $initialStatus,
                'remarks' => $remarks,
                'prepared_by' => $user->id,
                'issued_at' => $initialStatus === SoaStatus::Issued ? now() : null,
            ]);

            foreach ($itemsData as $item) {
                $soa->items()->create($item);
            }

            $this->audit->log($user, 'Generated Statement of Account', '-', $soa->soa_no);

            if ($soa->status === SoaStatus::Issued) {
                $this->notifyTaxpayer($soa);
            }

            return $soa->fresh(['items', 'taxpayer', 'taxDeclaration']);
        });
    }

    /**
     * Treasurer approves an SOA with penalties.
     */
    public function approveSoa(StatementOfAccount $soa, User $treasurer, string $remarks = ''): StatementOfAccount
    {
        if ($soa->status !== SoaStatus::PendingApproval) {
            throw ValidationException::withMessages([
                'status' => 'Only SOAs awaiting approval can be approved.',
            ]);
        }

        return DB::transaction(function () use ($soa, $treasurer, $remarks) {
            $soa->status = SoaStatus::Issued;
            $soa->reviewed_by = $treasurer->id;
            $soa->reviewed_at = now();
            $soa->issued_at = now();
            $soa->review_remarks = $remarks ?: 'Approved by Municipal Treasurer';
            $soa->save();

            $this->audit->log($treasurer, 'Approved SOA Penalties', $soa->soa_no, 'Issued');
            $this->notifyTaxpayer($soa);

            return $soa->fresh(['items', 'taxpayer', 'reviewer']);
        });
    }

    /**
     * Treasurer denies an SOA with penalties and returns it to Clerk.
     */
    public function denySoa(StatementOfAccount $soa, User $treasurer, string $reason): StatementOfAccount
    {
        if ($soa->status !== SoaStatus::PendingApproval) {
            throw ValidationException::withMessages([
                'status' => 'Only SOAs awaiting approval can be denied.',
            ]);
        }

        return DB::transaction(function () use ($soa, $treasurer, $reason) {
            $soa->status = SoaStatus::Denied;
            $soa->reviewed_by = $treasurer->id;
            $soa->reviewed_at = now();
            $soa->review_remarks = $reason;
            $soa->save();

            $this->audit->log($treasurer, 'Denied SOA Penalties', $soa->soa_no, "Denied: {$reason}");

            return $soa->fresh(['items', 'taxpayer', 'reviewer']);
        });
    }

    /**
     * Clerk revises a denied SOA and generates a new version.
     */
    public function reviseSoa(
        StatementOfAccount $deniedSoa,
        User $clerk,
        array $adjustments = [],
        string $remarks = ''
    ): StatementOfAccount {
        if ($deniedSoa->status !== SoaStatus::Denied) {
            throw ValidationException::withMessages([
                'status' => 'Only denied SOAs can be revised.',
            ]);
        }

        return DB::transaction(function () use ($deniedSoa, $clerk, $adjustments, $remarks) {
            $deniedSoa->status = SoaStatus::Superseded;
            $deniedSoa->save();

            return $this->generateStatementOfAccount(
                $deniedSoa->taxDeclaration,
                $clerk,
                [
                    'revision_of_id' => $deniedSoa->id,
                    'adjustments' => $adjustments,
                    'remarks' => $remarks ?: "Revised SOA after Treasurer feedback: {$deniedSoa->review_remarks}",
                ]
            );
        });
    }

    /**
     * Send in-app and email notifications to the taxpayer regarding an issued SOA.
     */
    public function notifyTaxpayer(StatementOfAccount $soa): void
    {
        $taxpayer = $soa->taxpayer;
        $recipientEmail = $taxpayer?->email;

        $subject = "Real Property Tax Statement of Account: {$soa->soa_no} ({$soa->td_number})";
        $message = sprintf(
            "Dear %s,\n\nA Statement of Account (SOA No: %s) has been issued for your property with Tax Declaration %s in Barangay %s.\n\nTotal Amount Due: PHP %s\nValid Until: %s\n\nPlease proceed to the Municipal Treasurer's Office (Cashier) to settle your account.\n\nThank you,\nMunicipality of Magarao",
            $soa->owner_name,
            $soa->soa_no,
            $soa->td_number,
            $soa->barangay,
            number_format((float) $soa->total_amount_due, 2),
            $soa->valid_until ? Carbon::parse($soa->valid_until)->format('F d, Y') : 'N/A'
        );

        TaxpayerNotification::create([
            'taxpayer_id' => $taxpayer?->id,
            'tax_declaration_id' => $soa->tax_declaration_id,
            'statement_of_account_id' => $soa->id,
            'channel' => 'in-app/email',
            'recipient_email' => $recipientEmail,
            'subject' => $subject,
            'message' => $message,
        ]);

        $soa->update(['notified_at' => now()]);

        if ($recipientEmail) {
            try {
                Mail::raw($message, function ($mail) use ($recipientEmail, $subject) {
                    $mail->to($recipientEmail)->subject($subject);
                });
            } catch (\Throwable $e) {
                Log::warning("Failed to send SOA email notification: {$e->getMessage()}");
            }
        }
    }
}
