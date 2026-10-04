<?php

namespace App\Models;

use App\Enums\BillStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxBill extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'bill_no',
        'tax_declaration_id',
        'assessment_id',
        'taxpayer_id',
        'owner_name',
        'pin',
        'arp_number',
        'td_number',
        'barangay',
        'taxable_year',
        'assessed_value',
        'basic_rate_pct',
        'sef_rate_pct',
        'basic_tax',
        'sef_tax',
        'total_tax',
        'status',
        'generated_by',
    ];

    protected function casts(): array
    {
        return [
            'taxable_year' => 'integer',
            'assessed_value' => 'decimal:2',
            'basic_rate_pct' => 'decimal:3',
            'sef_rate_pct' => 'decimal:3',
            'basic_tax' => 'decimal:2',
            'sef_tax' => 'decimal:2',
            'total_tax' => 'decimal:2',
            'status' => BillStatus::class,
        ];
    }

    public function taxDeclaration(): BelongsTo
    {
        return $this->belongsTo(TaxDeclaration::class);
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function taxpayer(): BelongsTo
    {
        return $this->belongsTo(Taxpayer::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(TaxBillInstallment::class)->orderBy('quarter');
    }

    /**
     * Recompute and save the bill status based on its installments.
     */
    public function recomputeStatus(): void
    {
        $statuses = $this->installments()->pluck('status')->map(fn ($s) => $s instanceof BillStatus ? $s->value : $s)->all();
        if (empty($statuses)) return;

        $allPaid = collect($statuses)->every(fn ($s) => $s === BillStatus::Paid->value);
        $allUnpaid = collect($statuses)->every(fn ($s) => $s === BillStatus::Unpaid->value);

        if ($allPaid) {
            $this->status = BillStatus::Paid;
        } elseif ($allUnpaid) {
            $this->status = BillStatus::Unpaid;
        } else {
            $this->status = BillStatus::Partial;
        }
        $this->save();
    }
}
