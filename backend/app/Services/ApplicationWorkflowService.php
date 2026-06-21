<?php

namespace App\Services;

use App\Constants\DocumentTypes;
use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\ApplicationStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApplicationWorkflowService
{
    public function __construct(
        private readonly AuditService $audit,
        private readonly DocumentStorageService $documents,
    ) {}

    public function submitNew(Application $application, User $user): Application
    {
        $application->verification_status = 'Verified';
        $application->save();

        $this->transition(
            $application,
            ApplicationStatus::UnderReview,
            $user,
            ApplicationStatus::Draft,
            null,
            'Submitted for Review',
        );

        return $application->fresh();
    }

    public function submitDraft(Application $application, User $user): Application
    {
        $missing = $this->documents->missingRequired($application);
        if ($missing) {
            throw ValidationException::withMessages([
                'documents' => 'Please upload required documents: '.implode(', ', $missing),
            ]);
        }

        $application->verification_status = 'Verified';
        $application->save();

        $this->transition($application, ApplicationStatus::UnderReview, $user, ApplicationStatus::Draft, 'Submitted for Review');

        return $application->fresh();
    }

    public function resubmit(Application $application, User $user): Application
    {
        if ($application->status !== ApplicationStatus::Returned) {
            throw ValidationException::withMessages(['status' => 'Only returned applications can be resubmitted.']);
        }

        $application->verification_status = 'Verified';
        $application->remarks = 'Resubmitted by Assessment Clerk';
        $application->save();

        $this->transition($application, ApplicationStatus::UnderReview, $user, ApplicationStatus::Returned, 'Resubmitted by Assessment Clerk');

        return $application->fresh();
    }



    public function approve(Application $application, User $user, string $remarks): Application
    {
        $this->transition($application, ApplicationStatus::Active, $user, ApplicationStatus::UnderReview, $remarks, 'Activated');
        $application->remarks = $remarks;
        $application->save();

        return $application->fresh();
    }

    public function return(Application $application, User $user, string $reason): Application
    {
        $this->transition($application, ApplicationStatus::Returned, $user, ApplicationStatus::UnderReview, $reason, 'Returned');
        $application->remarks = $reason;
        $application->save();

        return $application->fresh();
    }

    public function reject(Application $application, User $user, string $reason): Application
    {
        $this->transition($application, ApplicationStatus::Rejected, $user, ApplicationStatus::UnderReview, $reason, 'Rejected');
        $application->remarks = $reason;
        $application->save();

        return $application->fresh();
    }



    private function transition(
        Application $application,
        ApplicationStatus $to,
        User $user,
        ?ApplicationStatus $expectedFrom = null,
        ?string $remarks = null,
        ?string $assessorAction = null,
    ): void {
        DB::transaction(function () use ($application, $to, $user, $expectedFrom, $remarks, $assessorAction) {
            $from = $application->status;

            if ($expectedFrom && $from !== $expectedFrom) {
                throw ValidationException::withMessages([
                    'status' => "Invalid transition from {$from->value} to {$to->value}.",
                ]);
            }

            $application->status = $to;
            $application->last_assessor_action = $assessorAction ?? $this->defaultAssessorAction($to);
            if ($to !== ApplicationStatus::Draft && ! $application->submitted_at) {
                $application->submitted_at = now();
            }
            $application->save();

            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'from_status' => $from->value,
                'to_status' => $to->value,
                'actor_id' => $user->id,
                'remarks' => $remarks,
                'created_at' => now(),
            ]);

            $this->audit->log($user, "Status changed to {$to->value}", $from->value, $to->value);
        });
    }

    private function defaultAssessorAction(ApplicationStatus $status): string
    {
        return match ($status) {
            ApplicationStatus::Draft => 'Draft',
            ApplicationStatus::UnderReview => 'Under Review',
            ApplicationStatus::Returned => 'Returned',
            ApplicationStatus::Rejected => 'Rejected',
            ApplicationStatus::Active => 'Activated',
        };
    }
}
