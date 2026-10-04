<?php

namespace App\Services;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\Assessment;
use App\Models\AssessmentItem;
use App\Models\AssessmentStatusHistory;
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

            $computed = $this->calculator->computeTotals($itemsData, $isTaxable);

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
                    'effective_year' => (int) Arr::get($payload, 'effective_year', date('Y')),
                    'effective_quarter' => (int) Arr::get($payload, 'effective_quarter', 1),
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
