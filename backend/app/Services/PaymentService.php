<?php

namespace App\Services;

use App\Enums\CorrectionStatus;
use App\Enums\PaymentStatus;
use App\Enums\SoaStatus;
use App\Models\BillingSequence;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\PaymentCorrectionRequest;
use App\Models\StatementOfAccount;
use App\Models\TaxBillInstallment;
use App\Models\TaxpayerNotification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly BillingSettingsService $settings,
        private readonly TaxComputationService $calculator,
        private readonly AuditService $audit,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * Preview how a tendered amount will be allocated against an issued SOA.
     */
    public function previewPayment(
        StatementOfAccount $soa,
        float $amountTendered,
        ?string $paymentDate = null
    ): array {
        if ($soa->status !== SoaStatus::Issued) {
            throw ValidationException::withMessages([
                'soa' => "Cannot pay an SOA with status [{$soa->status->value}]. An approved and issued SOA is required.",
            ]);
        }

        $payDate = $paymentDate ? Carbon::parse($paymentDate) : now();

        $config = $this->settings->all();
        $advancePct = (float) $config['advanceDiscountPct'];
        $promptPct = (float) $config['promptDiscountPct'];

        // Retrieve items and their installments
        $items = $soa->items()->with('installment.taxBill')->get();

        $allocations = [];
        $cashRemaining = max(0.0, $amountTendered);
        $totalDiscount = 0.0;
        $totalGrossDue = 0.0;

        foreach ($items as $item) {
            $inst = $item->installment;
            if (! $inst) continue;

            $basicBal = $inst->basic_balance;
            $sefBal = $inst->sef_balance;
            $princBal = $inst->principal_balance;
            $penaltyDue = (float) $item->penalty_amount;

            $grossItemDue = round($princBal + $penaltyDue, 2);
            $totalGrossDue += $grossItemDue;

            // Check discount eligibility on remaining principal (if no penalties and paid on/before due date)
            $discountInfo = [
                'eligible' => false,
                'type' => null,
                'discount_amount' => 0.0,
            ];

            if ($penaltyDue <= 0.001 && $princBal > 0) {
                $discountInfo = $this->calculator->evaluateDiscount(
                    $inst->taxBill->taxable_year,
                    $inst->due_date,
                    $princBal,
                    $payDate,
                    $advancePct,
                    $promptPct
                );
            }

            $itemDiscount = (float) $discountInfo['discount_amount'];
            // Net cash needed to settle this installment
            $netNeeded = max(0.0, round($grossItemDue - $itemDiscount, 2));

            // Allocate cash
            $cashToApply = min($cashRemaining, $netNeeded);

            // Within cash applied: covers penalty first, then basic and SEF proportionally
            $penApplied = min($cashToApply, $penaltyDue);
            $princCash = max(0.0, $cashToApply - $penApplied);

            $basicApplied = 0.0;
            $sefApplied = 0.0;
            if ($princBal > 0 && $princCash > 0) {
                // If fully paying the net principal + discount
                if ($cashToApply >= $netNeeded) {
                    $basicApplied = $basicBal;
                    $sefApplied = $sefBal;
                } else {
                    $ratio = $basicBal / $princBal;
                    $basicApplied = round($princCash * $ratio, 2);
                    $sefApplied = round($princCash - $basicApplied, 2);
                }
            }

            $appliedDiscount = ($cashToApply >= $netNeeded) ? $itemDiscount : 0.0;
            $totalDiscount += $appliedDiscount;

            $cashRemaining = max(0.0, round($cashRemaining - $cashToApply, 2));

            $allocations[] = [
                'installment_id' => $inst->id,
                'taxable_year' => $inst->taxBill->taxable_year,
                'quarter' => $inst->quarter,
                'due_date' => $inst->due_date,
                'basic_balance' => $basicBal,
                'sef_balance' => $sefBal,
                'penalty_due' => $penaltyDue,
                'gross_due' => $grossItemDue,
                'discount_eligible' => $discountInfo['eligible'],
                'discount_type' => $discountInfo['type'],
                'discount_amount' => $appliedDiscount,
                'net_needed' => $netNeeded,
                'cash_applied' => $cashToApply,
                'basic_applied' => $basicApplied,
                'sef_applied' => $sefApplied,
                'penalty_applied' => $penApplied,
                'remaining_principal' => max(0.0, round($princBal - ($basicApplied + $sefApplied), 2)),
                'remaining_penalty' => max(0.0, round($penaltyDue - $penApplied, 2)),
            ];
        }

        $totalCashApplied = round($amountTendered - $cashRemaining, 2);
        $changeAmount = $cashRemaining;
        $netPayableTotal = max(0.0, round($totalGrossDue - $totalDiscount, 2));
        $balanceAfter = max(0.0, round($netPayableTotal - $totalCashApplied, 2));

        return [
            'soa_no' => $soa->soa_no,
            'owner_name' => $soa->owner_name,
            'td_number' => $soa->td_number,
            'as_of_date' => $soa->as_of_date,
            'payment_date' => $payDate->toDateString(),
            'total_gross_due' => round($totalGrossDue, 2),
            'total_discount' => round($totalDiscount, 2),
            'net_amount_due' => $netPayableTotal,
            'amount_tendered' => round($amountTendered, 2),
            'amount_paid' => $totalCashApplied,
            'change_amount' => round($changeAmount, 2),
            'balance_after' => round($balanceAfter, 2),
            'is_full_payment' => $balanceAfter <= 0.001,
            'allocations' => $allocations,
        ];
    }

    /**
     * Record an onsite payment, generate Official Receipt (OR), and post allocations.
     */
    public function recordPayment(StatementOfAccount $soa, User $cashier, array $payload): Payment
    {
        if ($soa->status !== SoaStatus::Issued) {
            throw ValidationException::withMessages([
                'soa' => "Cannot process payment. SOA status is [{$soa->status->value}]. Must be Issued.",
            ]);
        }

        $amountTendered = (float) Arr::get($payload, 'amount_tendered', 0);
        if ($amountTendered <= 0) {
            throw ValidationException::withMessages([
                'amount_tendered' => 'Amount tendered must be greater than zero.',
            ]);
        }

        $paymentDate = Arr::get($payload, 'payment_date', now()->toDateTimeString());
        $paymentMethod = Arr::get($payload, 'payment_method', 'Cash');
        $referenceNo = Arr::get($payload, 'reference_no');
        $remarks = Arr::get($payload, 'remarks');
        $payorName = Arr::get($payload, 'payor_name') ?: $soa->owner_name;

        $preview = $this->previewPayment($soa, $amountTendered, $paymentDate);

        if ($preview['amount_paid'] <= 0) {
            throw ValidationException::withMessages([
                'amount_tendered' => 'The payment amount could not be applied to any outstanding dues.',
            ]);
        }

        return DB::transaction(function () use (
            $soa,
            $cashier,
            $preview,
            $amountTendered,
            $paymentDate,
            $paymentMethod,
            $referenceNo,
            $remarks,
            $payorName
        ) {
            $yearStr = date('Y');
            $orNumber = BillingSequence::nextNumber(sprintf('OR-%s', $yearStr), '%s-%06d');

            /** @var Payment $payment */
            $payment = Payment::create([
                'or_number' => $orNumber,
                'statement_of_account_id' => $soa->id,
                'tax_declaration_id' => $soa->tax_declaration_id,
                'taxpayer_id' => $soa->taxpayer_id,
                'payor_name' => $payorName,
                'barangay' => $soa->barangay,
                'payment_date' => $paymentDate,
                'amount_due' => $preview['net_amount_due'],
                'discount_amount' => $preview['total_discount'],
                'amount_paid' => $preview['amount_paid'],
                'amount_tendered' => $amountTendered,
                'change_amount' => $preview['change_amount'],
                'balance_after' => $preview['balance_after'],
                'payment_method' => $paymentMethod,
                'reference_no' => $referenceNo,
                'remarks' => $remarks,
                'cashier_id' => $cashier->id,
                'status' => PaymentStatus::Posted,
            ]);

            // Save individual allocations and update installment caches
            foreach ($preview['allocations'] as $alloc) {
                if ($alloc['cash_applied'] <= 0 && $alloc['discount_amount'] <= 0) {
                    continue;
                }

                $payment->allocations()->create([
                    'tax_bill_installment_id' => $alloc['installment_id'],
                    'taxable_year' => $alloc['taxable_year'],
                    'quarter' => $alloc['quarter'],
                    'basic_amount' => $alloc['basic_applied'],
                    'sef_amount' => $alloc['sef_applied'],
                    'penalty_amount' => $alloc['penalty_applied'],
                    'discount_amount' => $alloc['discount_amount'],
                    'discount_type' => $alloc['discount_type'],
                    'total_amount' => $alloc['cash_applied'],
                ]);

                // Trigger installment and bill status recomputation
                /** @var TaxBillInstallment $inst */
                $inst = TaxBillInstallment::find($alloc['installment_id']);
                $inst?->recomputeFromAllocations();
            }

            // If SOA is completely settled, update its status
            if ($preview['is_full_payment']) {
                $soa->status = SoaStatus::Settled;
                $soa->save();
            }

            $this->audit->log($cashier, 'Recorded Payment & Issued OR', $payment->or_number, "Paid PHP {$payment->amount_paid}");

            $this->notifyPayment($payment);

            // Notify Revenue Clerks of new posted collection
            $this->notifications->notifyRole(
                \App\Enums\UserRole::RevenueClerk,
                'New Tax Collection Recorded',
                "Cashier {$cashier->full_name} posted payment of PHP " . number_format($payment->amount_paid, 2) . " under OR {$payment->or_number} for {$payment->payor_name}.",
                'payment_posted',
                '/revenue/bills'
            );

            return $payment->fresh(['allocations.installment.taxBill', 'cashier', 'taxDeclaration', 'statementOfAccount']);
        });
    }

    /**
     * Cashier submits a request to cancel/correct a recorded payment.
     */
    public function requestCorrection(Payment $payment, User $cashier, string $reason, string $type = 'Cancellation'): PaymentCorrectionRequest
    {
        if ($payment->status !== PaymentStatus::Posted) {
            throw ValidationException::withMessages([
                'payment' => 'Only posted payments can be corrected.',
            ]);
        }

        $existing = $payment->correctionRequests()->where('status', CorrectionStatus::Pending->value)->first();
        if ($existing) {
            throw ValidationException::withMessages([
                'payment' => 'There is already a pending correction request for this payment.',
            ]);
        }

        $req = PaymentCorrectionRequest::create([
            'payment_id' => $payment->id,
            'request_type' => $type,
            'reason' => $reason,
            'requested_by' => $cashier->id,
            'status' => CorrectionStatus::Pending,
        ]);

        $this->audit->log($cashier, 'Requested Payment Correction', $payment->or_number, $reason);

        // Notify Treasurers of pending payment cancellation request
        $this->notifications->notifyRole(
            \App\Enums\UserRole::Treasurer,
            'Payment Cancellation Requested',
            "Cashier {$cashier->full_name} requested cancellation for OR {$payment->or_number} (Amount: PHP " . number_format($payment->amount_paid, 2) . "). Reason: {$reason}",
            'correction_pending',
            '/treasurer/correction-approvals'
        );

        return $req->fresh(['payment', 'requester']);
    }

    /**
     * Treasurer reviews (approves or denies) a payment correction request.
     * When approved: the payment is marked Cancelled (NEVER deleted) and balances are recomputed.
     */
    public function reviewCorrection(
        PaymentCorrectionRequest $correctionRequest,
        User $treasurer,
        bool $approved,
        string $remarks = ''
    ): PaymentCorrectionRequest {
        if ($correctionRequest->status !== CorrectionStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'This correction request has already been reviewed.',
            ]);
        }

        return DB::transaction(function () use ($correctionRequest, $treasurer, $approved, $remarks) {
            $payment = $correctionRequest->payment;

            if ($approved) {
                $correctionRequest->status = CorrectionStatus::Approved;
                $correctionRequest->reviewed_by = $treasurer->id;
                $correctionRequest->reviewed_at = now();
                $correctionRequest->review_remarks = $remarks ?: 'Approved by Municipal Treasurer';
                $correctionRequest->save();

                // Cancel the payment (preserve record for audit trail)
                $payment->status = PaymentStatus::Cancelled;
                $payment->cancelled_at = now();
                $payment->cancelled_by = $treasurer->id;
                $payment->cancellation_reason = $correctionRequest->reason;
                $payment->save();

                // Recompute all affected installments and bills
                foreach ($payment->allocations as $alloc) {
                    $alloc->installment?->recomputeFromAllocations();
                }

                // If SOA was Settled, reopen it to Issued
                $soa = $payment->statementOfAccount;
                if ($soa && $soa->status === SoaStatus::Settled) {
                    $soa->status = SoaStatus::Issued;
                    $soa->save();
                }

                $this->audit->log($treasurer, 'Approved Payment Cancellation', $payment->or_number, 'Cancelled');

                // Notify the Cashier who submitted the request
                $this->notifications->notifyUser(
                    $correctionRequest->requested_by,
                    'Payment Cancellation Approved',
                    "Treasurer approved your cancellation request for OR {$payment->or_number}.",
                    'correction_approved',
                    '/cashier/receipts'
                );

                // Notify Taxpayer
                $this->notifications->notifyTaxpayer(
                    $payment->taxpayer_id,
                    'Official Receipt Cancelled',
                    "Payment receipt OR {$payment->or_number} was officially cancelled by the Municipal Treasurer.",
                    'payment_cancelled',
                    '/taxpayer/portal'
                );
            } else {
                $correctionRequest->status = CorrectionStatus::Denied;
                $correctionRequest->reviewed_by = $treasurer->id;
                $correctionRequest->reviewed_at = now();
                $correctionRequest->review_remarks = $remarks ?: 'Denied by Municipal Treasurer';
                $correctionRequest->save();

                $this->audit->log($treasurer, 'Denied Payment Cancellation', $payment->or_number, "Denied: {$remarks}");

                // Notify the Cashier who submitted the request
                $this->notifications->notifyUser(
                    $correctionRequest->requested_by,
                    'Payment Cancellation Rejected',
                    "Treasurer denied your cancellation request for OR {$payment->or_number}. Reason: {$remarks}",
                    'correction_denied',
                    '/cashier/receipts'
                );
            }

            return $correctionRequest->fresh(['payment', 'requester', 'reviewer']);
        });
    }

    /**
     * Notify taxpayer upon payment posting.
     */
    public function notifyPayment(Payment $payment): void
    {
        $taxpayer = $payment->taxpayer;
        $recipientEmail = $taxpayer?->email;

        $subject = "Official Receipt: {$payment->or_number} - Payment Acknowledged";
        $message = sprintf(
            "Dear %s,\n\nWe acknowledge receipt of your payment for Real Property Tax under Official Receipt No. %s.\n\nAmount Paid: PHP %s\nPayment Date: %s\nPayment Method: %s\nRemaining Balance: PHP %s\n\nThank you for paying your real property taxes on time.\n\nMunicipality of Magarao",
            $payment->payor_name,
            $payment->or_number,
            number_format((float) $payment->amount_paid, 2),
            Carbon::parse($payment->payment_date)->format('F d, Y h:i A'),
            $payment->payment_method,
            number_format((float) $payment->balance_after, 2)
        );

        TaxpayerNotification::create([
            'taxpayer_id' => $taxpayer?->id,
            'tax_declaration_id' => $payment->tax_declaration_id,
            'statement_of_account_id' => $payment->statement_of_account_id,
            'payment_id' => $payment->id,
            'channel' => 'in-app/email',
            'recipient_email' => $recipientEmail,
            'subject' => $subject,
            'message' => $message,
        ]);

        $this->notifications->notifyTaxpayer(
            $taxpayer?->id,
            "Payment Confirmed - OR {$payment->or_number}",
            "Official Receipt {$payment->or_number} posted for PHP " . number_format((float) $payment->amount_paid, 2) . ". Remaining balance: PHP " . number_format((float) $payment->balance_after, 2),
            'payment_received',
            '/taxpayer/portal'
        );

        if ($recipientEmail) {
            try {
                Mail::raw($message, function ($mail) use ($recipientEmail, $subject) {
                    $mail->to($recipientEmail)->subject($subject);
                });
            } catch (\Throwable $e) {
                Log::warning("Failed to send payment email notification: {$e->getMessage()}");
            }
        }
    }
}
