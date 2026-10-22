<?php

namespace App\Services;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AssessmentStatusHistory;
use App\Models\Reassessment;
use App\Models\TaxDeclaration;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssessmentWorkflowService
{
    public function __construct(
        private readonly AppraisalCalculationService $calculator,
    ) {}

    /**
     * Save or update draft assessment details.
     */
    public function saveDraft(Application $application, array $payload, User $user): Assessment
    {
        $existing = $application->assessment;
        if ($existing && ! in_array($existing->status, ['Draft', 'Returned'])) {
            throw ValidationException::withMessages([
                'status' => 'This assessment is locked and can no longer be edited.',
            ]);
        }

        return DB::transaction(function () use ($application, $payload, $user) {
            $isTaxable = (bool) Arr::get($payload, 'is_taxable', !$application->tax_exempt);
            $itemsData = Arr::get($payload, 'items', []);
            $annualIncreasePct = (float) Arr::get($payload, 'annual_tax_increase_pct', 0.0);
            $annualIncreaseEnabled = (bool) Arr::get($payload, 'annual_tax_increase_enabled', false);
            $effectiveYear = (int) Arr::get($payload, 'effective_year', date('Y'));
            $effectiveQuarter = (int) Arr::get($payload, 'effective_quarter', 1);

            $computed = $this->calculator->computeTotals($itemsData, $isTaxable, [
                'annual_tax_increase_pct' => $annualIncreasePct,
                'annual_tax_increase_enabled' => $annualIncreaseEnabled,
                'effective_year' => $effectiveYear,
                'barangay' => $application->barangay ?? '',
            ]);

            /** @var Assessment $assessment */
            $assessment = Assessment::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'pin' => Arr::get($payload, 'pin', $application->propertyDetail?->pin ?? ''),
                    'arp_number' => Arr::get($payload, 'arp_number', $application->propertyDetail?->arp_number ?? ''),
                    'total_market_value' => $computed['total_market_value'],
                    'total_assessed_value' => $computed['total_assessed_value'],
                    'taxability_status' => $isTaxable ? 'Taxable' : 'Exempt',
                    'exemption_reason' => Arr::get($payload, 'exemption_reason', $application->exemption_notes),
                    'effective_year' => $effectiveYear,
                    'effective_quarter' => $effectiveQuarter,
                    'annual_tax_increase_pct' => $annualIncreasePct,
                    'annual_tax_increase_enabled' => $annualIncreaseEnabled,
                    'status' => 'Draft',
                    'remarks' => Arr::get($payload, 'remarks', ''),
                    'created_by' => $user->id,
                ]
            );

            // Replace items
            $assessment->items()->delete();
            foreach ($computed['items'] as $item) {
                $assessment->items()->create($item);
            }

            $this->recordHistory($assessment, null, 'Draft', $user, 'Assessment draft created/updated by clerk');

            return $assessment->fresh(['items', 'taxDeclaration', 'statusHistories']);
        });
    }

    /**
     * Submit assessment for Municipal Assessor review.
     */
    public function submitForReview(Assessment $assessment, User $user): Assessment
    {
        if (!in_array($assessment->status, ['Draft', 'Returned'])) {
            throw ValidationException::withMessages(['status' => 'Only draft or returned assessments can be submitted.']);
        }

        return DB::transaction(function () use ($assessment, $user) {
            $prevStatus = $assessment->status;
            $assessment->update([
                'status' => 'UnderReview',
                'submitted_at' => now(),
            ]);

            // Update application status to match workflow
            $assessment->application->update([
                'status' => ApplicationStatus::UnderReview,
                'last_assessor_action' => 'Pending Review',
            ]);

            $this->recordHistory($assessment, $prevStatus, 'UnderReview', $user, 'Assessment submitted for Municipal Assessor review');

            return $assessment->fresh(['items', 'taxDeclaration', 'statusHistories']);
        });
    }

    /**
     * Approve assessment decision (Municipal Assessor).
     */
    public function approve(Assessment $assessment, User $assessor, string $remarks = ''): Assessment
    {
        if ($assessment->status !== 'UnderReview') {
            throw ValidationException::withMessages(['status' => 'Only assessments under review can be approved.']);
        }

        return DB::transaction(function () use ($assessment, $assessor, $remarks) {
            $prevStatus = $assessment->status;
            $assessment->update([
                'status' => 'Approved',
                'reviewed_by' => $assessor->id,
                'reviewed_at' => now(),
                'remarks' => $remarks ?: 'Assessment approved by Municipal Assessor',
            ]);

            $this->recordHistory($assessment, $prevStatus, 'Approved', $assessor, $remarks ?: 'Approved by Municipal Assessor');

            return $assessment->fresh(['items', 'taxDeclaration', 'statusHistories']);
        });
    }

    /**
     * Return assessment back to Clerk for corrections (Municipal Assessor).
     */
    public function returnToClerk(Assessment $assessment, User $assessor, string $reason): Assessment
    {
        if ($assessment->status !== 'UnderReview') {
            throw ValidationException::withMessages(['status' => 'Only assessments under review can be returned.']);
        }

        return DB::transaction(function () use ($assessment, $assessor, $reason) {
            $prevStatus = $assessment->status;
            $assessment->update([
                'status' => 'Returned',
                'reviewed_by' => $assessor->id,
                'reviewed_at' => now(),
                'remarks' => $reason,
            ]);

            $assessment->application->update([
                'status' => ApplicationStatus::Returned,
                'last_assessor_action' => 'Returned',
                'remarks' => $reason,
            ]);

            $this->recordHistory($assessment, $prevStatus, 'Returned', $assessor, "Returned to Clerk: {$reason}");

            return $assessment->fresh(['items', 'taxDeclaration', 'statusHistories']);
        });
    }

    /**
     * Reject assessment (Municipal Assessor).
     */
    public function reject(Assessment $assessment, User $assessor, string $reason): Assessment
    {
        if ($assessment->status !== 'UnderReview') {
            throw ValidationException::withMessages(['status' => 'Only assessments under review can be rejected.']);
        }

        return DB::transaction(function () use ($assessment, $assessor, $reason) {
            $prevStatus = $assessment->status;
            $assessment->update([
                'status' => 'Rejected',
                'reviewed_by' => $assessor->id,
                'reviewed_at' => now(),
                'remarks' => $reason,
            ]);

            $assessment->application->update([
                'status' => ApplicationStatus::Rejected,
                'last_assessor_action' => 'Rejected',
                'remarks' => $reason,
            ]);

            $this->recordHistory($assessment, $prevStatus, 'Rejected', $assessor, "Rejected: {$reason}");

            return $assessment->fresh(['items', 'taxDeclaration', 'statusHistories']);
        });
    }

    /**
     * Authorize final assessment and issue official Tax Declaration (Municipal Assessor).
     */
    public function authorize(Assessment $assessment, User $assessor): TaxDeclaration
    {
        if ($assessment->status !== 'Approved') {
            throw ValidationException::withMessages(['status' => 'Assessment must be approved before authorizing final Tax Declaration.']);
        }

        return DB::transaction(function () use ($assessment, $assessor) {
            $prevStatus = $assessment->status;
            $assessment->update([
                'status' => 'Authorized',
                'authorized_by' => $assessor->id,
                'authorized_at' => now(),
            ]);

            $year = date('Y');
            $last = TaxDeclaration::query()
                ->where('td_number', 'like', "TD-{$year}-%")
                ->lockForUpdate()
                ->orderByDesc('td_number')
                ->value('td_number');
            $seq = $last ? ((int) substr($last, -4)) + 1 : 1;
            $tdNumber = sprintf('TD-%s-%04d', $year, $seq);
            $app = $assessment->application;

            /** @var TaxDeclaration $td */
            $td = TaxDeclaration::updateOrCreate(
                ['assessment_id' => $assessment->id],
                [
                    'td_number' => $tdNumber,
                    'previous_td_number' => $app->propertyDetail?->arp_number ?? null,
                    'owner_name' => $app->taxpayer_name,
                    'barangay' => $app->barangay,
                    'total_market_value' => $assessment->total_market_value,
                    'total_assessed_value' => $assessment->total_assessed_value,
                    'effectivity_date' => now()->toDateString(),
                    'status' => 'Active',
                ]
            );

            $app->update([
                'status' => ApplicationStatus::Active,
                'last_assessor_action' => 'Activated',
                'remarks' => "Tax Declaration {$tdNumber} authorized and activated.",
            ]);

            $this->recordHistory($assessment, $prevStatus, 'Authorized', $assessor, "Authorized Tax Declaration {$tdNumber}");

            return $td;
        });
    }

    /**
     * Preview the effect of a reassessment (price increase or decrease).
     */
    public function previewReassessment(Assessment $assessment, array $payload): array
    {
        $adjustmentPct = (float) Arr::get($payload, 'adjustment_pct', 0.0);
        $type = Arr::get($payload, 'reassessment_type', $adjustmentPct >= 0 ? 'Increase' : 'Decrease');
        $prevMv = (float) $assessment->total_market_value;
        $prevAv = (float) $assessment->total_assessed_value;

        $factor = 1 + ($adjustmentPct / 100.0);
        $newMv = round($prevMv * $factor, 2);
        $newAv = round($prevAv * $factor, 2);

        $diffMv = round($newMv - $prevMv, 2);
        $diffAv = round($newAv - $prevAv, 2);

        $prevTax = round($prevAv * 0.02, 2);
        $newTax = round($newAv * 0.02, 2);
        $diffTax = round($newTax - $prevTax, 2);

        return [
            'reassessment_type' => $type,
            'adjustment_pct' => $adjustmentPct,
            'previous_market_value' => $prevMv,
            'new_market_value' => $newMv,
            'difference_market_value' => $diffMv,
            'previous_assessed_value' => $prevAv,
            'new_assessed_value' => $newAv,
            'difference_assessed_value' => $diffAv,
            'previous_annual_tax' => $prevTax,
            'new_annual_tax' => $newTax,
            'difference_annual_tax' => $diffTax,
            'effective_year' => (int) Arr::get($payload, 'effective_year', date('Y')),
            'effective_quarter' => (int) Arr::get($payload, 'effective_quarter', 1),
        ];
    }

    /**
     * Create a Reassessment request (Clerk or Assessor).
     */
    public function createReassessment(Assessment $assessment, array $payload, User $user): Reassessment
    {
        $preview = $this->previewReassessment($assessment, $payload);

        return DB::transaction(function () use ($assessment, $payload, $preview, $user) {
            $reassessment = Reassessment::create([
                'assessment_id' => $assessment->id,
                'application_id' => $assessment->application_id,
                'reassessment_type' => Arr::get($payload, 'reassessment_type', $preview['reassessment_type']),
                'adjustment_mode' => Arr::get($payload, 'adjustment_mode', 'percentage'),
                'adjustment_pct' => $preview['adjustment_pct'],
                'previous_market_value' => $preview['previous_market_value'],
                'new_market_value' => $preview['new_market_value'],
                'previous_assessed_value' => $preview['previous_assessed_value'],
                'new_assessed_value' => $preview['new_assessed_value'],
                'effective_year' => $preview['effective_year'],
                'effective_quarter' => $preview['effective_quarter'],
                'reason' => Arr::get($payload, 'reason', 'Schedule of Market Value price adjustment'),
                'remarks' => Arr::get($payload, 'remarks'),
                'status' => 'Pending',
                'created_by' => $user->id,
            ]);

            $this->recordHistory(
                $assessment,
                $assessment->status,
                $assessment->status,
                $user,
                "Reassessment requested: {$reassessment->reassessment_type} of {$reassessment->adjustment_pct}% ({$reassessment->reason})"
            );

            return $reassessment->fresh(['creator', 'approver', 'assessment']);
        });
    }

    /**
     * Approve and apply a Reassessment (Municipal Assessor).
     */
    public function approveReassessment(Reassessment $reassessment, User $assessor, ?string $remarks = null): Reassessment
    {
        if ($reassessment->status !== 'Pending') {
            throw ValidationException::withMessages([
                'status' => 'Only pending reassessments can be approved.',
            ]);
        }

        return DB::transaction(function () use ($reassessment, $assessor, $remarks) {
            $assessment = $reassessment->assessment;
            $factor = 1 + ($reassessment->adjustment_pct / 100.0);

            // Scale assessment items proportionally
            foreach ($assessment->items as $item) {
                $item->unit_value = round((float) $item->unit_value * $factor, 2);
                $item->base_market_value = round((float) $item->base_market_value * $factor, 2);
                $item->market_value = round((float) $item->market_value * $factor, 2);
                $item->assessed_value = round((float) $item->assessed_value * $factor, 2);
                $item->save();
            }

            // Update assessment overall values
            $assessment->total_market_value = $reassessment->new_market_value;
            $assessment->total_assessed_value = $reassessment->new_assessed_value;
            $assessment->effective_year = $reassessment->effective_year;
            $assessment->effective_quarter = $reassessment->effective_quarter;
            $assessment->save();

            // If Tax Declaration exists, update its values
            if ($assessment->taxDeclaration) {
                $assessment->taxDeclaration->update([
                    'total_market_value' => $reassessment->new_market_value,
                    'total_assessed_value' => $reassessment->new_assessed_value,
                ]);
            }

            $reassessment->update([
                'status' => 'Approved',
                'approved_by' => $assessor->id,
                'approved_at' => now(),
                'remarks' => $remarks ?: $reassessment->remarks,
            ]);

            $this->recordHistory(
                $assessment,
                $assessment->status,
                $assessment->status,
                $assessor,
                "Reassessment approved & applied: {$reassessment->reassessment_type} of {$reassessment->adjustment_pct}%. MV updated to ₱" . number_format((float)$reassessment->new_market_value, 2)
            );

            return $reassessment->fresh(['creator', 'approver', 'assessment']);
        });
    }

    /**
     * Reject a Reassessment request (Municipal Assessor).
     */
    public function rejectReassessment(Reassessment $reassessment, User $assessor, string $reason): Reassessment
    {
        if ($reassessment->status !== 'Pending') {
            throw ValidationException::withMessages([
                'status' => 'Only pending reassessments can be rejected.',
            ]);
        }

        return DB::transaction(function () use ($reassessment, $assessor, $reason) {
            $reassessment->update([
                'status' => 'Rejected',
                'approved_by' => $assessor->id,
                'approved_at' => now(),
                'remarks' => $reason,
            ]);

            $this->recordHistory(
                $reassessment->assessment,
                $reassessment->assessment->status,
                $reassessment->assessment->status,
                $assessor,
                "Reassessment rejected: {$reason}"
            );

            return $reassessment->fresh(['creator', 'approver', 'assessment']);
        });
    }

    private function recordHistory(Assessment $assessment, ?string $from, string $to, User $actor, string $remarks = ''): void
    {
        AssessmentStatusHistory::create([
            'assessment_id' => $assessment->id,
            'from_status' => $from,
            'to_status' => $to,
            'actor_id' => $actor->id,
            'remarks' => $remarks,
            'created_at' => now(),
        ]);
    }
}
