<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoaItem extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'statement_of_account_id',
        'tax_bill_installment_id',
        'taxable_year',
        'quarter',
        'due_date',
        'basic_balance',
        'sef_balance',
        'principal_balance',
        'months_late',
        'penalty_rate_pct',
        'computed_penalty',
        'penalty_amount',
        'adjustment_reason',
    ];

    protected function casts(): array
    {
        return [
            'taxable_year' => 'integer',
            'quarter' => 'integer',
            'due_date' => 'date',
            'basic_balance' => 'decimal:2',
            'sef_balance' => 'decimal:2',
            'principal_balance' => 'decimal:2',
            'months_late' => 'integer',
            'penalty_rate_pct' => 'decimal:3',
            'computed_penalty' => 'decimal:2',
            'penalty_amount' => 'decimal:2',
        ];
    }

    public function statementOfAccount(): BelongsTo
    {
        return $this->belongsTo(StatementOfAccount::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(TaxBillInstallment::class, 'tax_bill_installment_id');
    }
}
