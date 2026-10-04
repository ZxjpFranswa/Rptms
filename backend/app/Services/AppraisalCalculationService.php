<?php

namespace App\Services;

use App\Models\SmvUnitValue;
use Illuminate\Support\Arr;

class AppraisalCalculationService
{
    /**
     * Look up standard SMV base unit value.
     */
    public function getSmvUnitValue(string $barangay, string $classification, string $actualUse): float
    {
        $smv = SmvUnitValue::query()
            ->where('barangay', $barangay)
            ->where('classification', $classification)
            ->where('actual_use', $actualUse)
            ->orderByDesc('revision_year')
            ->first();

        if ($smv) {
            return (float) $smv->unit_value;
        }

        // Standard fallback defaults based on classification if specific SMV not seeded
        return match ($classification) {
            'Residential' => 3500.00,
            'Commercial' => 12000.00,
            'Agricultural' => 850.00,
            'Industrial' => 15000.00,
            'Special' => 5000.00,
            default => 2000.00,
        };
    }

    /**
     * Determine Assessment Level % based on classification, actual use, and market value.
     */
    public function getAssessmentLevelPct(string $itemType, string $classification, string $actualUse, float $marketValue): float
    {
        $class = strtolower($classification);
        $use = strtolower($actualUse);

        if ($itemType === 'Land') {
            if (str_contains($use, 'resid') || str_contains($class, 'resid')) return 20.0;
            if (str_contains($use, 'agri') || str_contains($class, 'agri')) return 40.0;
            if (str_contains($use, 'comm') || str_contains($class, 'comm')) return 50.0;
            if (str_contains($use, 'indus') || str_contains($class, 'indus')) return 50.0;
            if (str_contains($use, 'spec') || str_contains($class, 'spec')) return 15.0;
            return 20.0;
        }

        if ($itemType === 'Building') {
            if (str_contains($use, 'resid') || str_contains($class, 'resid')) {
                if ($marketValue <= 175000) return 0.0;
                if ($marketValue <= 300000) return 10.0;
                if ($marketValue <= 500000) return 20.0;
                return 25.0;
            }
            if (str_contains($use, 'comm') || str_contains($class, 'comm')) return 50.0;
            if (str_contains($use, 'indus') || str_contains($class, 'indus')) return 50.0;
            return 30.0;
        }

        // Machinery
        if (str_contains($use, 'resid')) return 50.0;
        if (str_contains($use, 'agri')) return 40.0;
        return 80.0;
    }

    /**
     * Calculate single assessment item details.
     */
    public function calculateItem(array $itemData, string $barangay = ''): array
    {
        $itemType = Arr::get($itemData, 'item_type', 'Land');
        $classification = Arr::get($itemData, 'classification', 'Residential');
        $actualUse = Arr::get($itemData, 'actual_use', 'Residential');
        $areaSqm = (float) Arr::get($itemData, 'area_sqm', 0);
        $unitValue = (float) Arr::get($itemData, 'unit_value', 0);

        if ($unitValue <= 0 && !empty($barangay)) {
            $unitValue = $this->getSmvUnitValue($barangay, $classification, $actualUse);
        }

        $adjustmentPct = (float) Arr::get($itemData, 'adjustment_factor_pct', 0);
        $details = Arr::get($itemData, 'details', []);

        if ($itemType === 'Land') {
            $baseMarketValue = round($areaSqm * $unitValue, 2);
            $marketValue = round($baseMarketValue * (1 + ($adjustmentPct / 100)), 2);
        } elseif ($itemType === 'Building') {
            $depreciationPct = (float) Arr::get($details, 'depreciation_pct', 0);
            $baseMarketValue = round($areaSqm * $unitValue, 2);
            $marketValue = round($baseMarketValue * (1 - ($depreciationPct / 100)), 2);
        } else {
            // Machinery
            $acquisitionCost = (float) Arr::get($details, 'acquisition_cost', $areaSqm * $unitValue);
            $depreciationPct = (float) Arr::get($details, 'depreciation_pct', 0);
            $baseMarketValue = round($acquisitionCost, 2);
            $marketValue = round($baseMarketValue * (1 - ($depreciationPct / 100)), 2);
        }

        $assessmentLevelPct = (float) Arr::get($itemData, 'assessment_level_pct', 0);
        if ($assessmentLevelPct <= 0) {
            $assessmentLevelPct = $this->getAssessmentLevelPct($itemType, $classification, $actualUse, $marketValue);
        }

        $assessedValue = round($marketValue * ($assessmentLevelPct / 100), 2);

        return [
            'item_type' => $itemType,
            'classification' => $classification,
            'actual_use' => $actualUse,
            'area_sqm' => $areaSqm,
            'unit_value' => $unitValue,
            'base_market_value' => $baseMarketValue,
            'adjustment_factor_pct' => $adjustmentPct,
            'market_value' => $marketValue,
            'assessment_level_pct' => $assessmentLevelPct,
            'assessed_value' => $assessedValue,
            'details' => $details,
        ];
    }

    /**
     * Compute totals for an entire assessment dataset.
     */
    public function computeTotals(array $items, bool $isTaxable = true): array
    {
        $totalMarketValue = 0.0;
        $totalAssessedValue = 0.0;
        $calculatedItems = [];

        foreach ($items as $item) {
            $calc = $this->calculateItem($item);
            $calculatedItems[] = $calc;

            $totalMarketValue += $calc['market_value'];
            if ($isTaxable) {
                $totalAssessedValue += $calc['assessed_value'];
            }
        }

        return [
            'items' => $calculatedItems,
            'total_market_value' => round($totalMarketValue, 2),
            'total_assessed_value' => round($totalAssessedValue, 2),
        ];
    }
}
