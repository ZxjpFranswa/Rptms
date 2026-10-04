<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'intake_ref' => 'INT-'.date('Y').'-'.fake()->unique()->numerify('###'),
            'taxpayer_name' => fake()->name(),
            'property_type' => 'Residential',
            'barangay' => 'Poblacion',
            'submission_date' => now()->toDateString(),
            'status' => ApplicationStatus::UnderReview,
            'verification_status' => 'Verified',
            'remarks' => '',
            'tax_exempt' => false,
        ];
    }
}
