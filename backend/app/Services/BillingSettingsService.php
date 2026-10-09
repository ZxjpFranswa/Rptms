<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Arr;

class BillingSettingsService
{
    private const KEY = 'billing';

    public function all(): array
    {
        $setting = Setting::query()->find(self::KEY);
        return array_merge($this->defaults(), $setting?->value ?? []);
    }

    public function update(array $payload, ?User $user = null): array
    {
        $current = $this->all();
        $history = $current['changeHistory'] ?? [];

        $hasRateChange = (isset($payload['basicRatePct']) && (float) $payload['basicRatePct'] !== (float) ($current['basicRatePct'] ?? 0))
            || (isset($payload['sefRatePct']) && (float) $payload['sefRatePct'] !== (float) ($current['sefRatePct'] ?? 0))
            || (isset($payload['monthlyPenaltyPct']) && (float) $payload['monthlyPenaltyPct'] !== (float) ($current['monthlyPenaltyPct'] ?? 0))
            || (isset($payload['maxPenaltyMonths']) && (int) $payload['maxPenaltyMonths'] !== (int) ($current['maxPenaltyMonths'] ?? 0))
            || (isset($payload['advanceDiscountPct']) && (float) $payload['advanceDiscountPct'] !== (float) ($current['advanceDiscountPct'] ?? 0))
            || (isset($payload['promptDiscountPct']) && (float) $payload['promptDiscountPct'] !== (float) ($current['promptDiscountPct'] ?? 0))
            || ! empty($payload['billOrOrdinanceName'])
            || ! empty($payload['changeNote']);

        $changedAt = $payload['changedAt'] ?? now()->toDateString();
        $billName = ! empty($payload['billOrOrdinanceName']) ? $payload['billOrOrdinanceName'] : ($current['billOrOrdinanceName'] ?? 'Municipal Ordinance');
        $note = $payload['changeNote'] ?? ($current['changeNote'] ?? '');
        $changedBy = $user?->full_name ?? ($user?->username ?? 'Administrator');

        if ($hasRateChange) {
            array_unshift($history, [
                'billOrOrdinanceName' => $billName,
                'changeNote' => $note,
                'changedAt' => $changedAt,
                'changedBy' => $changedBy,
                'basicRatePct' => $payload['basicRatePct'] ?? ($current['basicRatePct'] ?? 1.0),
                'sefRatePct' => $payload['sefRatePct'] ?? ($current['sefRatePct'] ?? 1.0),
                'monthlyPenaltyPct' => $payload['monthlyPenaltyPct'] ?? ($current['monthlyPenaltyPct'] ?? 2.0),
                'maxPenaltyMonths' => $payload['maxPenaltyMonths'] ?? ($current['maxPenaltyMonths'] ?? 36),
                'advanceDiscountPct' => $payload['advanceDiscountPct'] ?? ($current['advanceDiscountPct'] ?? 20.0),
                'promptDiscountPct' => $payload['promptDiscountPct'] ?? ($current['promptDiscountPct'] ?? 10.0),
                'recordedAt' => now()->toIso8601String(),
            ]);

            $history = array_slice($history, 0, 20);
        }

        $payload['changeHistory'] = $history;
        $payload['billOrOrdinanceName'] = $billName;
        $payload['changeNote'] = $note;
        $payload['changedAt'] = $changedAt;
        $payload['changedBy'] = $changedBy;

        $merged = array_merge($current, $payload);
        Setting::query()->updateOrCreate(['key' => self::KEY], ['value' => $merged]);

        return $merged;
    }

    public function defaults(): array
    {
        return [
            'basicRatePct' => 1.0,
            'sefRatePct' => 1.0,
            'monthlyPenaltyPct' => 2.0,
            'maxPenaltyMonths' => 36, // capped at 72%
            'advanceDiscountPct' => 20.0,
            'promptDiscountPct' => 10.0,
            'quarterDueDates' => [
                ['quarter' => 1, 'month' => 1, 'day' => 20],
                ['quarter' => 2, 'month' => 4, 'day' => 20],
                ['quarter' => 3, 'month' => 7, 'day' => 20],
                ['quarter' => 4, 'month' => 10, 'day' => 20],
            ],
            'orPrefix' => 'OR',
            'soaPrefix' => 'SOA',
            'billPrefix' => 'BILL',
            'partialMonthCountsFull' => true,
            'billOrOrdinanceName' => 'Local Government Code of 1991 (R.A. 7160)',
            'changeNote' => 'Statutory basic RPT & SEF rates established pursuant to RA 7160 Sections 233 and 235.',
            'changedAt' => '2026-01-01',
            'changedBy' => 'Municipal Assessor / Sangguniang Bayan',
            'changeHistory' => [],
        ];
    }

    public function getDueDate(int $year, int $quarter): string
    {
        $configs = Arr::get($this->all(), 'quarterDueDates', []);
        $found = collect($configs)->firstWhere('quarter', $quarter);
        $month = $found['month'] ?? ($quarter * 3);
        $day = $found['day'] ?? 20;

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }
}
