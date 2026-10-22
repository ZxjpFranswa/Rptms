<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reassessment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'assessment_id',
        'application_id',
        'reassessment_type',
        'adjustment_mode',
        'adjustment_pct',
        'previous_market_value',
        'new_market_value',
        'previous_assessed_value',
        'new_assessed_value',
        'effective_year',
        'effective_quarter',
        'reason',
        'remarks',
        'item_adjustments',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'adjustment_pct' => 'decimal:2',
            'previous_market_value' => 'decimal:2',
            'new_market_value' => 'decimal:2',
            'previous_assessed_value' => 'decimal:2',
            'new_assessed_value' => 'decimal:2',
            'effective_year' => 'integer',
            'effective_quarter' => 'integer',
            'item_adjustments' => 'array',
            'approved_at' => 'datetime',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
