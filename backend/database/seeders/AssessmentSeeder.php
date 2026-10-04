<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\Assessment;
use App\Models\SmvUnitValue;
use App\Models\User;
use App\Services\AppraisalCalculationService;
use App\Services\AssessmentWorkflowService;
use Illuminate\Database\Seeder;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $smvData = [
            ['barangay' => 'Poblacion', 'classification' => 'Residential', 'actual_use' => 'Residential', 'unit_value' => 4500.00],
            ['barangay' => 'Poblacion', 'classification' => 'Commercial', 'actual_use' => 'Commercial', 'unit_value' => 15000.00],
            ['barangay' => 'San Isidro', 'classification' => 'Residential', 'actual_use' => 'Residential', 'unit_value' => 3200.00],
            ['barangay' => 'San Isidro', 'classification' => 'Commercial', 'actual_use' => 'Commercial', 'unit_value' => 10000.00],
            ['barangay' => 'Malobago', 'classification' => 'Agricultural', 'actual_use' => 'Agricultural', 'unit_value' => 950.00],
            ['barangay' => 'Malobago', 'classification' => 'Residential', 'actual_use' => 'Residential', 'unit_value' => 2100.00],
            ['barangay' => 'Oas', 'classification' => 'Residential', 'actual_use' => 'Residential', 'unit_value' => 2800.00],
            ['barangay' => 'Tumaring', 'classification' => 'Commercial', 'actual_use' => 'Commercial', 'unit_value' => 11500.00],
            ['barangay' => 'Bagtasin', 'classification' => 'Residential', 'actual_use' => 'Residential', 'unit_value' => 2500.00],
        ];

        foreach ($smvData as $row) {
            SmvUnitValue::updateOrCreate(
                [
                    'barangay' => $row['barangay'],
                    'classification' => $row['classification'],
                    'actual_use' => $row['actual_use'],
                    'revision_year' => 2024,
                ],
                ['unit_value' => $row['unit_value']]
            );
        }

        $clerk = User::query()->where('username', 'clerk')->first();
        $assessor = User::query()->where('username', 'assessor')->first();

        if (!$clerk || !$assessor) {
            return;
        }

        $workflow = app(AssessmentWorkflowService::class);

        // Seed assessment for sample applications
        $applications = Application::all();
        foreach ($applications as $app) {
            if ($app->assessment) {
                continue;
            }
            $items = [];
            if ($app->property_type === 'Agricultural') {
                $items[] = [
                    'item_type' => 'Land',
                    'classification' => 'Agricultural',
                    'actual_use' => 'Agricultural',
                    'area_sqm' => $app->propertyDetail?->total_area ?? 1500,
                    'unit_value' => 950.00,
                    'adjustment_factor_pct' => -5,
                    'assessment_level_pct' => 40.00,
                ];
            } elseif ($app->property_type === 'Commercial') {
                $items[] = [
                    'item_type' => 'Land',
                    'classification' => 'Commercial',
                    'actual_use' => 'Commercial',
                    'area_sqm' => 450,
                    'unit_value' => 15000.00,
                    'adjustment_factor_pct' => 10,
                    'assessment_level_pct' => 50.00,
                ];
                $items[] = [
                    'item_type' => 'Building',
                    'classification' => 'Commercial',
                    'actual_use' => 'Commercial',
                    'area_sqm' => 200,
                    'unit_value' => 18000.00,
                    'details' => ['depreciation_pct' => 10],
                    'assessment_level_pct' => 50.00,
                ];
            } else {
                // Residential
                $items[] = [
                    'item_type' => 'Land',
                    'classification' => 'Residential',
                    'actual_use' => 'Residential',
                    'area_sqm' => 300,
                    'unit_value' => 4500.00,
                    'adjustment_factor_pct' => 0,
                    'assessment_level_pct' => 20.00,
                ];
                $items[] = [
                    'item_type' => 'Building',
                    'classification' => 'Residential',
                    'actual_use' => 'Residential',
                    'area_sqm' => 120,
                    'unit_value' => 8500.00,
                    'details' => ['depreciation_pct' => 5],
                    'assessment_level_pct' => 20.00,
                ];
            }

            $assessment = $workflow->saveDraft($app, [
                'pin' => $app->propertyDetail?->pin ?? '010-01-0001-000-00',
                'arp_number' => $app->propertyDetail?->arp_number ?? '010-01-0001',
                'is_taxable' => !$app->tax_exempt,
                'exemption_reason' => $app->exemption_notes,
                'effective_year' => 2024,
                'effective_quarter' => 1,
                'items' => $items,
            ], $clerk);

            if (in_array($app->status, [ApplicationStatus::UnderReview, ApplicationStatus::Active], true)) {
                $workflow->submitForReview($assessment, $clerk);
            }

            if ($app->status === ApplicationStatus::Active) {
                $workflow->approve($assessment, $assessor, 'Approved and verified');
                $workflow->authorize($assessment, $assessor);
            }
        }
    }
}
