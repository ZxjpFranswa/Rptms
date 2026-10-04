<?php

namespace App\Models;

use App\Enums\BillStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxBillInstallment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'tax_bill_id',
        'quarter',
        'due_date',
        'basic_due',
        'sef_due',
        'total_due',
        'basic_paid',
        'sef_paid',
        'penalty_paid',
        'discount_granted',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'quarter' => 'integer',
            'due_date' => 'date',
            'basic_due' => 'decimal:2',
            'sef_due' => 'decimal:2',
            'total_due' => 'decimal:2',
            'basic_paid' => 'decimal:2',
            'sef_paid' => 'decimal:2',
            'penalty_paid' => 'decimal:2',
            'discount_granted' => 'decimal:2',
            'status' => BillStatus::class,
            'paid_at' => 'datetime',
        ];
    }

    public function taxBill(): BelongsTo
    {
        return $this->belongsTo(TaxBill::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }

    public function getBasicBalanceAttribute(): float
    {
        return max(0.0, round((float) $this->basic_due - (float) $this->basic_paid, 2));
    }

    public function getSefBalanceAttribute(): float
    {
        return max(0.0, round((float) $this->sef_due - (float) $this->sef_paid, 2));
    }

    public function getPrincipalBalanceAttribute(): float
    {
        return round($this->basic_balance + $this->sef_balance, 2);
    }

    /**
     * Recalculate basic_paid, sef_paid, penalty_paid, discount_granted, and status
     * from all posted payment allocations.
     */
    public function recomputeFromAllocations(): void
    {
        $allocations = $this->allocations()
            ->whereHas('payment', fn ($q) => $q->where('status', 'Posted'))
            ->get();

        $basicPaid = (float) $allocations->sum('basic_amount');
        $sefPaid = (float) $allocations->sum('sef_amount');
        $penaltyPaid = (float) $allocations->sum('penalty_amount');
        $discountGranted = (float) $allocations->sum('discount_amount');

        $this->basic_paid = round($basicPaid, 2);
        $this->sef_paid = round($sefPaid, 2);
        $this->penalty_paid = round($penaltyPaid, 2);
        $this->discount_granted = round($discountGranted, 2);

        $principalRemaining = $this->basic_balance + $this->sef_balance;

        if ($principalRemaining <= 0.001) {
            $this->status = BillStatus::Paid;
            $this->paid_at = $allocations->sortByDesc('created_at')->first()?->created_at ?? now();
        } elseif ($basicPaid > 0 || $sefPaid > 0 || $discountGranted > 0) {
            $this->status = BillStatus::Partial;
            $this->paid_at = null;
        } else {
            $this->status = BillStatus::Unpaid;
            $this->paid_at = null;
        }

        $this->save();
        $this->taxBill->recomputeStatus();
    }
}
