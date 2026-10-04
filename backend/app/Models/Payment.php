<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'or_number',
        'statement_of_account_id',
        'tax_declaration_id',
        'taxpayer_id',
        'payor_name',
        'barangay',
        'payment_date',
        'amount_due',
        'discount_amount',
        'amount_paid',
        'amount_tendered',
        'change_amount',
        'balance_after',
        'payment_method',
        'reference_no',
        'remarks',
        'cashier_id',
        'status',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'replaces_payment_id',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'datetime',
            'amount_due' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'amount_tendered' => 'decimal:2',
            'change_amount' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'status' => PaymentStatus::class,
            'cancelled_at' => 'datetime',
        ];
    }

    public function statementOfAccount(): BelongsTo
    {
        return $this->belongsTo(StatementOfAccount::class);
    }

    public function taxDeclaration(): BelongsTo
    {
        return $this->belongsTo(TaxDeclaration::class);
    }

    public function taxpayer(): BelongsTo
    {
        return $this->belongsTo(Taxpayer::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function correctionRequests(): HasMany
    {
        return $this->hasMany(PaymentCorrectionRequest::class);
    }

    public function activeCorrectionRequest(): HasOne
    {
        return $this->hasOne(PaymentCorrectionRequest::class)->where('status', 'Pending');
    }
}
