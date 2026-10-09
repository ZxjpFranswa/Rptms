<?php

namespace App\Services;
namespace App\Http\Controllers\Api;

use App\Enums\CorrectionStatus;
use App\Enums\PaymentStatus;
use App\Enums\SoaStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentCorrectionRequest;
use App\Models\StatementOfAccount;
use App\Models\TaxBill;
use App\Models\TaxDeclaration;
use App\Models\Taxpayer;
use App\Services\AuditService;
use App\Services\BillingService;
use App\Services\BillingSettingsService;
use App\Services\CollectionReportService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BillingController extends Controller
{
    public function __construct(
        private readonly BillingService $billingService,
        private readonly PaymentService $paymentService,
        private readonly CollectionReportService $reports,
        private readonly BillingSettingsService $settingsService,
        private readonly AuditService $audit,
    ) {}

    /**
     * Search taxpayers and properties for billing.
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('query', ''));

        $tds = TaxDeclaration::query()
            ->where('status', 'Active')
            ->with(['assessment.application.taxpayer', 'taxBills.installments'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('td_number', 'like', "%{$query}%")
                        ->orWhere('owner_name', 'like', "%{$query}%")
                        ->orWhere('barangay', 'like', "%{$query}%")
                        ->orWhereHas('assessment.application.propertyDetail', fn ($p) => $p->where('pin', 'like', "%{$query}%"));
                });
            })
            ->orderBy('owner_name', 'asc')
            ->limit(100)
            ->get();

        $results = $tds->map(function (TaxDeclaration $td) {
            $app = $td->assessment?->application;
            $taxpayer = $app?->taxpayer;

            $totalUnpaid = 0.0;
            foreach ($td->taxBills as $b) {
                foreach ($b->installments as $i) {
                    $totalUnpaid += $i->principal_balance;
                }
            }

            // Latest active SOA
            $latestSoa = StatementOfAccount::query()
                ->where('tax_declaration_id', $td->id)
                ->whereIn('status', [SoaStatus::Issued->value, SoaStatus::PendingApproval->value])
                ->latest()
                ->first();

            return [
                'tax_declaration_id' => $td->id,
                'td_number' => $td->td_number,
                'owner_name' => $td->owner_name,
                'barangay' => $td->barangay,
                'pin' => $app?->propertyDetail?->pin ?? $td->assessment?->pin,
                'arp_number' => $app?->propertyDetail?->arp_number ?? $td->assessment?->arp_number,
                'total_assessed_value' => (float) $td->total_assessed_value,
                'taxpayer_id' => $taxpayer?->id,
                'taxpayer_name' => $taxpayer?->full_name ?? $td->owner_name,
                'taxpayer_email' => $taxpayer?->email,
                'taxpayer_contact' => $taxpayer?->contact,
                'has_outstanding_balance' => $totalUnpaid > 0.001,
                'outstanding_principal' => round($totalUnpaid, 2),
                'active_soa' => $latestSoa ? [
                    'id' => $latestSoa->id,
                    'soa_no' => $latestSoa->soa_no,
                    'status' => $latestSoa->status->value,
                    'total_amount_due' => (float) $latestSoa->total_amount_due,
                    'valid_until' => $latestSoa->valid_until,
                    'has_penalty' => $latestSoa->has_penalty,
                ] : null,
            ];
        });

        return response()->json($results);
    }

    /**
     * View detailed tax dues for a specific Tax Declaration.
     */
    public function propertyDues(TaxDeclaration $taxDeclaration): JsonResponse
    {
        $taxDeclaration->load([
            'assessment.application.taxpayer',
            'assessment.application.propertyDetail',
            'taxBills.installments',
            'statementsOfAccount' => fn ($q) => $q->latest()->limit(5),
            'payments' => fn ($q) => $q->where('status', PaymentStatus::Posted)->latest()->limit(10),
        ]);

        $app = $taxDeclaration->assessment?->application;

        // Active SOA
        $activeSoa = $taxDeclaration->statementsOfAccount
            ->first(fn ($s) => in_array($s->status, [SoaStatus::Issued, SoaStatus::PendingApproval]));

        return response()->json([
            'property' => [
                'tax_declaration_id' => $taxDeclaration->id,
                'td_number' => $taxDeclaration->td_number,
                'owner_name' => $taxDeclaration->owner_name,
                'barangay' => $taxDeclaration->barangay,
                'pin' => $app?->propertyDetail?->pin ?? $taxDeclaration->assessment?->pin,
                'arp_number' => $app?->propertyDetail?->arp_number ?? $taxDeclaration->assessment?->arp_number,
                'total_assessed_value' => (float) $taxDeclaration->total_assessed_value,
                'taxpayer' => $app?->taxpayer,
            ],
            'bills' => $taxDeclaration->taxBills->map(fn (TaxBill $b) => [
                'id' => $b->id,
                'bill_no' => $b->bill_no,
                'taxable_year' => $b->taxable_year,
                'assessed_value' => (float) $b->assessed_value,
                'basic_tax' => (float) $b->basic_tax,
                'sef_tax' => (float) $b->sef_tax,
                'total_tax' => (float) $b->total_tax,
                'status' => $b->status->value,
                'installments' => $b->installments->map(fn ($i) => [
                    'id' => $i->id,
                    'quarter' => $i->quarter,
                    'due_date' => $i->due_date,
                    'basic_due' => (float) $i->basic_due,
                    'sef_due' => (float) $i->sef_due,
                    'total_due' => (float) $i->total_due,
                    'basic_paid' => (float) $i->basic_paid,
                    'sef_paid' => (float) $i->sef_paid,
                    'penalty_paid' => (float) $i->penalty_paid,
                    'discount_granted' => (float) $i->discount_granted,
                    'basic_balance' => $i->basic_balance,
                    'sef_balance' => $i->sef_balance,
                    'principal_balance' => $i->principal_balance,
                    'status' => $i->status->value,
                ]),
            ]),
            'active_soa' => $activeSoa,
            'recent_payments' => $taxDeclaration->payments,
        ]);
    }

    /**
     * List tax bills with filters.
     */
    public function listBills(Request $request): JsonResponse
    {
        $query = TaxBill::query()->with(['taxDeclaration', 'installments']);

        if ($year = $request->query('year')) {
            $query->where('taxable_year', $year);
        }
        if ($barangay = $request->query('barangay')) {
            $query->where('barangay', $barangay);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('bill_no', 'like', "%{$search}%")
                    ->orWhere('td_number', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%");
            });
        }

        $bills = $query->orderByDesc('taxable_year')->orderByDesc('bill_no')->paginate((int) $request->query('per_page', 15));

        return response()->json($bills);
    }

    /**
     * Revenue Clerk generates tax bill for a specific TD.
     */
    public function generateBill(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tax_declaration_id' => ['required', 'uuid', 'exists:tax_declarations,id'],
            'taxable_year' => ['nullable', 'integer', 'min:2000', 'max:2099'],
        ]);

        $td = TaxDeclaration::findOrFail($data['tax_declaration_id']);
        $year = $data['taxable_year'] ?? (int) date('Y');

        $bill = $this->billingService->generateBill($td, $year, $request->user());

        return response()->json($bill, 201);
    }

    /**
     * List Statements of Account (filter by status, search, etc.).
     */
    public function listSoas(Request $request): JsonResponse
    {
        $query = StatementOfAccount::query()->with(['taxDeclaration', 'items', 'preparer', 'reviewer']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($barangay = $request->query('barangay')) {
            $query->where('barangay', $barangay);
        }
        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('soa_no', 'like', "%{$search}%")
                    ->orWhere('td_number', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%");
            });
        }

        $soas = $query->orderByDesc('created_at')->paginate((int) $request->query('per_page', 15));

        return response()->json($soas);
    }

    /**
     * Generate an SOA (Revenue Clerk).
     */
    public function createSoa(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tax_declaration_id' => ['required', 'uuid', 'exists:tax_declarations,id'],
            'as_of_date' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
            'adjustments' => ['nullable', 'array'],
        ]);

        $td = TaxDeclaration::findOrFail($data['tax_declaration_id']);
        $soa = $this->billingService->generateStatementOfAccount($td, $request->user(), $data);

        return response()->json($soa, 201);
    }

    /**
     * View single SOA with full details.
     */
    public function showSoa(StatementOfAccount $soa): JsonResponse
    {
        $soa->load([
            'taxDeclaration.assessment.application',
            'taxpayer',
            'items.installment.taxBill',
            'preparer',
            'reviewer',
            'revisionOf',
        ]);

        return response()->json($soa);
    }

    /**
     * Treasurer approves an SOA with penalties.
     */
    public function approveSoa(Request $request, StatementOfAccount $soa): JsonResponse
    {
        $data = $request->validate([
            'remarks' => ['nullable', 'string'],
        ]);

        $approved = $this->billingService->approveSoa($soa, $request->user(), $data['remarks'] ?? '');

        return response()->json($approved);
    }

    /**
     * Treasurer denies an SOA with penalties.
     */
    public function denySoa(Request $request, StatementOfAccount $soa): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $denied = $this->billingService->denySoa($soa, $request->user(), $data['reason']);

        return response()->json($denied);
    }

    /**
     * Revenue Clerk revises a denied SOA.
     */
    public function reviseSoa(Request $request, StatementOfAccount $soa): JsonResponse
    {
        $data = $request->validate([
            'adjustments' => ['nullable', 'array'],
            'remarks' => ['nullable', 'string'],
        ]);

        $revised = $this->billingService->reviseSoa(
            $soa,
            $request->user(),
            $data['adjustments'] ?? [],
            $data['remarks'] ?? ''
        );

        return response()->json($revised, 201);
    }

    /**
     * Cashier previews payment before posting.
     */
    public function previewPayment(Request $request, StatementOfAccount $soa): JsonResponse
    {
        $data = $request->validate([
            'amount_tendered' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['nullable', 'date'],
        ]);

        $preview = $this->paymentService->previewPayment(
            $soa,
            (float) $data['amount_tendered'],
            $data['payment_date'] ?? null
        );

        return response()->json($preview);
    }

    /**
     * Cashier records onsite payment and issues Official Receipt.
     */
    public function recordPayment(Request $request, StatementOfAccount $soa): JsonResponse
    {
        $data = $request->validate([
            'payor_name' => ['nullable', 'string', 'max:255'],
            'amount_tendered' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string', 'in:Cash,Check'],
            'reference_no' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
        ]);

        $payment = $this->paymentService->recordPayment($soa, $request->user(), $data);

        return response()->json($payment, 201);
    }

    /**
     * View Official Receipt details.
     */
    public function showReceipt(Payment $payment): JsonResponse
    {
        $payment->load([
            'allocations.installment.taxBill',
            'taxDeclaration.assessment.application',
            'statementOfAccount',
            'cashier',
            'cancelledBy',
        ]);

        return response()->json($payment);
    }

    /**
     * Cashier requests correction / cancellation of a posted payment.
     */
    public function requestCorrection(Request $request, Payment $payment): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:5'],
            'request_type' => ['nullable', 'string', 'in:Cancellation,Correction'],
        ]);

        $req = $this->paymentService->requestCorrection(
            $payment,
            $request->user(),
            $data['reason'],
            $data['request_type'] ?? 'Cancellation'
        );

        return response()->json($req, 201);
    }

    /**
     * List payment correction requests (for Treasurer).
     */
    public function listCorrections(Request $request): JsonResponse
    {
        $query = PaymentCorrectionRequest::query()
            ->with(['payment.cashier', 'payment.statementOfAccount', 'requester', 'reviewer']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->orderByDesc('created_at')->paginate((int) $request->query('per_page', 20)));
    }

    /**
     * Treasurer approves or denies a payment correction request.
     */
    public function reviewCorrection(
        Request $request,
        PaymentCorrectionRequest $correctionRequest
    ): JsonResponse {
        $data = $request->validate([
            'approved' => ['required', 'boolean'],
            'remarks' => ['nullable', 'string'],
        ]);

        $reviewed = $this->paymentService->reviewCorrection(
            $correctionRequest,
            $request->user(),
            (bool) $data['approved'],
            $data['remarks'] ?? ''
        );

        return response()->json($reviewed);
    }

    /**
     * Reports
     */
    public function dailyReport(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());
        $barangay = $request->query('barangay');

        return response()->json($this->reports->dailyReport($date, $barangay));
    }

    public function monthlyReport(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', date('Y'));
        $month = (int) $request->query('month', date('n'));
        $barangay = $request->query('barangay');

        return response()->json($this->reports->monthlyReport($year, $month, $barangay));
    }

    public function annualReport(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', date('Y'));
        $barangay = $request->query('barangay');

        return response()->json($this->reports->annualReport($year, $barangay));
    }

    public function collectionByBarangay(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', date('Y'));

        return response()->json($this->reports->collectionByBarangay($year));
    }

    public function collectionByTaxYear(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', date('Y'));

        return response()->json($this->reports->collectionByTaxYear($year));
    }

    public function delinquentAccounts(Request $request): JsonResponse
    {
        return response()->json($this->reports->delinquentAccounts($request->all()));
    }

    public function officialReceiptRegister(Request $request): JsonResponse
    {
        return response()->json($this->reports->officialReceiptRegister($request->all()));
    }

    /**
     * Billing Settings
     */
    public function getSettings(): JsonResponse
    {
        return response()->json($this->settingsService->all());
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'basicRatePct' => ['sometimes', 'numeric', 'min:0.1', 'max:10'],
            'sefRatePct' => ['sometimes', 'numeric', 'min:0.1', 'max:10'],
            'monthlyPenaltyPct' => ['sometimes', 'numeric', 'min:0', 'max:10'],
            'maxPenaltyMonths' => ['sometimes', 'integer', 'min:1', 'max:72'],
            'advanceDiscountPct' => ['sometimes', 'numeric', 'min:0', 'max:50'],
            'promptDiscountPct' => ['sometimes', 'numeric', 'min:0', 'max:50'],
            'quarterDueDates' => ['sometimes', 'array'],
            'orPrefix' => ['sometimes', 'string'],
            'soaPrefix' => ['sometimes', 'string'],
            'billPrefix' => ['sometimes', 'string'],
            'billOrOrdinanceName' => ['nullable', 'string', 'max:255'],
            'changeNote' => ['nullable', 'string', 'max:1000'],
            'changedAt' => ['nullable', 'string'],
        ]);

        $updated = $this->settingsService->update($data, $request->user());
        $billDesc = $data['billOrOrdinanceName'] ?? 'Statutory Update';
        $noteDesc = $data['changeNote'] ?? 'Rates calibrated';
        $this->audit->log($request->user(), 'Updated Statutory Billing Settings', $billDesc, "Bill/Ordinance: {$billDesc} | Note: {$noteDesc}");

        return response()->json($updated);
    }
}
