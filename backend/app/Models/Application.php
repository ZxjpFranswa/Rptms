<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    /** @use HasFactory<\Database\Factories\ApplicationFactory> */
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'intake_ref',
        'taxpayer_id',
        'taxpayer_name',
        'property_type',
        'barangay',
        'submission_date',
        'status',
        'verification_status',
        'last_assessor_action',
        'remarks',
        'tax_exempt',
        'exemption_notes',
        'created_by',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submission_date' => 'date',
            'submitted_at' => 'datetime',
            'tax_exempt' => 'boolean',
            'status' => ApplicationStatus::class,
        ];
    }

    public function taxpayer(): BelongsTo
    {
        return $this->belongsTo(Taxpayer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function propertyDetail(): HasOne
    {
        return $this->hasOne(ApplicationPropertyDetail::class);
    }

    public function location(): HasOne
    {
        return $this->hasOne(ApplicationLocation::class);
    }

    public function technicalData(): HasOne
    {
        return $this->hasOne(ApplicationTechnicalData::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ApplicationStatusHistory::class);
    }
}
