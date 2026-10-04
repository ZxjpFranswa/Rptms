<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Taxpayer extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'tin',
        'address',
        'contact',
        'email',
    ];

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function taxBills(): HasMany
    {
        return $this->hasMany(TaxBill::class);
    }

    public function statementsOfAccount(): HasMany
    {
        return $this->hasMany(StatementOfAccount::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim(preg_replace('/\s+/', ' ', "{$this->first_name} {$this->middle_name} {$this->last_name}"));
    }
}
