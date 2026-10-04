<?php

namespace App\Services;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\Taxpayer;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ApplicationService
{
    public function __construct(
        private readonly IntakeRefGenerator $intakeRefGenerator,
        private readonly DocumentStorageService $documentStorage,
        private readonly ApplicationWorkflowService $workflow,
    ) {}

    public function create(array $payload, User $user, bool $asDraft): Application
    {
        return DB::transaction(function () use ($payload, $user, $asDraft) {
            $taxpayer = $this->upsertTaxpayer(Arr::get($payload, 'taxpayer', []));

            $application = Application::create([
                'intake_ref' => $this->intakeRefGenerator->next(),
                'taxpayer_id' => $taxpayer?->id,
                'taxpayer_name' => $payload['taxpayerName'] ?? 'Unknown Taxpayer',
                'property_type' => $payload['propertyType'] ?? 'Residential',
                'barangay' => $payload['barangay'] ?? ($payload['location']['barangay'] ?? 'Poblacion'),
                'submission_date' => now()->toDateString(),
                'status' => ApplicationStatus::Draft,
                'verification_status' => 'Pending',
                'remarks' => $payload['remarks'] ?? '',
                'tax_exempt' => (bool) ($payload['taxExempt'] ?? false),
                'exemption_notes' => ($payload['taxExempt'] ?? false) ? ($payload['exemptionNotes'] ?? '') : null,
                'created_by' => $user->id,
            ]);

            $this->syncNested($application, $payload);
            $this->documentStorage->ensureSlots($application);

            if (! $asDraft) {
                $this->workflow->submitNew($application, $user);
            }

            return $application->fresh($this->eagerRelations());
        });
    }

    public function update(Application $application, array $payload, User $user): Application
    {
        return DB::transaction(function () use ($application, $payload, $user) {
            if ($taxpayerPayload = Arr::get($payload, 'taxpayer')) {
                $taxpayer = $this->upsertTaxpayer($taxpayerPayload);
                $application->taxpayer_id = $taxpayer?->id;
            }

            $application->fill([
                'taxpayer_name' => $payload['taxpayerName'] ?? $application->taxpayer_name,
                'property_type' => $payload['propertyType'] ?? $application->property_type,
                'barangay' => $payload['barangay'] ?? $application->barangay,
                'tax_exempt' => array_key_exists('taxExempt', $payload) ? (bool) $payload['taxExempt'] : $application->tax_exempt,
                'exemption_notes' => array_key_exists('exemptionNotes', $payload)
                    ? $payload['exemptionNotes']
                    : $application->exemption_notes,
                'remarks' => $payload['remarks'] ?? $application->remarks,
            ]);
            $application->save();

            $this->syncNested($application, $payload);

            return $application->fresh($this->eagerRelations());
        });
    }

    public function eagerRelations(): array
    {
        return [
            'taxpayer',
            'propertyDetail',
            'location',
            'technicalData',
            'documents',
        ];
    }

    private function syncNested(Application $application, array $payload): void
    {
        if ($property = Arr::get($payload, 'property')) {
            $application->propertyDetail()->updateOrCreate(
                ['application_id' => $application->id],
                [
                    'pin' => $property['pin'] ?? '',
                    'arp_number' => $property['arpNumber'] ?? '',
                    'land_classification' => $property['landClassification'] ?? '',
                    'actual_use' => $property['actualUse'] ?? '',
                    'total_area' => $property['totalArea'] ?? 0,
                    'survey_number' => $property['surveyNumber'] ?? null,
                ],
            );
        }

        if ($location = Arr::get($payload, 'location')) {
            $application->location()->updateOrCreate(
                ['application_id' => $application->id],
                [
                    'street' => $location['street'] ?? '',
                    'barangay' => $location['barangay'] ?? $application->barangay,
                    'municipality' => $location['municipality'] ?? '',
                    'province' => $location['province'] ?? '',
                    'zip' => $location['zip'] ?? '',
                ],
            );
            $application->barangay = $location['barangay'] ?? $application->barangay;
            $application->save();
        }

        if ($technical = Arr::get($payload, 'technical')) {
            $application->technicalData()->updateOrCreate(
                ['application_id' => $application->id],
                [
                    'north_boundary' => $technical['northBoundary'] ?? null,
                    'south_boundary' => $technical['southBoundary'] ?? null,
                    'east_boundary' => $technical['eastBoundary'] ?? null,
                    'west_boundary' => $technical['westBoundary'] ?? null,
                    'area_measurement' => $technical['areaMeasurement'] ?? null,
                    'survey_reference' => $technical['surveyReference'] ?? null,
                    'building_type' => $technical['buildingType'] ?? null,
                    'floors' => $technical['floors'] ?? null,
                    'building_area' => $technical['buildingArea'] ?? null,
                ],
            );
        }
    }

    private function upsertTaxpayer(array $data): ?Taxpayer
    {
        if (empty($data)) {
            return null;
        }

        $tin = $data['tin'] ?? null;
        if ($tin) {
            return Taxpayer::updateOrCreate(
                ['tin' => $tin],
                [
                    'last_name' => $data['lastName'] ?? '',
                    'first_name' => $data['firstName'] ?? '',
                    'middle_name' => $data['middleName'] ?? null,
                    'address' => $data['address'] ?? '',
                    'contact' => $data['contact'] ?? '',
                    'email' => $data['email'] ?? '',
                ],
            );
        }

        return Taxpayer::create([
            'last_name' => $data['lastName'] ?? '',
            'first_name' => $data['firstName'] ?? '',
            'middle_name' => $data['middleName'] ?? null,
            'tin' => null,
            'address' => $data['address'] ?? '',
            'contact' => $data['contact'] ?? '',
            'email' => $data['email'] ?? '',
        ]);
    }
}
