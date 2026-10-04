<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->user_name,
            'action' => $this->action,
            'timestamp' => $this->created_at?->toIso8601String(),
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'previousValue' => $this->previous_value ?? '-',
            'newValue' => $this->new_value ?? '-',
        ];
    }
}
