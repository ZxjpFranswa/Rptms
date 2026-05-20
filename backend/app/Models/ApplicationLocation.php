<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationLocation extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'application_id',
        'street',
        'barangay',
        'municipality',
        'province',
        'zip',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
