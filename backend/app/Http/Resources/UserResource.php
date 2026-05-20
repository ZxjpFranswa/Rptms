<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'fullName' => $this->full_name,
            'role' => $this->role instanceof \BackedEnum ? $this->role->value : $this->role,
            'email' => $this->email,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'lastLogin' => $this->last_login_at?->toIso8601String(),
        ];
    }
}
