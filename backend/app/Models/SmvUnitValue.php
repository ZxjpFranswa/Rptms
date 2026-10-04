<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmvUnitValue extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'barangay',
        'classification',
        'actual_use',
        'unit_value',
        'revision_year',
    ];

    protected function casts(): array
    {
        return [
            'unit_value' => 'decimal:2',
            'revision_year' => 'integer',
        ];
    }
}
