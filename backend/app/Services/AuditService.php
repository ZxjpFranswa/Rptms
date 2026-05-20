<?php

namespace App\Services;

use App\Enums\AuditLogStatus;
use App\Models\AuditLog;
use App\Models\User;

class AuditService
{
    public function log(
        ?User $user,
        string $action,
        ?string $previousValue = null,
        ?string $newValue = null,
        AuditLogStatus $status = AuditLogStatus::Success,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->full_name ?? 'System',
            'action' => $action,
            'status' => $status,
            'previous_value' => $previousValue,
            'new_value' => $newValue,
        ]);
    }
}
