<?php

namespace App\Services;

use Carbon\Carbon;
use DateTimeInterface;

class TaxComputationService
{
    /**
     * Compute annual bill principal breakdown.
     */
    public function computeAnnualTax(float $assessedValue, float $basicRatePct, float $sefRatePct): array
    {
        $basicTax = round($assessedValue * ($basicRatePct / 100), 2);
        $sefTax = round($assessedValue * ($sefRatePct / 100), 2);
        $totalTax = round($basicTax + $sefTax, 2);

        return [
            'assessed_value' => round($assessedValue, 2),
            'basic_rate_pct' => $basicRatePct,
            'sef_rate_pct' => $sefRatePct,
            'basic_tax' => $basicTax,
            'sef_tax' => $sefTax,
            'total_tax' => $totalTax,
        ];
    }

    /**
     * Split annual tax into 4 quarterly installments (handling centavo rounding on Q4).
     */
    public function splitInstallments(float $basicTax, float $sefTax, int $year, BillingSettingsService $settings): array
    {
        $qBasic = floor(($basicTax / 4) * 100) / 100;
        $qSef = floor(($sefTax / 4) * 100) / 100;

        $installments = [];
        $runningBasic = 0.0;
        $runningSef = 0.0;

        for ($q = 1; $q <= 4; $q++) {
            $b = ($q === 4) ? round($basicTax - $runningBasic, 2) : $qBasic;
            $s = ($q === 4) ? round($sefTax - $runningSef, 2) : $qSef;
            $runningBasic += $b;
            $runningSef += $s;

            $installments[] = [
                'quarter' => $q,
                'due_date' => $settings->getDueDate($year, $q),
                'basic_due' => $b,
                'sef_due' => $s,
                'total_due' => round($b + $s, 2),
            ];
        }

        return $installments;
    }

    /**
     * Calculate how many months an installment is overdue as of a given date.
     * Follows Philippine LGC: interest accrues each month past the due date.
     */
    public function calculateMonthsLate(DateTimeInterface|string $dueDate, DateTimeInterface|string $asOfDate, int $maxMonths = 36): int
    {
        $due = Carbon::parse($dueDate)->startOfDay();
        $asOf = Carbon::parse($asOfDate)->startOfDay();

        if ($asOf->lte($due)) {
            return 0;
        }

        // Years difference * 12 + month difference
        $months = ($asOf->year - $due->year) * 12 + ($asOf->month - $due->month);

        // If the current day is past the due day within the month, count that month
        if ($asOf->day > $due->day) {
            $months++;
        }

        // Ensure at least 1 month if overdue
        $months = max(1, $months);

        return min($months, $maxMonths);
    }

    /**
     * Calculate penalty amount on an unpaid principal balance.
     */
    public function calculatePenalty(
        float $unpaidPrincipal,
        int $monthsLate,
        float $monthlyRatePct = 2.0,
        int $maxMonths = 36
    ): array {
        if ($unpaidPrincipal <= 0 || $monthsLate <= 0) {
            return [
                'months_late' => 0,
                'penalty_rate_pct' => 0.0,
                'penalty_amount' => 0.0,
            ];
        }

        $cappedMonths = min($monthsLate, $maxMonths);
        $totalPenaltyPct = round($cappedMonths * $monthlyRatePct, 3);
        $penaltyAmount = round($unpaidPrincipal * ($totalPenaltyPct / 100), 2);

        return [
            'months_late' => $cappedMonths,
            'penalty_rate_pct' => $totalPenaltyPct,
            'penalty_amount' => $penaltyAmount,
        ];
    }

    /**
     * Determine discount eligibility for an installment.
     * Advance Discount (e.g. 20%): if full year/quarter paid before Jan 1 of that tax year.
     * Prompt Discount (e.g. 10%): if paid on or before the quarter's due date.
     * No discounts apply to overdue/delinquent periods.
     */
    public function evaluateDiscount(
        int $taxableYear,
        DateTimeInterface|string $dueDate,
        float $principalAmount,
        DateTimeInterface|string $paymentDate,
        float $advanceDiscountPct = 20.0,
        float $promptDiscountPct = 10.0
    ): array {
        $payDate = Carbon::parse($paymentDate)->startOfDay();
        $due = Carbon::parse($dueDate)->startOfDay();
        $jan1 = Carbon::create($taxableYear, 1, 1)->startOfDay();

        if ($payDate->lt($jan1)) {
            $pct = $advanceDiscountPct;
            $type = 'Advance';
        } elseif ($payDate->lte($due)) {
            $pct = $promptDiscountPct;
            $type = 'Prompt';
        } else {
            return [
                'eligible' => false,
                'type' => null,
                'rate_pct' => 0.0,
                'discount_amount' => 0.0,
            ];
        }

        $discountAmount = round($principalAmount * ($pct / 100), 2);

        return [
            'eligible' => true,
            'type' => $type,
            'rate_pct' => $pct,
            'discount_amount' => $discountAmount,
        ];
    }
}
