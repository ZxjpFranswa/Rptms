<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatus;
use App\Enums\DocumentUploadStatus;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\ApplicationLocation;
use App\Models\ApplicationPropertyDetail;
use App\Models\ApplicationTechnicalData;
use App\Models\Taxpayer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampleApplicationsSeeder extends Seeder
{
    public function run(): void
    {
        $clerk = User::query()->where('username', 'clerk')->first();

        $samples = [
            ['intake_ref' => 'INT-2024-001', 'taxpayer_name' => 'Juan Dela Cruz', 'property_type' => 'Residential', 'barangay' => 'Poblacion', 'submission_date' => '2024-01-15', 'status' => ApplicationStatus::UnderReview, 'last_assessor_action' => 'Pending Review', 'verification_status' => 'Verified'],
            ['intake_ref' => 'INT-2024-002', 'taxpayer_name' => 'Maria Santos', 'property_type' => 'Commercial', 'barangay' => 'San Isidro', 'submission_date' => '2024-01-10', 'status' => ApplicationStatus::Active, 'last_assessor_action' => 'Activated', 'remarks' => 'All documents complete', 'verification_status' => 'Verified'],
            ['intake_ref' => 'INT-2024-003', 'taxpayer_name' => 'Reyes, Pedro Santos', 'property_type' => 'Agricultural', 'barangay' => 'Malobago', 'submission_date' => '2024-01-20', 'status' => ApplicationStatus::Returned, 'last_assessor_action' => 'Returned', 'remarks' => 'Missing tax declaration document', 'verification_status' => 'Verified', 'with_details' => true],
            ['intake_ref' => 'INT-2024-004', 'taxpayer_name' => 'Ana Torres', 'property_type' => 'Residential', 'barangay' => 'Oas', 'submission_date' => '2024-01-18', 'status' => ApplicationStatus::Draft, 'verification_status' => 'Pending'],
            ['intake_ref' => 'INT-2024-005', 'taxpayer_name' => 'Roberto Garcia', 'property_type' => 'Commercial', 'barangay' => 'Tumaring', 'submission_date' => '2024-01-12', 'status' => ApplicationStatus::Active, 'last_assessor_action' => 'Activated', 'remarks' => 'Property activated for taxation', 'verification_status' => 'Verified'],
            ['intake_ref' => 'INT-2024-006', 'taxpayer_name' => 'Carmen Alves', 'property_type' => 'Residential', 'barangay' => 'Bagtasin', 'submission_date' => '2024-01-22', 'status' => ApplicationStatus::Rejected, 'last_assessor_action' => 'Rejected', 'remarks' => 'Inconsistent property details and ownership claims', 'verification_status' => 'Verified'],
            ['intake_ref' => 'INT-2024-007', 'taxpayer_name' => 'Elena Bautista', 'property_type' => 'Residential', 'barangay' => 'Poblacion', 'submission_date' => '2024-01-24', 'status' => ApplicationStatus::UnderReview, 'last_assessor_action' => 'Pending Review', 'tax_exempt' => true, 'exemption_notes' => 'Senior citizen', 'verification_status' => 'Verified'],
            ['intake_ref' => 'INT-2024-008', 'taxpayer_name' => 'Miguel Fernandez', 'property_type' => 'Commercial', 'barangay' => 'San Isidro', 'submission_date' => '2024-01-24', 'status' => ApplicationStatus::UnderReview, 'last_assessor_action' => 'Pending Review', 'verification_status' => 'Verified'],
        ];

        DB::table('applications_intake_seq')->updateOrInsert(['year' => 2024], ['last_seq' => 8]);

        foreach ($samples as $row) {
            $application = Application::updateOrCreate(
                ['intake_ref' => $row['intake_ref']],
                [
                    'taxpayer_name' => $row['taxpayer_name'],
                    'property_type' => $row['property_type'],
                    'barangay' => $row['barangay'],
                    'submission_date' => $row['submission_date'],
                    'status' => $row['status'],
                    'verification_status' => $row['verification_status'],
                    'last_assessor_action' => $row['last_assessor_action'] ?? null,
                    'remarks' => $row['remarks'] ?? '',
                    'tax_exempt' => $row['tax_exempt'] ?? false,
                    'exemption_notes' => $row['exemption_notes'] ?? null,
                    'created_by' => $clerk?->id,
                ],
            );

            if (! empty($row['with_details'])) {
                $taxpayer = Taxpayer::updateOrCreate(
                    ['tin' => '111-222-333-444'],
                    [
                        'last_name' => 'Reyes',
                        'first_name' => 'Pedro',
                        'middle_name' => 'Santos',
                        'address' => 'Malobago, Magarao, Camarines Sur',
                        'contact' => '+63 917 555 0101',
                        'email' => 'pedro.reyes@example.com',
                    ],
                );
                $application->taxpayer_id = $taxpayer->id;
                $application->save();

                ApplicationPropertyDetail::updateOrCreate(
                    ['application_id' => $application->id],
                    ['pin' => '010-33-444-555', 'arp_number' => '010-33-444', 'land_classification' => 'Agricultural', 'actual_use' => 'Agricultural', 'total_area' => 1500, 'survey_number' => 'SUR-2023-088'],
                );
                ApplicationLocation::updateOrCreate(
                    ['application_id' => $application->id],
                    ['street' => 'Sitio Riverside', 'barangay' => 'Malobago', 'municipality' => 'Magarao', 'province' => 'Camarines Sur', 'zip' => '4404'],
                );
                ApplicationTechnicalData::updateOrCreate(
                    ['application_id' => $application->id],
                    ['north_boundary' => 'Creek', 'south_boundary' => 'Rice field', 'east_boundary' => 'Road', 'west_boundary' => 'Lot 12', 'area_measurement' => '1500', 'survey_reference' => 'SGO-2023-088', 'building_type' => 'Wood', 'floors' => '1', 'building_area' => '45'],
                );
            }

            foreach (['Title', 'Tax Declaration', 'Survey Plan', 'Building Permit', 'Government ID', 'Deed of Sale', 'Affidavit', 'Exemption Document'] as $type) {
                ApplicationDocument::updateOrCreate(
                    ['application_id' => $application->id, 'type' => $type],
                    ['upload_status' => DocumentUploadStatus::Pending],
                );
            }

            if ($row['intake_ref'] === 'INT-2024-001') {
                $this->seedDoc($application->id, 'Title', DocumentUploadStatus::Verified, 'title.pdf');
                $this->seedDoc($application->id, 'Tax Declaration', DocumentUploadStatus::Verified, 'tax_dec.pdf');
                $this->seedDoc($application->id, 'Survey Plan', DocumentUploadStatus::Uploaded, 'survey.pdf');
                $this->seedDoc($application->id, 'Government ID', DocumentUploadStatus::Verified, 'id.jpg');
            }
        }
    }

    private function seedDoc(string $applicationId, string $type, DocumentUploadStatus $status, string $fileName): void
    {
        ApplicationDocument::query()
            ->where('application_id', $applicationId)
            ->where('type', $type)
            ->update([
                'upload_status' => $status,
                'file_name' => $fileName,
                'file_size' => 100000,
                'mime_type' => str_ends_with($fileName, '.pdf') ? 'application/pdf' : 'image/jpeg',
                'uploaded_at' => now(),
            ]);
    }
}
