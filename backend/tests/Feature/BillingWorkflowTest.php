<?php

namespace Tests\Feature;

use App\Enums\BillStatus;
use App\Enums\CorrectionStatus;
use App\Enums\PaymentStatus;
use App\Enums\SoaStatus;
use App\Enums\UserRole;
use App\Models\Payment;
use App\Models\StatementOfAccount;
use App\Models\TaxBill;
use App\Models\TaxDeclaration;
use App\Models\Taxpayer;
use App\Models\User;
use App\Services\BillingService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BillingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $clerk;
    private User $treasurer;
    private User $cashier;
    private User $taxpayerUser;
    private Taxpayer $taxpayer;
    private TaxDeclaration $td;

    protected function setUp(): void
    {
        parent::setUp();

        $this->taxpayer = Taxpayer::create([
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria@test.com',
            'address' => 'San Isidro, Magarao',
            'contact' => '09123456789',
        ]);

        $this->taxpayerUser = User::factory()->create([
            'username' => 'taxpayer_user',
            'email' => 'maria@test.com',
            'role' => UserRole::Taxpayer,
            'taxpayer_id' => $this->taxpayer->id,
            'password' => Hash::make('demo'),
        ]);

        $this->clerk = User::factory()->create([
            'username' => 'rev_clerk',
            'role' => UserRole::RevenueClerk,
            'password' => Hash::make('demo'),
        ]);

        $this->treasurer = User::factory()->create([
            'username' => 'treasurer_user',
            'role' => UserRole::Treasurer,
            'password' => Hash::make('demo'),
        ]);

        $this->cashier = User::factory()->create([
            'username' => 'cashier_user',
            'role' => UserRole::Cashier,
            'password' => Hash::make('demo'),
        ]);

        $app = \App\Models\Application::create([
            'intake_ref' => 'APP-2024-0001',
            'taxpayer_id' => $this->taxpayer->id,
            'taxpayer_name' => 'Maria Santos',
            'property_type' => 'Residential',
            'barangay' => 'San Isidro',
            'submission_date' => '2024-01-01',
            'status' => \App\Enums\ApplicationStatus::Active,
        ]);

        $assessment = \App\Models\Assessment::create([
            'application_id' => $app->id,
            'pin' => '010-01-0001-000-00',
            'arp_number' => '010-01-0001',
            'total_market_value' => 1000000.00,
            'total_assessed_value' => 500000.00,
            'taxability_status' => 'Taxable',
            'effective_year' => 2024,
            'effective_quarter' => 1,
            'status' => 'Authorized',
        ]);

        $this->td = TaxDeclaration::create([
            'assessment_id' => $assessment->id,
            'td_number' => 'TD-2024-0001',
            'owner_name' => 'Maria Santos',
            'barangay' => 'San Isidro',
            'total_market_value' => 1000000.00,
            'total_assessed_value' => 500000.00,
            'effectivity_date' => '2024-01-01',
            'status' => 'Active',
        ]);
    }

    public function test_can_generate_tax_bill_with_installments(): void
    {
        Sanctum::actingAs($this->clerk);

        $response = $this->postJson('/api/billing/bills/generate', [
            'tax_declaration_id' => $this->td->id,
            'taxable_year' => 2024,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('tax_bills', [
            'tax_declaration_id' => $this->td->id,
            'taxable_year' => 2024,
            'assessed_value' => 500000.00,
            'basic_tax' => 5000.00,
            'sef_tax' => 5000.00,
            'total_tax' => 10000.00,
            'status' => BillStatus::Unpaid->value,
        ]);

        $bill = TaxBill::first();
        $this->assertCount(4, $bill->installments);
    }

    public function test_soa_with_penalties_requires_treasurer_approval(): void
    {
        Sanctum::actingAs($this->clerk);

        // Generate bill for 2024 (which is past due as of 2026)
        $this->postJson('/api/billing/bills/generate', [
            'tax_declaration_id' => $this->td->id,
            'taxable_year' => 2024,
        ]);

        $response = $this->postJson('/api/billing/soas', [
            'tax_declaration_id' => $this->td->id,
            'as_of_date' => '2026-10-04',
        ]);

        $response->assertCreated();
        $soaId = $response->json('id');

        $soa = StatementOfAccount::find($soaId);
        $this->assertTrue($soa->has_penalty);
        $this->assertEquals(SoaStatus::PendingApproval, $soa->status);

        // Treasurer approves
        Sanctum::actingAs($this->treasurer);
        $approveRes = $this->postJson("/api/billing/soas/{$soaId}/approve", [
            'remarks' => 'Approved by treasurer',
        ]);

        $approveRes->assertOk();
        $this->assertEquals(SoaStatus::Issued->value, $approveRes->json('status'));
    }

    public function test_treasurer_can_deny_soa_and_clerk_can_revise(): void
    {
        $billingService = app(BillingService::class);
        $billingService->generateBill($this->td, 2024, $this->clerk);
        $soa = $billingService->generateStatementOfAccount($this->td, $this->clerk, ['as_of_date' => '2026-10-04']);

        Sanctum::actingAs($this->treasurer);
        $denyRes = $this->postJson("/api/billing/soas/{$soa->id}/deny", [
            'reason' => 'Penalty waived for amnesty period',
        ]);
        $denyRes->assertOk();
        $this->assertEquals(SoaStatus::Denied->value, $denyRes->json('status'));

        // Clerk revises
        Sanctum::actingAs($this->clerk);
        $reviseRes = $this->postJson("/api/billing/soas/{$soa->id}/revise", [
            'remarks' => 'Revised with adjusted penalties',
        ]);
        $reviseRes->assertCreated();
        $this->assertEquals(SoaStatus::Superseded, $soa->fresh()->status);
    }

    public function test_cashier_can_preview_and_record_payment(): void
    {
        $billingService = app(BillingService::class);
        $billingService->generateBill($this->td, 2024, $this->clerk);
        $soa = $billingService->generateStatementOfAccount($this->td, $this->clerk, ['as_of_date' => '2026-10-04']);
        $billingService->approveSoa($soa, $this->treasurer);

        Sanctum::actingAs($this->cashier);

        // Preview partial payment
        $previewRes = $this->postJson("/api/billing/soas/{$soa->id}/preview-payment", [
            'amount_tendered' => 6000.00,
        ]);
        $previewRes->assertOk();
        $this->assertEquals(6000, (float) $previewRes->json('amount_paid'));

        // Record partial payment
        $payRes = $this->postJson("/api/billing/soas/{$soa->id}/pay", [
            'amount_tendered' => 6000.00,
            'payment_method' => 'Cash',
        ]);
        $payRes->assertCreated();
        $this->assertDatabaseHas('payments', [
            'statement_of_account_id' => $soa->id,
            'amount_paid' => 6000.00,
            'status' => PaymentStatus::Posted->value,
        ]);

        $bill = TaxBill::first();
        $this->assertEquals(BillStatus::Partial, $bill->fresh()->status);
    }

    public function test_payment_correction_request_and_treasurer_approval(): void
    {
        $billingService = app(BillingService::class);
        $paymentService = app(PaymentService::class);

        $billingService->generateBill($this->td, 2024, $this->clerk);
        $soa = $billingService->generateStatementOfAccount($this->td, $this->clerk, ['as_of_date' => '2026-10-04']);
        $billingService->approveSoa($soa, $this->treasurer);
        $payment = $paymentService->recordPayment($soa->fresh(), $this->cashier, [
            'amount_tendered' => 5000.00,
        ]);

        // Cashier requests correction
        Sanctum::actingAs($this->cashier);
        $reqRes = $this->postJson("/api/billing/payments/{$payment->id}/correct", [
            'reason' => 'Wrong receipt issued by mistake',
        ]);
        $reqRes->assertCreated();
        $reqId = $reqRes->json('id');

        // Treasurer reviews and approves cancellation
        Sanctum::actingAs($this->treasurer);
        $reviewRes = $this->postJson("/api/billing/corrections/{$reqId}/review", [
            'approved' => true,
            'remarks' => 'Cancellation approved and reversed',
        ]);
        $reviewRes->assertOk()
            ->assertJsonPath('status', CorrectionStatus::Approved->value);

        // Verify payment is marked Cancelled (never deleted)
        $this->assertEquals(PaymentStatus::Cancelled, $payment->fresh()->status);
    }

    public function test_taxpayer_portal_access_is_restricted_to_own_records(): void
    {
        $billingService = app(BillingService::class);
        $billingService->generateBill($this->td, 2024, $this->clerk);

        Sanctum::actingAs($this->taxpayerUser);

        $duesRes = $this->getJson('/api/portal/dues');
        $duesRes->assertOk()
            ->assertJsonPath('taxpayer.name', 'Maria Santos');
    }
}
