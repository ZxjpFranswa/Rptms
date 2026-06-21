<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaxpayerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lastName' => $this->last_name,
            'firstName' => $this->first_name,
            'middleName' => $this->middle_name,
            'tin' => $this->tin,
            'address' => $this->address,
            'contact' => $this->contact,
            'email' => $this->email,
        ];
    }
}
