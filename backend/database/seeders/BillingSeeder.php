<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\StatementOfAccount;
use App\Models\TaxDeclaration;
use App\Models\User;
use App\Services\BillingService;
use App\Services\PaymentService;
use Illuminate\Database\Seeder;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $revenueClerk = User::where('role', UserRole::RevenueClerk)->first()
            ?? User::where('username', 'clerk')->first();
        $treasurer = User::where('role', UserRole::Treasurer)->first()
            ?? User::where('username', 'admin')->first();
        $cashier = User::where('role', UserRole::Cashier)->first()
            ?? User::where('username', 'clerk')->first();

        if (! $revenueClerk || ! $treasurer || ! $cashier) {
            return;
        }

        $billingService = app(BillingService::class);
        $paymentService = app(PaymentService::class);

        $tds = TaxDeclaration::all();
        if ($tds->isEmpty()) {
            return;
        }

        // Generate bills for each TD from 2024 to 2026
        foreach ($tds as $td) {
            foreach ([2024, 2025, 2026] as $year) {
                $billingService->generateBill($td, $year, $revenueClerk);
            }
        }

        // TD 1: Maria Santos
        $td1 = $tds->first();
        if ($td1) {
            // Generate SOA as of today (will have overdue penalties for 2024 and 2025)
            $soa1 = $billingService->generateStatementOfAccount($td1, $revenueClerk, [
                'remarks' => 'Initial Assessment & Billing Statement for Maria Santos',
            ]);

            // Treasurer approves penalties for TD 1 so it is Issued
            if ($soa1->has_penalty) {
                $billingService->approveSoa($soa1, $treasurer, 'Verified and approved by Treasurer');
            }

            // Cashier records a partial payment of PHP 50,000 against this SOA
            try {
                $payment = $paymentService->recordPayment($soa1->fresh(), $cashier, [
                    'amount_tendered' => 50000.00,
                    'payment_method' => 'Cash',
                    'remarks' => 'Partial payment for 2024 real property taxes',
                ]);
            } catch (\Throwable $e) {
                // Ignore if preview/payment cannot be recorded
            }
        }

        // TD 2: Roberto Garcia (if available) - leave an SOA as PendingApproval for Treasurer review queue
        if ($tds->count() > 1) {
            $td2 = $tds->get(1);
            $billingService->generateStatementOfAccount($td2, $revenueClerk, [
                'remarks' => 'Billing statement awaiting Treasurer penalty review',
            ]);
        }
    }
}
