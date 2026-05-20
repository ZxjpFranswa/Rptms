<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationTechnicalData extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'application_id',
        'north_boundary',
        'south_boundary',
        'east_boundary',
        'west_boundary',
        'area_measurement',
        'survey_reference',
        'building_type',
        'floors',
        'building_area',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
