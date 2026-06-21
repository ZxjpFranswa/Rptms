<?php

namespace App\Policies;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function view(User $user, Application $application): bool
    {
        return true;
    }

    public function update(User $user, Application $application): bool
    {
        if ($user->role === UserRole::Administrator) {
            return true;
        }

        if ($user->role !== UserRole::AssessmentClerk) {
            return false;
        }

        return in_array($application->status, [ApplicationStatus::Draft, ApplicationStatus::Returned], true);
    }

    public function review(User $user): bool
    {
        return $user->role === UserRole::MunicipalAssessor;
    }
}
