<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxDeclaration extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'assessment_id',
        'td_number',
        'previous_td_number',
        'owner_name',
        'barangay',
        'total_market_value',
        'total_assessed_value',
        'effectivity_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'total_market_value' => 'decimal:2',
            'total_assessed_value' => 'decimal:2',
            'effectivity_date' => 'date',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function taxBills(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TaxBill::class);
    }

    public function statementsOfAccount(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StatementOfAccount::class);
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
