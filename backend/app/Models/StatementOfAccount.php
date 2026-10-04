<?php

namespace App\Models;

use App\Enums\SoaStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StatementOfAccount extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'statements_of_account';

    protected $fillable = [
        'soa_no',
        'tax_declaration_id',
        'taxpayer_id',
        'revision_of_id',
        'owner_name',
        'pin',
        'td_number',
        'barangay',
        'as_of_date',
        'valid_until',
        'total_basic',
        'total_sef',
        'total_principal',
        'computed_penalty',
        'total_penalty',
        'total_amount_due',
        'has_penalty',
        'status',
        'remarks',
        'review_remarks',
        'prepared_by',
        'reviewed_by',
        'reviewed_at',
        'issued_at',
        'notified_at',
    ];

    protected function casts(): array
    {
        return [
            'as_of_date' => 'date',
            'valid_until' => 'date',
            'total_basic' => 'decimal:2',
            'total_sef' => 'decimal:2',
            'total_principal' => 'decimal:2',
            'computed_penalty' => 'decimal:2',
            'total_penalty' => 'decimal:2',
            'total_amount_due' => 'decimal:2',
            'has_penalty' => 'boolean',
            'status' => SoaStatus::class,
            'reviewed_at' => 'datetime',
            'issued_at' => 'datetime',
            'notified_at' => 'datetime',
        ];
    }

    public function taxDeclaration(): BelongsTo
    {
        return $this->belongsTo(TaxDeclaration::class);
    }

    public function taxpayer(): BelongsTo
    {
        return $this->belongsTo(Taxpayer::class);
    }

    public function preparer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function revisionOf(): BelongsTo
    {
        return $this->belongsTo(StatementOfAccount::class, 'revision_of_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SoaItem::class)->orderBy('taxable_year')->orderBy('quarter');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(TaxpayerNotification::class);
    }
}
