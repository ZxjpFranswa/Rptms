<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Arr;

class BillingSettingsService
{
    private const KEY = 'billing';

    public function all(): array
    {
        $setting = Setting::query()->find(self::KEY);
        return array_merge($this->defaults(), $setting?->value ?? []);
    }

    public function update(array $payload): array
    {
        $current = $this->all();
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
