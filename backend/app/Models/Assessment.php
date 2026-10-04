<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Assessment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'application_id',
        'pin',
        'arp_number',
        'total_market_value',
        'total_assessed_value',
        'taxability_status',
        'exemption_reason',
        'effective_year',
        'effective_quarter',
        'status',
        'remarks',
        'created_by',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'authorized_by',
        'authorized_at',
    ];

    protected function casts(): array
    {
        return [
            'total_market_value' => 'decimal:2',
            'total_assessed_value' => 'decimal:2',
            'effective_year' => 'integer',
            'effective_quarter' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'authorized_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssessmentItem::class);
    }

    public function taxDeclaration(): HasOne
    {
        return $this->hasOne(TaxDeclaration::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(AssessmentStatusHistory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function authorizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by');
    }
}
