<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Taxpayer;
use App\Models\TaxpayerNotification;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a notification to a specific user by ID or User model.
     */
    public function notifyUser(User|string|null $user, string $title, string $message, string $type = 'info', ?string $actionUrl = null): ?UserNotification
    {
        if (! $user) {
            return null;
        }

        $userId = $user instanceof User ? $user->id : $user;

        try {
            return UserNotification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'action_url' => $actionUrl,
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Failed to create user notification for user {$userId}: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Send a notification to all active users with a specific role.
     * e.g. UserRole::Treasurer, UserRole::RevenueClerk, UserRole::Cashier
     */
    public function notifyRole(UserRole|string $role, string $title, string $message, string $type = 'info', ?string $actionUrl = null): array
    {
        $roleValue = $role instanceof UserRole ? $role->value : (string) $role;

        $users = User::where('role', $roleValue)->where('status', 'Active')->get();
        if ($users->isEmpty()) {
            $users = User::where('role', $roleValue)->get();
        }

        $created = [];
        foreach ($users as $user) {
            $notif = $this->notifyUser($user, $title, $message, $type, $actionUrl);
            if ($notif) {
                $created[] = $notif;
            }
        }

        return $created;
    }

    /**
     * Send a notification to a taxpayer, and to the taxpayer's user account if linked.
     */
    public function notifyTaxpayer(?string $taxpayerId, string $title, string $message, string $type = 'info', ?string $actionUrl = null): void
    {
        if (! $taxpayerId) {
            return;
        }

        $taxpayer = Taxpayer::find($taxpayerId);

        // 1. In-app / email taxpayer notification record
        try {
            TaxpayerNotification::create([
                'taxpayer_id' => $taxpayerId,
                'channel' => 'in-app',
                'recipient_email' => $taxpayer?->email,
                'subject' => $title,
                'message' => $message,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Failed to create TaxpayerNotification: {$e->getMessage()}");
        }

        // 2. User account notification if user exists for this taxpayer
        $user = User::where('taxpayer_id', $taxpayerId)->first();
        if (! $user && $taxpayer?->email) {
            $user = User::where('email', $taxpayer->email)->first();
        }

        if ($user) {
            $this->notifyUser($user, $title, $message, $type, $actionUrl ?? '/taxpayer/portal');
        }
    }

    /**
     * Pre-populate realistic contextual alerts if a user has no notifications yet.
     */
    public function seedContextualAlerts(User $user): void
    {
        if (UserNotification::where('user_id', $user->id)->exists()) {
            return;
        }

        $role = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;

        switch ($role) {
            case 'Revenue Clerk':
                $this->notifyUser($user, 'Time to Generate 2026 Tax Bills', 'Taxable Year 2026 is active. Ensure all active Tax Declarations have annual tax bills generated.', 'bill_due', '/revenue/bills');
                $this->notifyUser($user, 'Treasurer Approved SOA', 'Treasurer Ramon Gomez approved Statement of Account for Maria Santos (TD-2026-0001). Ready for collection.', 'soa_approved', '/revenue/soas');
                break;

            case 'Treasurer':
                $this->notifyUser($user, 'New SOA Pending Penalty Review', 'Revenue Clerk submitted SOA for Roberto Garcia (TD-2026-0002) with overdue penalties requiring your official approval.', 'soa_pending', '/treasurer/penalty-approvals');
                $this->notifyUser($user, 'Daily Collection Summary', 'Daily revenue collections are ready for review and reconciliation.', 'system', '/treasurer/reports');
                break;

            case 'Cashier':
                $this->notifyUser($user, 'Active SOA Ready for Payment', 'Statement of Account for Maria Santos (TD-2026-0001) has been approved and issued. Ready for transaction at Collection Desk.', 'soa_issued', '/cashier/desk');
                $this->notifyUser($user, 'Cancellation Policy Reminder', 'Remember to submit all Official Receipt void requests for Treasurer approval before close of business.', 'system', '/cashier/receipts');
                break;

            case 'Taxpayer':
                $this->notifyUser($user, 'Statement of Account Available', 'Your official Statement of Account for property in San Isidro has been issued. View and settle at the Collection Desk.', 'soa_issued', '/taxpayer/portal');
                $this->notifyUser($user, 'Discount Notice for Early Payment', 'Pay your annual real property tax in full before the statutory deadline to avail of advance payment discounts.', 'bill_due', '/taxpayer/portal');
                break;

            case 'Assessment Clerk':
                $this->notifyUser($user, 'New Property Application Queue', 'Applications submitted for appraisal and SMV unit value calculation.', 'system', '/clerk/registrations');
                break;

            case 'Municipal Assessor':
                $this->notifyUser($user, 'Assessments Awaiting Review', 'Property assessment drafts submitted by clerk are ready for authorization.', 'system', '/assessor/applications');
                break;

            default:
                $this->notifyUser($user, 'Welcome to Magarao RPTMS', 'System operational. All municipal modules and audit logs active.', 'system', '/admin/dashboard');
                break;
        }
    }
}
