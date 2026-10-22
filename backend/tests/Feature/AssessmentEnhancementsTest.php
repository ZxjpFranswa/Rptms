<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\ApplicationPropertyDetail;
use App\Models\Assessment;
use App\Models\Taxpayer;
use App\Models\User;
use App\Services\AppraisalCalculationService;
use App\Services\AssessmentWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AssessmentEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    private User $clerk;
    private User $assessor;
    private Application $application;

    protected function setUp(): void
    {
        parent::setUp();

        $this->clerk = User::factory()->create([
            'role' => UserRole::AssessmentClerk,
            'full_name' => 'Clerk Maria Santos',
            'username' => 'clerk_maria',
        ]);

        $this->assessor = User::factory()->create([
            'role' => UserRole::MunicipalAssessor,
            'full_name' => 'Assessor Juan Dela Cruz',
            'username' => 'assessor_juan',
        ]);

        $taxpayer = Taxpayer::create([
            'first_name' => 'Pedro',
            'last_name' => 'Penduko',
            'tin' => '123-456-789-000',
            'address' => 'Barangay Poblacion',
            'contact' => '09171234567',
            'email' => 'pedro@example.com',
        ]);

        $this->application = Application::create([
            'intake_ref' => 'APP-2026-0001',
            'taxpayer_id' => $taxpayer->id,
            'taxpayer_name' => 'Pedro Penduko',
            'property_type' => 'Agricultural',
            'barangay' => 'Poblacion',
            'submission_date' => now()->toDateString(),
            'status' => ApplicationStatus::Draft,
            'tax_exempt' => false,
            'created_by' => $this->clerk->id,
        ]);

        ApplicationPropertyDetail::create([
            'application_id' => $this->application->id,
            'pin' => '010-01-0001-001',
            'arp_number' => '010-01-0001',
            'land_classification' => 'Agricultural',
            'actual_use' => 'Agricultural',
            'total_area' => 5000.00,
        ]);
    }

    public function test_plants_and_trees_automatic_pricing_by_species_and_age(): void
    {
        $calculator = app(AppraisalCalculationService::class);

        // Coconut young (2 yrs)
        $coconutYoung = $calculator->getPlantUnitValue('Coconut', 2);
        $this->assertEquals(150.00, $coconutYoung['unit_value']);
        $this->assertFalse($coconutYoung['is_bearing']);

        // Coconut peak bearing (15 yrs)
        $coconutBearing = $calculator->getPlantUnitValue('Coconut', 15);
        $this->assertEquals(850.00, $coconutBearing['unit_value']);
        $this->assertTrue($coconutBearing['is_bearing']);

        // Mango peak bearing (20 yrs)
        $mangoPeak = $calculator->getPlantUnitValue('Mango', 20);
        $this->assertEquals(5000.00, $mangoPeak['unit_value']);
        $this->assertTrue($mangoPeak['is_bearing']);

        // Mango old (45 yrs)
        $mangoOld = $calculator->getPlantUnitValue('Mango', 45);
        $this->assertEquals(2200.00, $mangoOld['unit_value']);

        // API endpoint for plants schedule
        $res = $this->actingAs($this->clerk)->getJson('/api/assessments/plants-schedule');
        $res->assertOk();
        $res->assertJsonFragment(['species' => 'Coconut']);
        $res->assertJsonFragment(['species' => 'Mango']);

        // API lookup endpoint
        $lookupRes = $this->actingAs($this->clerk)->postJson('/api/assessments/plants/lookup', [
            'species' => 'Coconut',
            'age' => 10,
        ]);
        $lookupRes->assertOk();
        $lookupRes->assertJsonFragment(['unit_value' => 850.00]);
    }

    public function test_automatic_computation_valuation_summary_and_yearly_tax_increase(): void
    {
        $payload = [
            'barangay' => 'Poblacion',
            'is_taxable' => true,
            'annual_tax_increase_pct' => 5.0,
            'annual_tax_increase_enabled' => true,
            'effective_year' => 2026,
            'items' => [
                [
                    'item_type' => 'Land',
                    'classification' => 'Agricultural',
                    'actual_use' => 'Agricultural',
                    'area_sqm' => 1000,
                    'unit_value' => 500.00,
                    'adjustment_factor_pct' => 0,
                    'assessment_level_pct' => 40,
                ],
                [
                    'item_type' => 'Plants/Trees',
                    'classification' => 'Agricultural',
                    'actual_use' => 'Agricultural',
                    'area_sqm' => 100, // 100 trees
                    'unit_value' => 850.00, // 850/tree
                    'adjustment_factor_pct' => 0,
                    'assessment_level_pct' => 40,
                    'details' => [
                        'plant_kind' => 'Coconut',
                        'age_years' => 12,
                        'quantity_trees' => 100,
                    ],
                ],
            ],
        ];

        $res = $this->actingAs($this->clerk)->postJson('/api/assessments/calculate', $payload);
        $res->assertOk();

        // Land: 1000 * 500 = 500,000 MV -> 200,000 AV
        // Plants: 100 * 850 = 85,000 MV -> 34,000 AV
        // Total MV: 585,000. Total AV: 234,000
        $res->assertJsonFragment(['total_market_value' => 585000]);
        $res->assertJsonFragment(['total_assessed_value' => 234000]);

        // Check valuation summary breakdown
        $res->assertJsonPath('valuation_summary.breakdown.land.market_value', 500000);
        $res->assertJsonPath('valuation_summary.breakdown.plants_trees.market_value', 85000);
        $res->assertJsonPath('valuation_summary.breakdown.plants_trees.total_trees', 100);

        // Check tax summary (2% total annual tax = 4,680)
        $res->assertJsonPath('tax_summary.total_annual_tax', 4680);
        $res->assertJsonPath('tax_summary.basic_tax_amount', 2340);
        $res->assertJsonPath('tax_summary.sef_tax_amount', 2340);
        $res->assertJsonPath('tax_summary.quarterly_installment', 1170);

        // Check 5-year annual tax increase projections
        $res->assertJsonPath('annual_tax_increase.enabled', true);
        $this->assertEquals(5.0, (float) $res->json('annual_tax_increase.rate_pct'));
        $this->assertCount(5, $res->json('annual_tax_increase.projections'));
        $this->assertEquals(2026, $res->json('annual_tax_increase.projections.0.year'));
        $this->assertEquals(2027, $res->json('annual_tax_increase.projections.1.year'));
    }

    public function test_save_assessment_with_annual_tax_increase_and_plants(): void
    {
        $payload = [
            'pin' => '010-01-0001-001',
            'arp_number' => '010-01-0001',
            'is_taxable' => true,
            'effective_year' => 2026,
            'effective_quarter' => 1,
            'annual_tax_increase_pct' => 3.5,
            'annual_tax_increase_enabled' => true,
            'items' => [
                [
                    'item_type' => 'Plants/Trees',
                    'classification' => 'Agricultural',
                    'actual_use' => 'Agricultural',
                    'area_sqm' => 50,
                    'unit_value' => 5000.00, // 50 Mango trees at peak bearing
                    'assessment_level_pct' => 40,
                    'details' => [
                        'plant_kind' => 'Mango',
                        'age_years' => 20,
                        'quantity_trees' => 50,
                    ],
                ],
            ],
        ];

        $res = $this->actingAs($this->clerk)->postJson("/api/applications/{$this->application->id}/assessment", $payload);
        $res->assertOk();

        $assessment = Assessment::where('application_id', $this->application->id)->first();
        $this->assertNotNull($assessment);
        $this->assertEquals(3.5, (float) $assessment->annual_tax_increase_pct);
        $this->assertTrue((bool) $assessment->annual_tax_increase_enabled);

        // 50 * 5000 = 250,000 MV -> 100,000 AV
        $this->assertEquals(250000.00, (float) $assessment->total_market_value);
        $this->assertEquals(100000.00, (float) $assessment->total_assessed_value);

        // Check GET assessment includes valuation summary and annual increase
        $showRes = $this->actingAs($this->clerk)->getJson("/api/applications/{$this->application->id}/assessment");
        $showRes->assertOk();
        $showRes->assertJsonPath('annual_tax_increase.enabled', true);
        $showRes->assertJsonPath('valuation_summary.breakdown.plants_trees.total_trees', 50);
    }

    public function test_reassessment_for_price_increase_and_decrease(): void
    {
        // First create and authorize an assessment
        $workflow = app(AssessmentWorkflowService::class);
        $assessment = $workflow->saveDraft($this->application, [
            'pin' => '010-01-0001-001',
            'arp_number' => '010-01-0001',
            'is_taxable' => true,
            'effective_year' => 2026,
            'effective_quarter' => 1,
            'items' => [
                [
                    'item_type' => 'Land',
                    'classification' => 'Agricultural',
                    'actual_use' => 'Agricultural',
                    'area_sqm' => 1000,
                    'unit_value' => 1000.00, // MV 1,000,000, AV 400,000
                    'assessment_level_pct' => 40,
                ],
            ],
        ], $this->clerk);

        $workflow->submitForReview($assessment, $this->clerk);
        $workflow->approve($assessment, $this->assessor);
        $workflow->authorize($assessment, $this->assessor);

        $this->assertEquals(1000000.00, (float) $assessment->fresh()->total_market_value);

        // 1. Preview 10% price increase
        $previewRes = $this->actingAs($this->clerk)->postJson("/api/applications/{$this->application->id}/reassessments/preview", [
            'adjustment_pct' => 10.0,
            'reassessment_type' => 'Increase',
            'effective_year' => 2027,
        ]);
        $previewRes->assertOk();
        $previewRes->assertJsonPath('previous_market_value', 1000000);
        $previewRes->assertJsonPath('new_market_value', 1100000);
        $previewRes->assertJsonPath('difference_market_value', 100000);

        // 2. Submit reassessment request (Clerk)
        $storeRes = $this->actingAs($this->clerk)->postJson("/api/applications/{$this->application->id}/reassessments", [
            'adjustment_pct' => 10.0,
            'reassessment_type' => 'Increase',
            'reason' => 'Schedule of Market Values (SMV) General Revision',
            'effective_year' => 2027,
            'effective_quarter' => 1,
        ]);
        $storeRes->assertCreated();
        $reassessmentId = $storeRes->json('id');

        // 3. Assessor approves the reassessment
        $approveRes = $this->actingAs($this->assessor)->postJson("/api/reassessments/{$reassessmentId}/approve", [
            'remarks' => 'Approved pursuant to Municipal Ordinance 2026-05',
        ]);
        $approveRes->assertOk();
        $approveRes->assertJsonPath('status', 'Approved');

        // Verify assessment market value was updated to 1,100,000 and AV to 440,000
        $updatedAssessment = $assessment->fresh();
        $this->assertEquals(1100000.00, (float) $updatedAssessment->total_market_value);
        $this->assertEquals(440000.00, (float) $updatedAssessment->total_assessed_value);
        $this->assertEquals(1100000.00, (float) $updatedAssessment->taxDeclaration->total_market_value);

        // 4. Test price decrease reassessment (e.g. -15% due to calamity/erosion)
        $decreaseRes = $this->actingAs($this->clerk)->postJson("/api/applications/{$this->application->id}/reassessments", [
            'adjustment_pct' => -15.0,
            'reassessment_type' => 'Decrease',
            'reason' => 'Severe riverbank erosion damage',
            'effective_year' => 2028,
            'effective_quarter' => 1,
        ]);
        $decreaseRes->assertCreated();
        $decId = $decreaseRes->json('id');

        $this->actingAs($this->assessor)->postJson("/api/reassessments/{$decId}/approve");

        // 1,100,000 * 0.85 = 935,000 MV
        $this->assertEquals(935000.00, (float) $assessment->fresh()->total_market_value);
        $this->assertEquals(374000.00, (float) $assessment->fresh()->total_assessed_value);
    }

    public function test_land_photos_upload_stream_and_delete(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('lot_frontage.jpg', 100, 'image/jpeg');

        // 1. Upload land photo
        $uploadRes = $this->actingAs($this->clerk)->postJson("/api/applications/{$this->application->id}/land-photos", [
            'title' => 'Lot Frontage & Access Road',
            'category' => 'Frontage / Road Access',
            'caption' => 'Paved 2-lane municipal road frontage with concrete boundary posts',
            'file' => $file,
        ]);
        $uploadRes->assertCreated();
        $photoId = $uploadRes->json('id');

        // 2. List land photos
        $listRes = $this->actingAs($this->assessor)->getJson("/api/applications/{$this->application->id}/land-photos");
        $listRes->assertOk();
        $listRes->assertJsonCount(1);
        $listRes->assertJsonFragment(['title' => 'Lot Frontage & Access Road']);

        // 3. Stream photo
        $streamRes = $this->actingAs($this->assessor)->get("/api/applications/{$this->application->id}/land-photos/{$photoId}");
        $streamRes->assertOk();

        // 4. Delete photo
        $delRes = $this->actingAs($this->clerk)->deleteJson("/api/applications/{$this->application->id}/land-photos/{$photoId}");
        $delRes->assertOk();

        $this->assertDatabaseMissing('application_land_photos', ['id' => $photoId]);
    }
}
