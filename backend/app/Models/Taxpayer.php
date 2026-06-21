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
}
