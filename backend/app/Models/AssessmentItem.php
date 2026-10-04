<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentItem extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'assessment_id',
        'item_type',
        'classification',
        'actual_use',
        'area_sqm',
        'unit_value',
        'base_market_value',
        'adjustment_factor_pct',
        'market_value',
        'assessment_level_pct',
        'assessed_value',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'area_sqm' => 'decimal:2',
            'unit_value' => 'decimal:2',
            'base_market_value' => 'decimal:2',
            'adjustment_factor_pct' => 'decimal:2',
            'market_value' => 'decimal:2',
            'assessment_level_pct' => 'decimal:2',
            'assessed_value' => 'decimal:2',
            'details' => 'array',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }
}
