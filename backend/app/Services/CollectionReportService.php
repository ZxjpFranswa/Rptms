<?php

namespace App\Services;

use App\Enums\BillStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\TaxBillInstallment;
use App\Models\TaxDeclaration;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CollectionReportService
{
    public function __construct(
        private readonly TaxComputationService $calculator,
        private readonly BillingSettingsService $settings,
    ) {}

    /**
     * Daily collection report for a specific date.
     */
    public function dailyReport(string $date, ?string $barangay = null): array
    {
        $dayStart = Carbon::parse($date)->startOfDay();
        $dayEnd = Carbon::parse($date)->endOfDay();

        $query = Payment::query()
            ->whereBetween('payment_date', [$dayStart, $dayEnd])
            ->where('status', PaymentStatus::Posted)
            ->with(['allocations.installment.taxBill', 'cashier', 'taxDeclaration']);

        if ($barangay) {
            $query->where('barangay', $barangay);
        }

        $payments = $query->orderBy('or_number')->get();

        $totalBasic = 0.0;
        $totalSef = 0.0;
        $totalPenalty = 0.0;
        $totalDiscount = 0.0;
        $totalCollected = 0.0;
        $cashTotal = 0.0;
        $checkTotal = 0.0;

        $rows = [];
        foreach ($payments as $p) {
            $b = (float) $p->allocations->sum('basic_amount');
            $s = (float) $p->allocations->sum('sef_amount');
            $pen = (float) $p->allocations->sum('penalty_amount');
            $disc = (float) $p->allocations->sum('discount_amount');
            $tot = (float) $p->amount_paid;

            $totalBasic += $b;
            $totalSef += $s;
            $totalPenalty += $pen;
            $totalDiscount += $disc;
            $totalCollected += $tot;

            if (strcasecmp((string) $p->payment_method, 'Check') === 0) {
                $checkTotal += $tot;
            } else {
                $cashTotal += $tot;
            }

            $rows[] = [
                'id' => $p->id,
                'or_number' => $p->or_number,
                'payment_date' => $p->payment_date->toIso8601String(),
                'payor_name' => $p->payor_name,
                'barangay' => $p->barangay,
                'tax_declaration' => $p->taxDeclaration ? [
                    'id' => $p->taxDeclaration->id,
                    'td_number' => $p->taxDeclaration->td_number,
                ] : null,
                'payment_method' => $p->payment_method,
                'reference_no' => $p->reference_no,
                'cashier_name' => $p->cashier?->full_name,
                'cashier' => $p->cashier,
                'status' => $p->status->value,
                'basic_amount' => round($b, 2),
                'sef_amount' => round($s, 2),
                'penalty_amount' => round($pen, 2),
                'discount_amount' => round($disc, 2),
                'amount_paid' => round($tot, 2),
                'allocations' => $p->allocations,
            ];
        }

        $summary = [
            'total_transactions' => count($rows),
            'total_basic' => round($totalBasic, 2),
            'total_sef' => round($totalSef, 2),
            'total_penalty' => round($totalPenalty, 2),
            'total_discount' => round($totalDiscount, 2),
            'total_collected' => round($totalCollected, 2),
            'cash_total' => round($cashTotal, 2),
            'check_total' => round($checkTotal, 2),
        ];

        return [
            'date' => $date,
            'barangay' => $barangay,
            'total_transactions' => count($rows),
            'total_basic' => round($totalBasic, 2),
            'total_sef' => round($totalSef, 2),
            'total_penalty' => round($totalPenalty, 2),
            'total_discount' => round($totalDiscount, 2),
            'total_collected' => round($totalCollected, 2),
            'cash_total' => round($cashTotal, 2),
            'check_total' => round($checkTotal, 2),
            'summary' => $summary,
            'payments' => $rows,
            'transactions' => $rows,
        ];
    }

    /**
     * Monthly collection summary.
     */
    public function monthlyReport(int $year, int $month, ?string $barangay = null): array
    {
        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = (clone $start)->endOfMonth()->endOfDay();

        $query = Payment::query()
            ->whereBetween('payment_date', [$start, $end])
            ->where('status', PaymentStatus::Posted)
            ->with('allocations');

        if ($barangay) {
            $query->where('barangay', $barangay);
        }

        $payments = $query->get();

        // Group by day of month
        $byDay = [];
        $daysInMonth = $start->daysInMonth;
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $d);
            $byDay[$dateStr] = [
                'date' => $dateStr,
                'count' => 0,
                'basic' => 0.0,
                'sef' => 0.0,
                'penalty' => 0.0,
                'discount' => 0.0,
                'total' => 0.0,
            ];
        }

        foreach ($payments as $p) {
            $dStr = $p->payment_date->toDateString();
            if (isset($byDay[$dStr])) {
                $byDay[$dStr]['count']++;
                $byDay[$dStr]['basic'] += (float) $p->allocations->sum('basic_amount');
                $byDay[$dStr]['sef'] += (float) $p->allocations->sum('sef_amount');
                $byDay[$dStr]['penalty'] += (float) $p->allocations->sum('penalty_amount');
                $byDay[$dStr]['discount'] += (float) $p->allocations->sum('discount_amount');
                $byDay[$dStr]['total'] += (float) $p->amount_paid;
            }
        }

        $sumBasic = (float) $payments->sum(fn ($p) => $p->allocations->sum('basic_amount'));
        $sumSef = (float) $payments->sum(fn ($p) => $p->allocations->sum('sef_amount'));
        $sumPen = (float) $payments->sum(fn ($p) => $p->allocations->sum('penalty_amount'));
        $sumDisc = (float) $payments->sum(fn ($p) => $p->allocations->sum('discount_amount'));
        $sumTot = (float) $payments->sum('amount_paid');

        $summary = [
            'total_collected' => round($sumTot, 2),
            'total_transactions' => $payments->count(),
            'total_basic' => round($sumBasic, 2),
            'total_sef' => round($sumSef, 2),
            'total_penalty' => round($sumPen, 2),
            'total_discount' => round($sumDisc, 2),
        ];

        return [
            'year' => $year,
            'month' => $month,
            'total_collected' => $summary['total_collected'],
            'total_transactions' => $summary['total_transactions'],
            'summary' => $summary,
            'daily_summary' => array_values(array_map(fn ($r) => [
                'date' => $r['date'],
                'count' => $r['count'],
                'basic' => round($r['basic'], 2),
                'sef' => round($r['sef'], 2),
                'penalty' => round($r['penalty'], 2),
                'discount' => round($r['discount'], 2),
                'total' => round($r['total'], 2),
            ], $byDay)),
        ];
    }

    /**
     * Annual collection summary grouped by month.
     */
    public function annualReport(int $year, ?string $barangay = null): array
    {
        $months = [];
        $annualTotal = 0.0;

        for ($m = 1; $m <= 12; $m++) {
            $start = Carbon::create($year, $m, 1)->startOfDay();
            $end = (clone $start)->endOfMonth()->endOfDay();

            $q = Payment::query()
                ->whereBetween('payment_date', [$start, $end])
                ->where('status', PaymentStatus::Posted)
                ->with('allocations');

            if ($barangay) {
                $q->where('barangay', $barangay);
            }

            $list = $q->get();
            $tot = (float) $list->sum('amount_paid');
            $annualTotal += $tot;

            $months[] = [
                'month' => $m,
                'month_name' => $start->format('F'),
                'count' => $list->count(),
                'basic' => round((float) $list->sum(fn ($p) => $p->allocations->sum('basic_amount')), 2),
                'sef' => round((float) $list->sum(fn ($p) => $p->allocations->sum('sef_amount')), 2),
                'penalty' => round((float) $list->sum(fn ($p) => $p->allocations->sum('penalty_amount')), 2),
                'discount' => round((float) $list->sum(fn ($p) => $p->allocations->sum('discount_amount')), 2),
                'total' => round($tot, 2),
            ];
        }

        $sumBasic = 0.0;
        $sumSef = 0.0;
        $sumPen = 0.0;
        $sumDisc = 0.0;
        $sumCount = 0;
        foreach ($months as $m) {
            $sumBasic += $m['basic'];
            $sumSef += $m['sef'];
            $sumPen += $m['penalty'];
            $sumDisc += $m['discount'];
            $sumCount += $m['count'];
        }

        $summary = [
            'annual_total' => round($annualTotal, 2),
            'total_collected' => round($annualTotal, 2),
            'total_transactions' => $sumCount,
            'total_basic' => round($sumBasic, 2),
            'total_sef' => round($sumSef, 2),
            'total_penalty' => round($sumPen, 2),
            'total_discount' => round($sumDisc, 2),
        ];

        return [
            'year' => $year,
            'annual_total' => round($annualTotal, 2),
            'total_collected' => round($annualTotal, 2),
            'summary' => $summary,
            'monthly_summary' => $months,
        ];
    }

    /**
     * Collection summary grouped by barangay.
     */
    public function collectionByBarangay(int $year): array
    {
        $start = Carbon::create($year, 1, 1)->startOfDay();
        $end = Carbon::create($year, 12, 31)->endOfDay();

        $payments = Payment::query()
            ->whereBetween('payment_date', [$start, $end])
            ->where('status', PaymentStatus::Posted)
            ->with('allocations')
            ->get();

        $grouped = $payments->groupBy('barangay');

        $result = [];
        foreach ($grouped as $bgy => $items) {
            $result[] = [
                'barangay' => $bgy,
                'transactions' => $items->count(),
                'basic' => round((float) $items->sum(fn ($p) => $p->allocations->sum('basic_amount')), 2),
                'sef' => round((float) $items->sum(fn ($p) => $p->allocations->sum('sef_amount')), 2),
                'penalty' => round((float) $items->sum(fn ($p) => $p->allocations->sum('penalty_amount')), 2),
                'discount' => round((float) $items->sum(fn ($p) => $p->allocations->sum('discount_amount')), 2),
                'total' => round((float) $items->sum('amount_paid'), 2),
            ];
        }

        usort($result, fn ($a, $b) => $b['total'] <=> $a['total']);

        return $result;
    }

    /**
     * Collection summary by Tax Year (current year vs prior delinquent years).
     */
    public function collectionByTaxYear(int $collectionYear): array
    {
        $start = Carbon::create($collectionYear, 1, 1)->startOfDay();
        $end = Carbon::create($collectionYear, 12, 31)->endOfDay();

        $allocations = DB::table('payment_allocations')
            ->join('payments', 'payment_allocations.payment_id', '=', 'payments.id')
            ->whereBetween('payments.payment_date', [$start, $end])
            ->where('payments.status', PaymentStatus::Posted->value)
            ->select(
                'payment_allocations.taxable_year',
                DB::raw('SUM(payment_allocations.basic_amount) as basic'),
                DB::raw('SUM(payment_allocations.sef_amount) as sef'),
                DB::raw('SUM(payment_allocations.penalty_amount) as penalty'),
                DB::raw('SUM(payment_allocations.discount_amount) as discount'),
                DB::raw('SUM(payment_allocations.total_amount) as total')
            )
            ->groupBy('payment_allocations.taxable_year')
            ->orderBy('payment_allocations.taxable_year', 'desc')
            ->get();

        return $allocations->map(fn ($row) => [
            'taxable_year' => $row->taxable_year,
            'is_current_year' => $row->taxable_year === $collectionYear,
            'basic' => round((float) $row->basic, 2),
            'sef' => round((float) $row->sef, 2),
            'penalty' => round((float) $row->penalty, 2),
            'discount' => round((float) $row->discount, 2),
            'total' => round((float) $row->total, 2),
        ])->all();
    }

    /**
     * Delinquent property list and aging of unpaid taxes.
     */
    public function delinquentAccounts(array $filters = []): array
    {
        $asOf = Arr::get($filters, 'as_of_date', now()->toDateString());
        $barangay = Arr::get($filters, 'barangay');
        $search = Arr::get($filters, 'search');

        $config = $this->settings->all();
        $monthlyRate = (float) $config['monthlyPenaltyPct'];
        $maxPenaltyMonths = (int) $config['maxPenaltyMonths'];

        // Find all active tax declarations
        $query = TaxDeclaration::query()
            ->where('status', 'Active')
            ->with(['taxBills.installments', 'assessment.application']);

        if ($barangay) {
            $query->where('barangay', $barangay);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('td_number', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%")
                    ->orWhere('barangay', 'like', "%{$search}%");
            });
        }

        $tds = $query->get();
        $delinquents = [];

        $totalDelinquentPrincipal = 0.0;
        $totalDelinquentPenalties = 0.0;
        $totalDelinquentDue = 0.0;

        foreach ($tds as $td) {
            $overdueInstallments = [];
            $propBasic = 0.0;
            $propSef = 0.0;
            $propPenalty = 0.0;

            // Aging buckets
            $aging = [
                'current_year' => 0.0,
                'one_to_two_years' => 0.0,
                'two_to_three_years' => 0.0,
                'over_three_years' => 0.0,
            ];

            foreach ($td->taxBills as $bill) {
                foreach ($bill->installments as $inst) {
                    $princBal = $inst->principal_balance;
                    if ($princBal <= 0) continue;

                    $monthsLate = $this->calculator->calculateMonthsLate(
                        $inst->due_date,
                        $asOf,
                        $maxPenaltyMonths
                    );

                    // If not overdue yet, skip
                    if ($monthsLate <= 0) continue;

                    $pen = $this->calculator->calculatePenalty(
                        $princBal,
                        $monthsLate,
                        $monthlyRate,
                        $maxPenaltyMonths
                    );

                    $instPenalty = $pen['penalty_amount'];
                    $instTotal = round($princBal + $instPenalty, 2);

                    $propBasic += $inst->basic_balance;
                    $propSef += $inst->sef_balance;
                    $propPenalty += $instPenalty;

                    // Classify into aging bucket
                    if ($monthsLate <= 12) {
                        $aging['current_year'] += $instTotal;
                    } elseif ($monthsLate <= 24) {
                        $aging['one_to_two_years'] += $instTotal;
                    } elseif ($monthsLate <= 36) {
                        $aging['two_to_three_years'] += $instTotal;
                    } else {
                        $aging['over_three_years'] += $instTotal;
                    }

                    $overdueInstallments[] = [
                        'year' => $bill->taxable_year,
                        'quarter' => $inst->quarter,
                        'due_date' => $inst->due_date,
                        'principal_balance' => $princBal,
                        'months_late' => $monthsLate,
                        'penalty' => $instPenalty,
                        'total' => $instTotal,
                    ];
                }
            }

            if (! empty($overdueInstallments)) {
                $propTotal = round($propBasic + $propSef + $propPenalty, 2);
                $totalDelinquentPrincipal += ($propBasic + $propSef);
                $totalDelinquentPenalties += $propPenalty;
                $totalDelinquentDue += $propTotal;

                $app = $td->assessment?->application;

                $delinquents[] = [
                    'tax_declaration_id' => $td->id,
                    'td_number' => $td->td_number,
                    'owner_name' => $td->owner_name,
                    'barangay' => $td->barangay,
                    'pin' => $app?->propertyDetail?->pin ?? $td->assessment?->pin,
                    'assessed_value' => (float) $td->total_assessed_value,
                    'unpaid_years_count' => count(array_unique(array_column($overdueInstallments, 'year'))),
                    'basic_balance' => round($propBasic, 2),
                    'sef_balance' => round($propSef, 2),
                    'total_principal' => round($propBasic + $propSef, 2),
                    'total_penalties' => round($propPenalty, 2),
                    'total_amount_due' => $propTotal,
                    'aging' => array_map(fn ($v) => round($v, 2), $aging),
                    'overdue_installments' => $overdueInstallments,
                ];
            }
        }

        return [
            'as_of_date' => $asOf,
            'total_delinquent_properties' => count($delinquents),
            'total_delinquent_principal' => round($totalDelinquentPrincipal, 2),
            'total_delinquent_penalties' => round($totalDelinquentPenalties, 2),
            'total_delinquent_due' => round($totalDelinquentDue, 2),
            'properties' => $delinquents,
        ];
    }

    /**
     * Official Receipt (OR) register report.
     */
    public function officialReceiptRegister(array $filters = []): array
    {
        $query = Payment::query()->with([
            'allocations.installment.taxBill',
            'cashier',
            'taxDeclaration',
            'statementOfAccount',
        ]);

        if ($status = Arr::get($filters, 'status')) {
            $query->where('status', $status);
        }
        if ($barangay = Arr::get($filters, 'barangay')) {
            $query->where('barangay', $barangay);
        }
        if ($startDate = Arr::get($filters, 'start_date')) {
            $query->where('payment_date', '>=', Carbon::parse($startDate)->startOfDay());
        }
        if ($endDate = Arr::get($filters, 'end_date')) {
            $query->where('payment_date', '<=', Carbon::parse($endDate)->endOfDay());
        }

        $payments = $query->orderByDesc('payment_date')->get();

        $rows = $payments->map(fn (Payment $p) => [
            'id' => $p->id,
            'or_number' => $p->or_number,
            'payment_date' => $p->payment_date->toIso8601String(),
            'payor_name' => $p->payor_name,
            'barangay' => $p->barangay,
            'td_number' => $p->taxDeclaration?->td_number ?? $p->statementOfAccount?->td_number,
            'tax_declaration' => $p->taxDeclaration ? [
                'id' => $p->taxDeclaration->id,
                'td_number' => $p->taxDeclaration->td_number,
            ] : null,
            'payment_method' => $p->payment_method,
            'reference_no' => $p->reference_no,
            'cashier_name' => $p->cashier?->full_name,
            'cashier' => $p->cashier ? [
                'id' => $p->cashier->id,
                'full_name' => $p->cashier->full_name,
            ] : null,
            'status' => $p->status->value,
            'cancellation_reason' => $p->cancellation_reason,
            'remarks' => $p->remarks,
            'amount_due' => round((float) $p->amount_due, 2),
            'amount_tendered' => round((float) $p->amount_tendered, 2),
            'change_amount' => round((float) $p->change_amount, 2),
            'balance_after' => round((float) $p->balance_after, 2),
            'basic_amount' => round((float) $p->allocations->sum('basic_amount'), 2),
            'sef_amount' => round((float) $p->allocations->sum('sef_amount'), 2),
            'penalty_amount' => round((float) $p->allocations->sum('penalty_amount'), 2),
            'discount_amount' => round((float) $p->discount_amount, 2),
            'amount_paid' => round((float) $p->amount_paid, 2),
            'allocations' => $p->allocations,
        ])->all();

        return [
            'total_records' => count($rows),
            'total_collected' => round((float) $payments->where('status', PaymentStatus::Posted)->sum('amount_paid'), 2),
            'receipts' => $rows,
        ];
    }
}
