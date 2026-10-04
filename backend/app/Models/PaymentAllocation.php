<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAllocation extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'payment_id',
        'tax_bill_installment_id',
        'taxable_year',
        'quarter',
        'basic_amount',
        'sef_amount',
        'penalty_amount',
        'discount_amount',
        'discount_type',
        'total_amount',
    ];

    protected function casts(): array
    {
        return [
            'taxable_year' => 'integer',
            'quarter' => 'integer',
            'basic_amount' => 'decimal:2',
            'sef_amount' => 'decimal:2',
            'penalty_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(TaxBillInstallment::class, 'tax_bill_installment_id');
    }
}
