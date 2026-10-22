<?php

namespace App\Services;

use App\Models\SmvUnitValue;
use Illuminate\Support\Arr;

class AppraisalCalculationService
{
    /**
     * Official schedule of base market values for Plants and Trees based on age brackets.
     */
    public static function getPlantSchedule(): array
    {
        return [
            [
                'species' => 'Coconut',
                'description' => 'Coconut (Cocos nucifera) - Seedling to Senile',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 3, 'stage' => 'Seedling / Young Non-bearing', 'unit_value' => 150.00, 'is_bearing' => false],
                    ['min_age' => 4, 'max_age' => 6, 'stage' => 'Growing / Immature', 'unit_value' => 350.00, 'is_bearing' => false],
                    ['min_age' => 7, 'max_age' => 30, 'stage' => 'Productive / Peak Bearing', 'unit_value' => 850.00, 'is_bearing' => true],
                    ['min_age' => 31, 'max_age' => 50, 'stage' => 'Mature / Declining Yield', 'unit_value' => 500.00, 'is_bearing' => true],
                    ['min_age' => 51, 'max_age' => 120, 'stage' => 'Senile / Over-aged', 'unit_value' => 250.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Mango',
                'description' => 'Mango (Carabao / Pico / Apple Mango)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 3, 'stage' => 'Young / Seedling', 'unit_value' => 300.00, 'is_bearing' => false],
                    ['min_age' => 4, 'max_age' => 7, 'stage' => 'Vegetative / Non-bearing', 'unit_value' => 800.00, 'is_bearing' => false],
                    ['min_age' => 8, 'max_age' => 15, 'stage' => 'Early Bearing', 'unit_value' => 2500.00, 'is_bearing' => true],
                    ['min_age' => 16, 'max_age' => 35, 'stage' => 'Peak Productive Bearing', 'unit_value' => 5000.00, 'is_bearing' => true],
                    ['min_age' => 36, 'max_age' => 120, 'stage' => 'Old / Diminishing Yield', 'unit_value' => 2200.00, 'is_bearing' => true],
                ],
            ],
            [
                'species' => 'Banana',
                'description' => 'Banana (Lakatan / Latundan / Saba) per stool/clump',
                'unit' => 'clump',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 1, 'stage' => 'Newly Planted / Sucker', 'unit_value' => 60.00, 'is_bearing' => false],
                    ['min_age' => 2, 'max_age' => 5, 'stage' => 'Active Productive Stool', 'unit_value' => 180.00, 'is_bearing' => true],
                    ['min_age' => 6, 'max_age' => 30, 'stage' => 'Declining Stool', 'unit_value' => 90.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Coffee',
                'description' => 'Coffee (Arabica / Robusta / Liberica)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 2, 'stage' => 'Young / Nursery to Field', 'unit_value' => 120.00, 'is_bearing' => false],
                    ['min_age' => 3, 'max_age' => 5, 'stage' => 'Initial Bearing', 'unit_value' => 350.00, 'is_bearing' => true],
                    ['min_age' => 6, 'max_age' => 20, 'stage' => 'Full Bearing / Peak Yield', 'unit_value' => 650.00, 'is_bearing' => true],
                    ['min_age' => 21, 'max_age' => 60, 'stage' => 'Senescent / Over-mature', 'unit_value' => 300.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Cacao',
                'description' => 'Cacao (Criollo / Forastero / Trinitario)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 2, 'stage' => 'Seedling / Non-bearing', 'unit_value' => 150.00, 'is_bearing' => false],
                    ['min_age' => 3, 'max_age' => 6, 'stage' => 'Early Production', 'unit_value' => 400.00, 'is_bearing' => true],
                    ['min_age' => 7, 'max_age' => 25, 'stage' => 'Peak Pod Harvest', 'unit_value' => 750.00, 'is_bearing' => true],
                    ['min_age' => 26, 'max_age' => 60, 'stage' => 'Declining Canopy', 'unit_value' => 350.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Rubber',
                'description' => 'Rubber Tree (Hevea brasiliensis)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 4, 'stage' => 'Immature / Non-tappable', 'unit_value' => 250.00, 'is_bearing' => false],
                    ['min_age' => 5, 'max_age' => 7, 'stage' => 'Newly Tappable', 'unit_value' => 800.00, 'is_bearing' => true],
                    ['min_age' => 8, 'max_age' => 25, 'stage' => 'Peak Latex Production', 'unit_value' => 1500.00, 'is_bearing' => true],
                    ['min_age' => 26, 'max_age' => 60, 'stage' => 'Depleted / Timber Salvage', 'unit_value' => 600.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Citrus',
                'description' => 'Citrus (Calamansi / Orange / Pomelo / Lemon)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 2, 'stage' => 'Young Tree', 'unit_value' => 150.00, 'is_bearing' => false],
                    ['min_age' => 3, 'max_age' => 5, 'stage' => 'Bearing Initiation', 'unit_value' => 450.00, 'is_bearing' => true],
                    ['min_age' => 6, 'max_age' => 18, 'stage' => 'Peak Fruiting Harvest', 'unit_value' => 900.00, 'is_bearing' => true],
                    ['min_age' => 19, 'max_age' => 50, 'stage' => 'Old Orchard', 'unit_value' => 400.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Timber / Mahogany',
                'description' => 'Commercial Timber (Mahogany, Gmelina, Teak, Narra)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 3, 'stage' => 'Seedling / Sapling', 'unit_value' => 200.00, 'is_bearing' => false],
                    ['min_age' => 4, 'max_age' => 8, 'stage' => 'Pole Timber Stage', 'unit_value' => 800.00, 'is_bearing' => false],
                    ['min_age' => 9, 'max_age' => 15, 'stage' => 'Semi-mature Merchantable', 'unit_value' => 2200.00, 'is_bearing' => false],
                    ['min_age' => 16, 'max_age' => 100, 'stage' => 'Harvestable Sawlog Timber', 'unit_value' => 4500.00, 'is_bearing' => false],
                ],
            ],
            [
                'species' => 'Bamboo',
                'description' => 'Bamboo (Kauayan Tinik / Kawayan Kiling) per clump',
                'unit' => 'clump',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 2, 'stage' => 'Young Stool / Establishment', 'unit_value' => 100.00, 'is_bearing' => false],
                    ['min_age' => 3, 'max_age' => 10, 'stage' => 'Harvestable Pole Clump', 'unit_value' => 300.00, 'is_bearing' => true],
                    ['min_age' => 11, 'max_age' => 50, 'stage' => 'Mature / Thick Clump', 'unit_value' => 180.00, 'is_bearing' => true],
                ],
            ],
            [
                'species' => 'Fruit Trees (Other)',
                'description' => 'Fruit Trees (Avocado, Jackfruit, Durian, Rambutan, Guava, Santol)',
                'unit' => 'tree',
                'brackets' => [
                    ['min_age' => 0, 'max_age' => 3, 'stage' => 'Young Tree', 'unit_value' => 250.00, 'is_bearing' => false],
                    ['min_age' => 4, 'max_age' => 7, 'stage' => 'Flowering / Non-commercial', 'unit_value' => 750.00, 'is_bearing' => false],
                    ['min_age' => 8, 'max_age' => 25, 'stage' => 'Commercial Fruiting', 'unit_value' => 2000.00, 'is_bearing' => true],
                    ['min_age' => 26, 'max_age' => 100, 'stage' => 'Declining Productivity', 'unit_value' => 1000.00, 'is_bearing' => false],
                ],
            ],
        ];
    }

    /**
     * Automatic lookup of plant/tree price value by species and age.
     */
    public function getPlantUnitValue(string $plantKind, float|int $ageYears): array
    {
        $schedule = self::getPlantSchedule();
        $kindLower = strtolower(trim($plantKind));
        $age = max(0.0, (float) $ageYears);

        // Find best matching species entry
        $matched = null;
        foreach ($schedule as $entry) {
            $spLower = strtolower($entry['species']);
            if ($spLower === $kindLower || str_contains($spLower, $kindLower) || str_contains($kindLower, $spLower)) {
                $matched = $entry;
                break;
            }
        }

        if (!$matched) {
            $matched = $schedule[count($schedule) - 1]; // Fallback to Fruit Trees (Other)
        }

        // Find corresponding age bracket
        $brackets = $matched['brackets'];
        $selectedBracket = $brackets[count($brackets) - 1]; // Default to highest age bracket

        foreach ($brackets as $b) {
            if ($age >= $b['min_age'] && $age <= $b['max_age']) {
                $selectedBracket = $b;
                break;
            }
        }

        return [
            'species' => $matched['species'],
            'age_years' => $age,
            'unit_value' => (float) $selectedBracket['unit_value'],
            'stage' => $selectedBracket['stage'],
            'age_bracket' => "{$selectedBracket['min_age']}-{$selectedBracket['max_age']} yrs",
            'is_bearing' => (bool) $selectedBracket['is_bearing'],
            'unit' => $matched['unit'],
        ];
    }

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

        // Plants & Trees are Agricultural Improvements: standard 40%
        if ($itemType === 'Plants/Trees' || $itemType === 'Plants & Trees') {
            return 40.0;
        }

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
        $adjustmentPct = (float) Arr::get($itemData, 'adjustment_factor_pct', 0);
        $details = Arr::get($itemData, 'details', []);

        if ($itemType === 'Plants/Trees' || $itemType === 'Plants & Trees') {
            $itemType = 'Plants/Trees';
            $plantKind = Arr::get($details, 'plant_kind', Arr::get($itemData, 'plant_kind', 'Coconut'));
            $ageYears = (float) Arr::get($details, 'age_years', Arr::get($itemData, 'age_years', 0));
            $quantityTrees = (float) Arr::get($details, 'quantity_trees', Arr::get($itemData, 'quantity_trees', $areaSqm > 0 ? $areaSqm : 1));

            // Automatic lookup of plant unit value if not specified or forced
            $plantPricing = $this->getPlantUnitValue($plantKind, $ageYears);
            if ($unitValue <= 0) {
                $unitValue = $plantPricing['unit_value'];
            }

            $details['plant_kind'] = $plantPricing['species'];
            $details['age_years'] = $ageYears;
            $details['quantity_trees'] = $quantityTrees;
            $details['stage'] = $plantPricing['stage'];
            $details['age_bracket'] = $plantPricing['age_bracket'];
            $details['is_bearing'] = $plantPricing['is_bearing'];
            $details['unit'] = $plantPricing['unit'];
            $details['standard_unit_value'] = $plantPricing['unit_value'];

            $baseMarketValue = round($quantityTrees * $unitValue, 2);
            $marketValue = round($baseMarketValue * (1 + ($adjustmentPct / 100)), 2);
            $areaSqm = $quantityTrees; // Store count in area_sqm column for compatibility
        } elseif ($itemType === 'Land') {
            if ($unitValue <= 0 && !empty($barangay)) {
                $unitValue = $this->getSmvUnitValue($barangay, $classification, $actualUse);
            }
            $baseMarketValue = round($areaSqm * $unitValue, 2);
            $marketValue = round($baseMarketValue * (1 + ($adjustmentPct / 100)), 2);
        } elseif ($itemType === 'Building') {
            if ($unitValue <= 0 && !empty($barangay)) {
                $unitValue = $this->getSmvUnitValue($barangay, $classification, $actualUse);
            }
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
     * Calculate 5-year annual tax increase projections.
     */
    public function calculateYearlyProjections(
        float $baseMarketValue,
        float $baseAssessedValue,
        float $annualIncreasePct,
        int $startYear,
        int $years = 5
    ): array {
        $projections = [];
        $currMv = $baseMarketValue;
        $currAv = $baseAssessedValue;
        $annualRate = max(-50.0, min(100.0, $annualIncreasePct));

        for ($i = 0; $i < $years; $i++) {
            $year = $startYear + $i;
            if ($i > 0 && $annualRate != 0) {
                $factor = 1 + ($annualRate / 100.0);
                $currMv = round($currMv * $factor, 2);
                $currAv = round($currAv * $factor, 2);
            }

            $basicTax = round($currAv * 0.01, 2); // 1.0% Basic Real Property Tax
            $sefTax = round($currAv * 0.01, 2);   // 1.0% Special Education Fund
            $totalTax = round($basicTax + $sefTax, 2); // 2.0% Total Annual Tax
            $quarterly = round($totalTax / 4, 2);

            $prevTotalTax = $i > 0 ? $projections[$i - 1]['total_annual_tax'] : $totalTax;
            $increaseAmount = $i > 0 ? round($totalTax - $prevTotalTax, 2) : 0.0;

            $projections[] = [
                'year' => $year,
                'escalation_pct' => $i === 0 ? 0.0 : $annualRate,
                'cumulative_factor_pct' => $baseMarketValue > 0 ? round((($currMv - $baseMarketValue) / $baseMarketValue) * 100, 2) : 0.0,
                'market_value' => $currMv,
                'assessed_value' => $currAv,
                'basic_tax' => $basicTax,
                'sef_tax' => $sefTax,
                'total_annual_tax' => $totalTax,
                'quarterly_installment' => $quarterly,
                'annual_increase_amount' => $increaseAmount,
            ];
        }

        return $projections;
    }

    /**
     * Compute comprehensive totals & automatic valuation summary for assessment items.
     */
    public function computeTotals(array $items, bool $isTaxable = true, array $options = []): array
    {
        $totalBaseMarketValue = 0.0;
        $totalMarketValue = 0.0;
        $totalAssessedValue = 0.0;
        $calculatedItems = [];

        $breakdown = [
            'land' => ['count' => 0, 'base_mv' => 0.0, 'market_value' => 0.0, 'assessed_value' => 0.0, 'area_sqm' => 0.0],
            'building' => ['count' => 0, 'base_mv' => 0.0, 'market_value' => 0.0, 'assessed_value' => 0.0, 'area_sqm' => 0.0],
            'machinery' => ['count' => 0, 'base_mv' => 0.0, 'market_value' => 0.0, 'assessed_value' => 0.0, 'units' => 0.0],
            'plants_trees' => ['count' => 0, 'base_mv' => 0.0, 'market_value' => 0.0, 'assessed_value' => 0.0, 'total_trees' => 0.0],
        ];

        $barangay = Arr::get($options, 'barangay', '');

        foreach ($items as $item) {
            $calc = $this->calculateItem($item, $barangay);
            $calculatedItems[] = $calc;

            $totalBaseMarketValue += $calc['base_market_value'];
            $totalMarketValue += $calc['market_value'];
            if ($isTaxable) {
                $totalAssessedValue += $calc['assessed_value'];
            }

            $type = $calc['item_type'];
            if ($type === 'Land') {
                $breakdown['land']['count']++;
                $breakdown['land']['base_mv'] += $calc['base_market_value'];
                $breakdown['land']['market_value'] += $calc['market_value'];
                $breakdown['land']['assessed_value'] += $isTaxable ? $calc['assessed_value'] : 0.0;
                $breakdown['land']['area_sqm'] += $calc['area_sqm'];
            } elseif ($type === 'Building') {
                $breakdown['building']['count']++;
                $breakdown['building']['base_mv'] += $calc['base_market_value'];
                $breakdown['building']['market_value'] += $calc['market_value'];
                $breakdown['building']['assessed_value'] += $isTaxable ? $calc['assessed_value'] : 0.0;
                $breakdown['building']['area_sqm'] += $calc['area_sqm'];
            } elseif ($type === 'Plants/Trees' || $type === 'Plants & Trees') {
                $breakdown['plants_trees']['count']++;
                $breakdown['plants_trees']['base_mv'] += $calc['base_market_value'];
                $breakdown['plants_trees']['market_value'] += $calc['market_value'];
                $breakdown['plants_trees']['assessed_value'] += $isTaxable ? $calc['assessed_value'] : 0.0;
                $breakdown['plants_trees']['total_trees'] += (float) Arr::get($calc['details'], 'quantity_trees', $calc['area_sqm']);
            } else {
                $breakdown['machinery']['count']++;
                $breakdown['machinery']['base_mv'] += $calc['base_market_value'];
                $breakdown['machinery']['market_value'] += $calc['market_value'];
                $breakdown['machinery']['assessed_value'] += $isTaxable ? $calc['assessed_value'] : 0.0;
                $breakdown['machinery']['units'] += $calc['area_sqm'];
            }
        }

        $totalBaseMarketValue = round($totalBaseMarketValue, 2);
        $totalMarketValue = round($totalMarketValue, 2);
        $totalAssessedValue = round($totalAssessedValue, 2);
        $totalAdjustmentsValue = round($totalMarketValue - $totalBaseMarketValue, 2);

        $effectiveAssessmentLevelPct = $totalMarketValue > 0
            ? round(($totalAssessedValue / $totalMarketValue) * 100, 2)
            : 0.0;

        // Standard RPT Tax Computation Summary
        $basicTaxRatePct = 1.00; // 1% Basic Real Property Tax
        $sefRatePct = 1.00;      // 1% Special Education Fund
        $basicTaxAmount = round($totalAssessedValue * ($basicTaxRatePct / 100), 2);
        $sefTaxAmount = round($totalAssessedValue * ($sefRatePct / 100), 2);
        $totalAnnualTax = round($basicTaxAmount + $sefTaxAmount, 2);
        $quarterlyInstallment = round($totalAnnualTax / 4, 2);

        // Prompt payment discount (10% standard LGC prompt discount for full advance payment)
        $promptPaymentDiscountPct = 10.0;
        $promptDiscountAmount = round($totalAnnualTax * ($promptPaymentDiscountPct / 100), 2);
        $discountedTotalTax = round($totalAnnualTax - $promptDiscountAmount, 2);

        // Yearly tax escalation / annual increase projections
        $annualIncreasePct = (float) Arr::get($options, 'annual_tax_increase_pct', 0.0);
        $annualIncreaseEnabled = (bool) Arr::get($options, 'annual_tax_increase_enabled', false);
        $startYear = (int) Arr::get($options, 'effective_year', date('Y'));

        $yearlyProjections = $this->calculateYearlyProjections(
            $totalMarketValue,
            $totalAssessedValue,
            $annualIncreaseEnabled ? $annualIncreasePct : 0.0,
            $startYear,
            5
        );

        return [
            'items' => $calculatedItems,
            'total_base_market_value' => $totalBaseMarketValue,
            'total_adjustments_value' => $totalAdjustmentsValue,
            'total_market_value' => $totalMarketValue,
            'total_assessed_value' => $totalAssessedValue,
            'effective_assessment_level_pct' => $effectiveAssessmentLevelPct,
            'is_taxable' => $isTaxable,
            'valuation_summary' => [
                'total_base_market_value' => $totalBaseMarketValue,
                'total_adjustments_value' => $totalAdjustmentsValue,
                'total_market_value' => $totalMarketValue,
                'total_assessed_value' => $totalAssessedValue,
                'effective_assessment_level_pct' => $effectiveAssessmentLevelPct,
                'breakdown' => [
                    'land' => [
                        'count' => $breakdown['land']['count'],
                        'base_mv' => round($breakdown['land']['base_mv'], 2),
                        'market_value' => round($breakdown['land']['market_value'], 2),
                        'assessed_value' => round($breakdown['land']['assessed_value'], 2),
                        'area_sqm' => round($breakdown['land']['area_sqm'], 2),
                    ],
                    'building' => [
                        'count' => $breakdown['building']['count'],
                        'base_mv' => round($breakdown['building']['base_mv'], 2),
                        'market_value' => round($breakdown['building']['market_value'], 2),
                        'assessed_value' => round($breakdown['building']['assessed_value'], 2),
                        'area_sqm' => round($breakdown['building']['area_sqm'], 2),
                    ],
                    'machinery' => [
                        'count' => $breakdown['machinery']['count'],
                        'base_mv' => round($breakdown['machinery']['base_mv'], 2),
                        'market_value' => round($breakdown['machinery']['market_value'], 2),
                        'assessed_value' => round($breakdown['machinery']['assessed_value'], 2),
                        'units' => round($breakdown['machinery']['units'], 2),
                    ],
                    'plants_trees' => [
                        'count' => $breakdown['plants_trees']['count'],
                        'base_mv' => round($breakdown['plants_trees']['base_mv'], 2),
                        'market_value' => round($breakdown['plants_trees']['market_value'], 2),
                        'assessed_value' => round($breakdown['plants_trees']['assessed_value'], 2),
                        'total_trees' => round($breakdown['plants_trees']['total_trees'], 2),
                    ],
                ],
            ],
            'tax_summary' => [
                'is_taxable' => $isTaxable,
                'basic_tax_rate_pct' => $basicTaxRatePct,
                'basic_tax_amount' => $basicTaxAmount,
                'sef_tax_rate_pct' => $sefRatePct,
                'sef_tax_amount' => $sefTaxAmount,
                'total_annual_tax' => $totalAnnualTax,
                'quarterly_installment' => $quarterlyInstallment,
                'prompt_discount_pct' => $promptPaymentDiscountPct,
                'prompt_discount_amount' => $promptDiscountAmount,
                'discounted_annual_tax' => $discountedTotalTax,
            ],
            'annual_tax_increase' => [
                'enabled' => $annualIncreaseEnabled,
                'rate_pct' => $annualIncreasePct,
                'start_year' => $startYear,
                'projections' => $yearlyProjections,
            ],
        ];
    }
}
