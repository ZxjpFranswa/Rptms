<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-10 text-gray-500">Loading assessment…</div>

    <template v-else>
      <!-- Status banner -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-gray-900">Appraisal &amp; Assessment</h3>
          <span :class="['px-3 py-1 rounded-full text-xs font-semibold', statusClass]">
            {{ statusLabel }}
          </span>
        </div>
        <p v-if="!assessment && role === 'assessor'" class="text-sm text-gray-500">
          The clerk has not prepared an assessment for this property yet.
        </p>
      </div>

      <div
        v-if="assessment?.status === 'Returned' && assessment.remarks"
        class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-900"
      >
        <p class="font-semibold">Returned by Municipal Assessor</p>
        <p class="mt-1">{{ assessment.remarks }}</p>
      </div>
      <div
        v-if="assessment?.status === 'Rejected' && assessment.remarks"
        class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-900"
      >
        <p class="font-semibold">Rejected</p>
        <p class="mt-1">{{ assessment.remarks }}</p>
      </div>

      <template v-if="assessment || canEdit">
        <!-- Top Overall KPI Summary (Always visible) -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="rounded-xl p-4 bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-md">
            <p class="text-xs uppercase tracking-wide opacity-80 font-medium">Total Market Value</p>
            <p class="text-xl font-bold mt-1">{{ peso(totals.mv) }}</p>
            <p class="text-[11px] opacity-75 mt-0.5">Base: {{ peso(valuationSummary?.total_base_market_value ?? totals.mv) }}</p>
          </div>
          <div class="rounded-xl p-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md">
            <p class="text-xs uppercase tracking-wide opacity-80 font-medium">Total Assessed Value</p>
            <p class="text-xl font-bold mt-1">{{ peso(totals.av) }}</p>
            <p class="text-[11px] opacity-75 mt-0.5">Effective Level: {{ valuationSummary?.effective_assessment_level_pct ?? 0 }}%</p>
          </div>
          <div class="rounded-xl p-4 bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md">
            <p class="text-xs uppercase tracking-wide opacity-80 font-medium">Annual Tax Due (2%)</p>
            <p class="text-xl font-bold mt-1">{{ peso(taxSummary?.total_annual_tax ?? (totals.av * 0.02)) }}</p>
            <p class="text-[11px] opacity-75 mt-0.5">Q1-Q4: {{ peso(taxSummary?.quarterly_installment ?? ((totals.av * 0.02) / 4)) }}/qtr</p>
          </div>
          <div class="rounded-xl p-4 bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 font-medium">Taxability</p>
              <label v-if="canEdit" class="flex items-center gap-2 mt-1.5 text-sm font-medium text-gray-800">
                <input v-model="form.is_taxable" type="checkbox" class="w-4 h-4 rounded text-primary-600" />
                Taxable
              </label>
              <p v-else class="text-base font-bold mt-1" :class="form.is_taxable ? 'text-gray-900' : 'text-amber-700'">
                {{ form.is_taxable ? 'Taxable' : 'Exempt' }}
              </p>
            </div>
            <input
              v-if="!form.is_taxable"
              v-model="form.exemption_reason"
              :disabled="!canEdit"
              placeholder="Legal basis for exemption"
              class="mt-2 w-full px-2.5 py-1 border border-gray-300 rounded text-xs disabled:bg-gray-50"
            />
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            <button
              v-for="tab in panelTabs"
              :key="tab.id"
              type="button"
              :class="[
                'px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2',
                activePanelTab === tab.id
                  ? 'border-primary-700 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
              @click="activePanelTab = tab.id"
            >
              <span>{{ tab.label }}</span>
              <span
                v-if="tab.badge"
                class="px-1.5 py-0.5 text-[10px] rounded-full bg-primary-100 text-primary-800 font-bold"
              >
                {{ tab.badge }}
              </span>
            </button>
          </nav>
        </div>

        <!-- TAB 1: ITEMS & APPRAISAL -->
        <div v-show="activePanelTab === 'items'" class="space-y-6">
          <!-- Record header & Annual Escalation settings -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label class="text-sm">
                <span class="block font-medium text-gray-700 mb-1">PIN</span>
                <input v-model="form.pin" :disabled="!canEdit" class="field" />
              </label>
              <label class="text-sm">
                <span class="block font-medium text-gray-700 mb-1">ARP Number</span>
                <input v-model="form.arp_number" :disabled="!canEdit" class="field" />
              </label>
              <label class="text-sm">
                <span class="block font-medium text-gray-700 mb-1">Effective Year</span>
                <input v-model.number="form.effective_year" type="number" :disabled="!canEdit" class="field" />
              </label>
              <label class="text-sm">
                <span class="block font-medium text-gray-700 mb-1">Effective Quarter</span>
                <select v-model.number="form.effective_quarter" :disabled="!canEdit" class="field">
                  <option v-for="q in 4" :key="q" :value="q">Q{{ q }}</option>
                </select>
              </label>
            </div>

            <!-- Yearly Tax Increase Annually Setting -->
            <div class="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-lg border border-amber-100">
              <div class="flex items-center gap-2">
                <input
                  id="annualIncreaseToggle"
                  v-model="form.annual_tax_increase_enabled"
                  type="checkbox"
                  :disabled="!canEdit"
                  class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label for="annualIncreaseToggle" class="text-xs font-bold text-gray-800 cursor-pointer">
                  Yearly Tax Increase Annually (Annual Escalation)
                </label>
                <span class="text-[11px] text-gray-500 hidden sm:inline">
                  — Automatically computes compounding annual value &amp; tax increments.
                </span>
              </div>

              <div v-if="form.annual_tax_increase_enabled" class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">Annual Rate (%/yr):</span>
                <input
                  v-model.number="form.annual_tax_increase_pct"
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  :disabled="!canEdit"
                  class="w-20 px-2 py-1 border border-amber-300 rounded text-xs font-bold text-gray-900 bg-white"
                />
                <span class="text-xs text-amber-800 font-bold">%</span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="space-y-4">
            <div
              v-for="(item, i) in form.items"
              :key="i"
              class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase',
                      item.item_type === 'Plants/Trees'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.item_type === 'Land'
                        ? 'bg-blue-100 text-blue-800'
                        : item.item_type === 'Building'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800',
                    ]"
                  >
                    {{ item.item_type }} #{{ i + 1 }}
                  </span>
                  <span v-if="item.item_type === 'Plants/Trees'" class="text-xs text-emerald-700 font-semibold">
                    {{ item.details?.plant_kind ?? 'Plant' }} · {{ item.details?.age_years ?? 0 }} yrs old
                  </span>
                </div>

                <button
                  v-if="canEdit && form.items.length > 1"
                  type="button"
                  class="text-xs font-semibold text-red-600 hover:text-red-800"
                  @click="removeItem(i)"
                >
                  Remove Item
                </button>
              </div>

              <!-- Item Fields -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label class="text-sm">
                  <span class="lbl">Item Type</span>
                  <select v-model="item.item_type" :disabled="!canEdit" class="field" @change="onTypeChange(item)">
                    <option>Land</option>
                    <option>Building</option>
                    <option>Machinery</option>
                    <option>Plants/Trees</option>
                  </select>
                </label>

                <!-- Plants/Trees Specific Inputs -->
                <template v-if="item.item_type === 'Plants/Trees'">
                  <label class="text-sm">
                    <span class="lbl">Plant / Tree Species</span>
                    <select
                      :value="item.details?.plant_kind ?? 'Coconut'"
                      :disabled="!canEdit"
                      class="field"
                      @change="onPlantKindChange(item, ($event.target as HTMLSelectElement).value)"
                    >
                      <option v-for="sp in plantSpeciesList" :key="sp">{{ sp }}</option>
                    </select>
                  </label>

                  <label class="text-sm">
                    <span class="lbl">Age of Plant (Years)</span>
                    <input
                      :value="item.details?.age_years ?? 0"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      :disabled="!canEdit"
                      class="field font-bold text-emerald-700"
                      @input="onPlantAgeChange(item, ($event.target as HTMLInputElement).value)"
                    />
                  </label>

                  <label class="text-sm">
                    <span class="lbl">Quantity (No. of Trees / Hills)</span>
                    <input
                      v-model.number="item.area_sqm"
                      type="number"
                      min="1"
                      step="1"
                      :disabled="!canEdit"
                      class="field"
                      @input="onPlantQuantityChange(item)"
                    />
                  </label>
                </template>

                <!-- Standard Land/Building/Machinery Inputs -->
                <template v-else>
                  <label class="text-sm">
                    <span class="lbl">Classification</span>
                    <select v-model="item.classification" :disabled="!canEdit" class="field" @change="lookupSmv(item)">
                      <option v-for="c in classes" :key="c">{{ c }}</option>
                    </select>
                  </label>
                  <label class="text-sm">
                    <span class="lbl">Actual Use</span>
                    <select v-model="item.actual_use" :disabled="!canEdit" class="field" @change="lookupSmv(item)">
                      <option v-for="c in classes" :key="c">{{ c }}</option>
                    </select>
                  </label>
                  <label class="text-sm">
                    <span class="lbl">{{ item.item_type === 'Machinery' ? 'Quantity' : 'Area (sq.m)' }}</span>
                    <input v-model.number="item.area_sqm" type="number" min="0" step="0.01" :disabled="!canEdit" class="field" />
                  </label>
                </template>

                <!-- Unit Value Input -->
                <label class="text-sm">
                  <span class="lbl">
                    Unit Value (₱{{ item.item_type === 'Plants/Trees' ? '/tree' : item.item_type === 'Machinery' ? '/unit' : '/sq.m' }})
                  </span>
                  <div class="relative">
                    <input
                      v-model.number="item.unit_value"
                      type="number"
                      min="0"
                      step="0.01"
                      :disabled="!canEdit"
                      class="field font-semibold"
                    />
                    <span
                      v-if="item.item_type === 'Plants/Trees'"
                      class="absolute right-2 top-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"
                      title="Automatic Schedule Price"
                    >
                      Auto
                    </span>
                  </div>
                </label>

                <!-- Adjustment Factor / Depreciation -->
                <label v-if="item.item_type === 'Land' || item.item_type === 'Plants/Trees'" class="text-sm">
                  <span class="lbl">Adjustment (%)</span>
                  <input v-model.number="item.adjustment_factor_pct" type="number" step="0.1" :disabled="!canEdit" class="field" />
                </label>
                <label v-else class="text-sm">
                  <span class="lbl">Depreciation (%)</span>
                  <input
                    :value="item.details?.depreciation_pct ?? 0"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    :disabled="!canEdit"
                    class="field"
                    @input="setDepreciation(item, ($event.target as HTMLInputElement).value)"
                  />
                </label>

                <!-- Assessment Level -->
                <label class="text-sm">
                  <span class="lbl">Assessment Level (%)</span>
                  <input
                    v-model.number="item.assessment_level_pct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    :disabled="!canEdit"
                    class="field"
                    placeholder="Auto (40% Agri)"
                  />
                </label>

                <!-- Stage / Age Bracket Badge for Plants & Trees -->
                <div v-if="item.item_type === 'Plants/Trees'" class="col-span-2 text-xs flex items-center gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  <span class="font-bold text-emerald-800">Growth Stage:</span>
                  <span class="text-emerald-900 font-medium">
                    {{ item.details?.stage ?? 'Productive Stage' }}
                  </span>
                  <span v-if="item.details?.is_bearing" class="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800 font-bold text-[10px]">
                    Bearing
                  </span>
                  <span v-else class="px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 text-[10px]">
                    Non-bearing
                  </span>
                  <span class="text-gray-400">· Schedule Base: ₱{{ item.details?.standard_unit_value ?? item.unit_value }}/tree</span>
                </div>
              </div>

              <!-- Computed Single Item Totals -->
              <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-500">Market Value</p>
                  <p class="font-bold text-gray-900">{{ peso(calc[i]?.market_value) }}</p>
                  <p class="text-[11px] text-gray-400">Base: {{ peso(calc[i]?.base_market_value) }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Assessed Value ({{ calc[i]?.assessment_level_pct ?? 0 }}%)</p>
                  <p class="font-bold text-emerald-700">{{ peso(form.is_taxable ? calc[i]?.assessed_value : 0) }}</p>
                  <p class="text-[11px] text-gray-400">Taxable Base</p>
                </div>
              </div>
            </div>

            <!-- Add Item Buttons -->
            <div v-if="canEdit" class="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                class="px-4 py-2 text-xs font-semibold border border-dashed border-primary-600 text-primary-700 rounded-lg hover:bg-primary-50 transition"
                @click="addItem('Land')"
              >
                + Add Land
              </button>
              <button
                type="button"
                class="px-4 py-2 text-xs font-semibold border border-dashed border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition"
                @click="addItem('Building')"
              >
                + Add Building
              </button>
              <button
                type="button"
                class="px-4 py-2 text-xs font-semibold border border-dashed border-orange-600 text-orange-700 rounded-lg hover:bg-orange-50 transition"
                @click="addItem('Machinery')"
              >
                + Add Machinery
              </button>
              <button
                type="button"
                class="px-4 py-2 text-xs font-semibold border border-dashed border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 transition flex items-center gap-1.5"
                @click="addItem('Plants/Trees')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                + Add Plants &amp; Trees (Auto Price by Age)
              </button>
            </div>
          </div>

          <label v-if="canEdit" class="block text-sm">
            <span class="block font-medium text-gray-700 mb-1">Clerk Remarks</span>
            <textarea v-model="form.remarks" rows="2" class="field" />
          </label>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <!-- Clerk action buttons -->
          <div v-if="canEdit" class="flex flex-wrap gap-3 pt-2">
            <button type="button" class="btn-secondary" :disabled="busy" @click="save">Save Draft</button>
            <button type="button" class="btn-primary" :disabled="busy || !form.items.length" @click="saveAndSubmit">
              Save &amp; Submit for Review
            </button>
          </div>
        </div>

        <!-- TAB 2: VALUATION & TAX SUMMARY -->
        <div v-show="activePanelTab === 'summary'" class="space-y-6">
          <!-- Valuation Summary Header -->
          <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Automatic Valuation Summary Breakdown
            </h4>

            <!-- Component Breakdown Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b">
                  <tr>
                    <th class="p-3">Component Type</th>
                    <th class="p-3">Quantity / Area</th>
                    <th class="p-3 text-right">Base Market Value</th>
                    <th class="p-3 text-right">Net Market Value</th>
                    <th class="p-3 text-right">Assessed Value</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="valuationSummary?.breakdown.land.count" class="hover:bg-gray-50">
                    <td class="p-3 font-semibold text-gray-800">
                      Land Parcels ({{ valuationSummary.breakdown.land.count }})
                    </td>
                    <td class="p-3 text-gray-600">{{ valuationSummary.breakdown.land.area_sqm }} sq.m</td>
                    <td class="p-3 text-right text-gray-600">{{ peso(valuationSummary.breakdown.land.base_mv) }}</td>
                    <td class="p-3 text-right font-semibold text-gray-900">{{ peso(valuationSummary.breakdown.land.market_value) }}</td>
                    <td class="p-3 text-right font-bold text-emerald-700">{{ peso(valuationSummary.breakdown.land.assessed_value) }}</td>
                  </tr>

                  <tr v-if="valuationSummary?.breakdown.building.count" class="hover:bg-gray-50">
                    <td class="p-3 font-semibold text-gray-800">
                      Buildings &amp; Structures ({{ valuationSummary.breakdown.building.count }})
                    </td>
                    <td class="p-3 text-gray-600">{{ valuationSummary.breakdown.building.area_sqm }} sq.m</td>
                    <td class="p-3 text-right text-gray-600">{{ peso(valuationSummary.breakdown.building.base_mv) }}</td>
                    <td class="p-3 text-right font-semibold text-gray-900">{{ peso(valuationSummary.breakdown.building.market_value) }}</td>
                    <td class="p-3 text-right font-bold text-emerald-700">{{ peso(valuationSummary.breakdown.building.assessed_value) }}</td>
                  </tr>

                  <tr v-if="valuationSummary?.breakdown.machinery.count" class="hover:bg-gray-50">
                    <td class="p-3 font-semibold text-gray-800">
                      Machinery &amp; Equipment ({{ valuationSummary.breakdown.machinery.count }})
                    </td>
                    <td class="p-3 text-gray-600">{{ valuationSummary.breakdown.machinery.units }} units</td>
                    <td class="p-3 text-right text-gray-600">{{ peso(valuationSummary.breakdown.machinery.base_mv) }}</td>
                    <td class="p-3 text-right font-semibold text-gray-900">{{ peso(valuationSummary.breakdown.machinery.market_value) }}</td>
                    <td class="p-3 text-right font-bold text-emerald-700">{{ peso(valuationSummary.breakdown.machinery.assessed_value) }}</td>
                  </tr>

                  <tr v-if="valuationSummary?.breakdown.plants_trees.count" class="hover:bg-gray-50 bg-emerald-50/20">
                    <td class="p-3 font-semibold text-emerald-900 flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Plants &amp; Trees ({{ valuationSummary.breakdown.plants_trees.count }})
                    </td>
                    <td class="p-3 text-emerald-800 font-medium">{{ valuationSummary.breakdown.plants_trees.total_trees }} trees/hills</td>
                    <td class="p-3 text-right text-gray-600">{{ peso(valuationSummary.breakdown.plants_trees.base_mv) }}</td>
                    <td class="p-3 text-right font-semibold text-gray-900">{{ peso(valuationSummary.breakdown.plants_trees.market_value) }}</td>
                    <td class="p-3 text-right font-bold text-emerald-700">{{ peso(valuationSummary.breakdown.plants_trees.assessed_value) }}</td>
                  </tr>

                  <tr class="bg-gray-50 font-bold border-t-2 border-gray-200">
                    <td class="p-3 text-gray-900">Total Valuation</td>
                    <td class="p-3 text-gray-500">—</td>
                    <td class="p-3 text-right text-gray-700">{{ peso(valuationSummary?.total_base_market_value ?? totals.mv) }}</td>
                    <td class="p-3 text-right text-primary-900">{{ peso(totals.mv) }}</td>
                    <td class="p-3 text-right text-emerald-800 text-base">{{ peso(totals.av) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Real Property Tax Due & Installments -->
          <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Standard Real Property Tax Due &amp; Installments
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                <p class="text-xs text-gray-500">Basic Tax (1%)</p>
                <p class="text-base font-bold text-gray-900 mt-1">{{ peso(taxSummary?.basic_tax_amount ?? (totals.av * 0.01)) }}</p>
              </div>
              <div class="p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                <p class="text-xs text-gray-500">Special Education Fund (1%)</p>
                <p class="text-base font-bold text-gray-900 mt-1">{{ peso(taxSummary?.sef_tax_amount ?? (totals.av * 0.01)) }}</p>
              </div>
              <div class="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <p class="text-xs text-emerald-700 font-semibold">Total Annual Tax</p>
                <p class="text-lg font-bold text-emerald-900 mt-1">{{ peso(taxSummary?.total_annual_tax ?? (totals.av * 0.02)) }}</p>
              </div>
              <div class="p-3.5 rounded-lg bg-blue-50 border border-blue-200">
                <p class="text-xs text-blue-700 font-semibold">Advance Prompt Discount (10%)</p>
                <p class="text-base font-bold text-blue-900 mt-1">
                  {{ peso(taxSummary?.discounted_annual_tax ?? ((totals.av * 0.02) * 0.9)) }}
                </p>
                <p class="text-[10px] text-blue-600">Save {{ peso(taxSummary?.prompt_discount_amount ?? ((totals.av * 0.02) * 0.1)) }}</p>
              </div>
            </div>

            <!-- Quarterly Installments Breakdown -->
            <div class="pt-3 border-t border-gray-100">
              <p class="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">Quarterly Payment Schedule (25% each)</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div class="p-2.5 rounded border border-gray-200 bg-gray-50 text-center">
                  <span class="text-gray-500 font-semibold">Q1 (on/before Mar 31)</span>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ peso(taxSummary?.quarterly_installment ?? ((totals.av * 0.02) / 4)) }}</p>
                </div>
                <div class="p-2.5 rounded border border-gray-200 bg-gray-50 text-center">
                  <span class="text-gray-500 font-semibold">Q2 (on/before Jun 30)</span>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ peso(taxSummary?.quarterly_installment ?? ((totals.av * 0.02) / 4)) }}</p>
                </div>
                <div class="p-2.5 rounded border border-gray-200 bg-gray-50 text-center">
                  <span class="text-gray-500 font-semibold">Q3 (on/before Sep 30)</span>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ peso(taxSummary?.quarterly_installment ?? ((totals.av * 0.02) / 4)) }}</p>
                </div>
                <div class="p-2.5 rounded border border-gray-200 bg-gray-50 text-center">
                  <span class="text-gray-500 font-semibold">Q4 (on/before Dec 31)</span>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ peso(taxSummary?.quarterly_installment ?? ((totals.av * 0.02) / 4)) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Multi-Year Tax Escalation Projections (Annually) -->
          <div class="rounded-xl border border-amber-200 bg-white p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Multi-Year Tax Escalation Projections (5-Year Annual Forecast)
                </h4>
                <p class="text-xs text-gray-500 mt-0.5">
                  Projected revenue based on {{ form.annual_tax_increase_enabled ? form.annual_tax_increase_pct + '% annual increase' : 'standard rate without escalation' }}.
                </p>
              </div>
              <span
                :class="[
                  'px-2.5 py-1 text-xs rounded-full font-bold',
                  form.annual_tax_increase_enabled ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600',
                ]"
              >
                {{ form.annual_tax_increase_enabled ? 'Escalation Active (' + form.annual_tax_increase_pct + '%)' : 'Flat / No Escalation' }}
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-amber-50 text-amber-900 uppercase font-semibold border-b border-amber-200">
                  <tr>
                    <th class="p-2.5">Tax Year</th>
                    <th class="p-2.5 text-right">Escalation</th>
                    <th class="p-2.5 text-right">Market Value</th>
                    <th class="p-2.5 text-right">Assessed Value</th>
                    <th class="p-2.5 text-right">Basic RPT</th>
                    <th class="p-2.5 text-right">SEF (1%)</th>
                    <th class="p-2.5 text-right">Total Annual Tax</th>
                    <th class="p-2.5 text-right">Annual Increase</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="proj in yearlyProjections"
                    :key="proj.year"
                    class="hover:bg-amber-50/40 transition"
                  >
                    <td class="p-2.5 font-bold text-gray-900">{{ proj.year }}</td>
                    <td class="p-2.5 text-right text-gray-600">{{ proj.escalation_pct > 0 ? '+' + proj.escalation_pct + '%' : 'Base' }}</td>
                    <td class="p-2.5 text-right text-gray-800">{{ peso(proj.market_value) }}</td>
                    <td class="p-2.5 text-right font-semibold text-emerald-700">{{ peso(proj.assessed_value) }}</td>
                    <td class="p-2.5 text-right text-gray-600">{{ peso(proj.basic_tax) }}</td>
                    <td class="p-2.5 text-right text-gray-600">{{ peso(proj.sef_tax) }}</td>
                    <td class="p-2.5 text-right font-bold text-gray-900">{{ peso(proj.total_annual_tax) }}</td>
                    <td class="p-2.5 text-right text-amber-700 font-semibold">
                      {{ proj.annual_increase_amount > 0 ? '+' + peso(proj.annual_increase_amount) : '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 3: PICTURES IMAGE OF THE LAND -->
        <div v-show="activePanelTab === 'photos'" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <LandPhotosGallery
            :application-id="applicationId"
            :can-upload="canEdit || role === 'assessor'"
          />
        </div>

        <!-- TAB 4: REASSESSMENT (PRICE CHANGES INCREASE / DECREASE) -->
        <div v-show="activePanelTab === 'reassessment'" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <ReassessmentModal
            :application-id="applicationId"
            :current-market-value="totals.mv"
            :current-assessed-value="totals.av"
            :role="role"
            @updated="load"
          />
        </div>

        <!-- Assessor actions -->
        <div
          v-if="role === 'assessor' && assessment && ['UnderReview', 'Approved'].includes(assessment.status)"
          class="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4"
        >
          <h4 class="font-bold text-gray-900">
            {{ assessment.status === 'Approved' ? 'Final Authorization' : 'Assessor Decision' }}
          </h4>

          <template v-if="assessment.status === 'UnderReview'">
            <textarea
              v-model="decisionText"
              rows="3"
              placeholder="Remarks (required for Return / Reject)"
              class="field"
            />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button type="button" class="btn-green" :disabled="busy" @click="decide('approve')">Approve</button>
              <button type="button" class="btn-yellow" :disabled="busy || !decisionText.trim()" @click="decide('return')">
                Return to Clerk
              </button>
              <button type="button" class="btn-red" :disabled="busy || !decisionText.trim()" @click="decide('reject')">
                Reject
              </button>
            </div>
          </template>

          <template v-else>
            <p class="text-sm text-gray-600">
              Authorizing issues the official Tax Declaration and activates the property for
              taxation. This cannot be undone.
            </p>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="confirmAuthorize" type="checkbox" class="w-4 h-4 rounded text-primary-600" />
              I validated the appraisal and authorize this assessment.
            </label>
            <button type="button" class="btn-green" :disabled="busy || !confirmAuthorize" @click="authorize">
              Authorize &amp; Issue Tax Declaration
            </button>
          </template>
        </div>

        <!-- Official Tax Declaration Issued Card -->
        <div
          v-if="assessment?.tax_declaration"
          class="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5"
        >
          <p class="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Tax Declaration Issued</p>
          <p class="text-2xl font-bold text-emerald-900 mt-1">{{ assessment.tax_declaration.td_number }}</p>
          <p class="text-sm text-emerald-800 mt-1">
            Effective {{ assessment.tax_declaration.effectivity_date?.slice(0, 10) }} ·
            AV {{ peso(assessment.tax_declaration.total_assessed_value) }}
          </p>
        </div>

        <!-- History -->
        <div v-if="assessment?.status_histories?.length" class="space-y-2">
          <h4 class="font-bold text-gray-900 text-sm">Assessment History</h4>
          <ol class="border-l-2 border-gray-200 ml-2 space-y-3">
            <li v-for="h in assessment.status_histories" :key="h.id" class="pl-4 relative text-sm">
              <span class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary-600" />
              <p class="font-semibold text-gray-900">
                {{ h.from_status ?? '—' }} → {{ h.to_status }}
              </p>
              <p class="text-gray-600">{{ h.remarks }}</p>
              <p class="text-xs text-gray-400">
                {{ h.actor?.full_name ?? 'System' }} · {{ new Date(h.created_at).toLocaleString() }}
              </p>
            </li>
          </ol>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  approveAssessmentApi,
  authorizeAssessmentApi,
  calculateAssessmentApi,
  fetchAssessmentApi,
  fetchPlantsScheduleApi,
  fetchSmvApi,
  lookupPlantPriceApi,
  rejectAssessmentApi,
  returnAssessmentApi,
  saveAssessmentApi,
  submitAssessmentApi,
  type AnnualTaxIncrease,
  type Assessment,
  type AssessmentItem,
  type AssessmentItemInput,
  type ItemType,
  type TaxSummary,
  type ValuationSummary,
  type YearlyProjection,
} from '@/services/assessmentsApi'
import { parseApiError } from '@/services/apiError'
import LandPhotosGallery from '@/components/assessment/LandPhotosGallery.vue'
import ReassessmentModal from '@/components/assessment/ReassessmentModal.vue'

interface Props {
  applicationId: string
  role: 'clerk' | 'assessor'
  barangay?: string
  defaultPin?: string
  defaultArp?: string
  defaultClassification?: string
  defaultArea?: number
  taxExempt?: boolean
  exemptionNotes?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  barangay: '',
  defaultPin: '',
  defaultArp: '',
  defaultClassification: 'Residential',
  defaultArea: 0,
  taxExempt: false,
  exemptionNotes: null,
})

const emit = defineEmits<{ (e: 'changed'): void }>()

const classes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Special']
const plantSpeciesList = [
  'Coconut',
  'Mango',
  'Banana',
  'Coffee',
  'Cacao',
  'Rubber',
  'Citrus',
  'Timber / Mahogany',
  'Bamboo',
  'Fruit Trees (Other)',
]

const loading = ref(true)
const busy = ref(false)
const error = ref('')
const assessment = ref<Assessment | null>(null)
const decisionText = ref('')
const confirmAuthorize = ref(false)
const calc = ref<AssessmentItem[]>([])
const totals = reactive({ mv: 0, av: 0 })
const valuationSummary = ref<ValuationSummary | null>(null)
const taxSummary = ref<TaxSummary | null>(null)
const annualTaxIncrease = ref<AnnualTaxIncrease | null>(null)

const activePanelTab = ref<'items' | 'summary' | 'photos' | 'reassessment'>('items')

const panelTabs = computed(() => [
  { id: 'items' as const, label: 'Appraisal & Items', badge: `${form.items.length}` },
  { id: 'summary' as const, label: 'Valuation & Tax Summary' },
  { id: 'photos' as const, label: 'Pictures of Land' },
  { id: 'reassessment' as const, label: 'Reassessment (Price Changes)', badge: assessment.value?.reassessments?.length ? `${assessment.value.reassessments.length}` : undefined },
])

const form = reactive({
  pin: '',
  arp_number: '',
  is_taxable: true,
  exemption_reason: '',
  effective_year: new Date().getFullYear(),
  effective_quarter: 1,
  annual_tax_increase_pct: 3.0,
  annual_tax_increase_enabled: false,
  remarks: '',
  items: [] as AssessmentItemInput[],
})

const canEdit = computed(
  () =>
    props.role === 'clerk' &&
    (!assessment.value || ['Draft', 'Returned'].includes(assessment.value.status)),
)

const statusLabel = computed(() =>
  assessment.value ? assessment.value.status.replace(/([a-z])([A-Z])/g, '$1 $2') : 'Not started',
)

const statusClass = computed(() => {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    UnderReview: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Returned: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
    Authorized: 'bg-emerald-100 text-emerald-800',
  }
  const s = assessment.value?.status
  return (s && map[s]) || 'bg-gray-100 text-gray-600'
})

const peso = (v: number | string | undefined | null) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v ?? 0))

const blankItem = (type: ItemType): AssessmentItemInput => {
  if (type === 'Plants/Trees') {
    return {
      item_type: 'Plants/Trees',
      classification: 'Agricultural',
      actual_use: 'Agricultural',
      area_sqm: 50,
      unit_value: 850,
      adjustment_factor_pct: 0,
      assessment_level_pct: 40,
      details: {
        plant_kind: 'Coconut',
        age_years: 10,
        quantity_trees: 50,
        stage: 'Productive / Peak Bearing',
        age_bracket: '7-30 yrs',
        is_bearing: true,
      },
    }
  }

  return {
    item_type: type,
    classification: props.defaultClassification,
    actual_use: props.defaultClassification,
    area_sqm: type === 'Land' ? props.defaultArea : 0,
    unit_value: 0,
    adjustment_factor_pct: 0,
    details: type === 'Land' ? {} : { depreciation_pct: 0 },
  }
}

const addItem = async (type: ItemType) => {
  const item = blankItem(type)
  form.items.push(item)
  if (type === 'Plants/Trees') {
    await autoPricePlant(item)
  } else {
    lookupSmv(item)
  }
}

const removeItem = (i: number) => form.items.splice(i, 1)

const onTypeChange = async (item: AssessmentItemInput) => {
  if (item.item_type === 'Plants/Trees') {
    item.classification = 'Agricultural'
    item.actual_use = 'Agricultural'
    item.assessment_level_pct = 40
    item.details = {
      plant_kind: 'Coconut',
      age_years: 8,
      quantity_trees: item.area_sqm > 0 ? item.area_sqm : 50,
    }
    await autoPricePlant(item)
  } else if (item.item_type === 'Land') {
    item.details = {}
    lookupSmv(item)
  } else {
    item.details = { depreciation_pct: 0 }
  }
}

const setDepreciation = (item: AssessmentItemInput, value: string) => {
  item.details = { ...(item.details ?? {}), depreciation_pct: Number(value) || 0 }
}

const onPlantKindChange = async (item: AssessmentItemInput, species: string) => {
  item.details = { ...(item.details ?? {}), plant_kind: species }
  await autoPricePlant(item)
}

const onPlantAgeChange = async (item: AssessmentItemInput, ageStr: string) => {
  const age = Math.max(0, Number(ageStr) || 0)
  item.details = { ...(item.details ?? {}), age_years: age }
  await autoPricePlant(item)
}

const onPlantQuantityChange = (item: AssessmentItemInput) => {
  item.details = { ...(item.details ?? {}), quantity_trees: item.area_sqm }
}

// Automatic price lookup for plants and trees based on species and age
const autoPricePlant = async (item: AssessmentItemInput) => {
  const species = item.details?.plant_kind ?? 'Coconut'
  const age = Number(item.details?.age_years) || 0
  try {
    const res = await lookupPlantPriceApi(species, age)
    item.unit_value = res.unit_value
    item.details = {
      ...(item.details ?? {}),
      plant_kind: res.species,
      age_years: res.age_years,
      stage: res.stage,
      age_bracket: res.age_bracket,
      is_bearing: res.is_bearing,
      unit: res.unit,
      standard_unit_value: res.unit_value,
    }
  } catch {
    /* fallback to current unit value */
  }
}

// Pre-fill unit value from the Schedule of Market Values when the clerk picks a class.
const lookupSmv = async (item: AssessmentItemInput) => {
  if (!canEdit.value || !props.barangay || item.item_type !== 'Land') return
  try {
    const rows = await fetchSmvApi(props.barangay, item.classification)
    const match = rows.find((r) => r.actual_use === item.actual_use) ?? rows[0]
    if (match) item.unit_value = Number(match.unit_value)
  } catch {
    /* SMV lookup is a convenience; clerk can still type a value */
  }
}

const applyAssessment = (a: Assessment | null) => {
  assessment.value = a
  if (a) {
    form.pin = a.pin ?? ''
    form.arp_number = a.arp_number ?? ''
    form.is_taxable = a.taxability_status === 'Taxable'
    form.exemption_reason = a.exemption_reason ?? ''
    form.effective_year = a.effective_year
    form.effective_quarter = a.effective_quarter
    form.annual_tax_increase_pct = Number(a.annual_tax_increase_pct) || 3.0
    form.annual_tax_increase_enabled = Boolean(a.annual_tax_increase_enabled)
    form.remarks = ''
    form.items = a.items.map((i) => ({
      item_type: i.item_type,
      classification: i.classification,
      actual_use: i.actual_use,
      area_sqm: Number(i.area_sqm),
      unit_value: Number(i.unit_value),
      adjustment_factor_pct: Number(i.adjustment_factor_pct),
      assessment_level_pct: Number(i.assessment_level_pct),
      details: i.details ?? {},
    }))
    valuationSummary.value = a.valuation_summary ?? null
    taxSummary.value = a.tax_summary ?? null
    annualTaxIncrease.value = a.annual_tax_increase ?? null
  } else {
    form.pin = props.defaultPin
    form.arp_number = props.defaultArp
    form.is_taxable = !props.taxExempt
    form.exemption_reason = props.exemptionNotes ?? ''
    form.annual_tax_increase_pct = 3.0
    form.annual_tax_increase_enabled = false
    form.items = [blankItem('Land')]
    lookupSmv(form.items[0])
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
const recalc = async () => {
  if (!form.items.length) {
    calc.value = []
    totals.mv = totals.av = 0
    valuationSummary.value = null
    taxSummary.value = null
    annualTaxIncrease.value = null
    return
  }
  try {
    const res = await calculateAssessmentApi(form.items, form.is_taxable, {
      barangay: props.barangay,
      annual_tax_increase_pct: form.annual_tax_increase_pct,
      annual_tax_increase_enabled: form.annual_tax_increase_enabled,
      effective_year: form.effective_year,
    })
    calc.value = res.items
    totals.mv = res.total_market_value
    totals.av = res.total_assessed_value
    if (res.valuation_summary) valuationSummary.value = res.valuation_summary
    if (res.tax_summary) taxSummary.value = res.tax_summary
    if (res.annual_tax_increase) annualTaxIncrease.value = res.annual_tax_increase
  } catch {
    /* transient validation errors while typing are expected */
  }
}

const yearlyProjections = computed<YearlyProjection[]>(() => {
  return annualTaxIncrease.value?.projections ?? []
})

watch(
  () => [
    form.items,
    form.is_taxable,
    form.annual_tax_increase_pct,
    form.annual_tax_increase_enabled,
    form.effective_year,
  ],
  () => {
    if (!canEdit.value && assessment.value) return
    clearTimeout(timer)
    timer = setTimeout(recalc, 300)
  },
  { deep: true },
)

const load = async () => {
  loading.value = true
  try {
    applyAssessment(await fetchAssessmentApi(props.applicationId))
    await recalc()
  } catch (e) {
    error.value = parseApiError(e).message
  } finally {
    loading.value = false
  }
}

onMounted(load)

const run = async (fn: () => Promise<unknown>) => {
  busy.value = true
  error.value = ''
  try {
    await fn()
    emit('changed')
    await load()
  } catch (e) {
    error.value = parseApiError(e).message
  } finally {
    busy.value = false
  }
}

const payload = () => ({
  pin: form.pin,
  arp_number: form.arp_number,
  is_taxable: form.is_taxable,
  exemption_reason: form.is_taxable ? undefined : form.exemption_reason,
  effective_year: form.effective_year,
  effective_quarter: form.effective_quarter,
  annual_tax_increase_pct: form.annual_tax_increase_pct,
  annual_tax_increase_enabled: form.annual_tax_increase_enabled,
  remarks: form.remarks,
  items: form.items,
})

const save = () => run(() => saveAssessmentApi(props.applicationId, payload()))

const saveAndSubmit = () =>
  run(async () => {
    await saveAssessmentApi(props.applicationId, payload())
    await submitAssessmentApi(props.applicationId)
  })

const decide = (action: 'approve' | 'return' | 'reject') =>
  run(async () => {
    if (action === 'approve') await approveAssessmentApi(props.applicationId, decisionText.value)
    if (action === 'return') await returnAssessmentApi(props.applicationId, decisionText.value)
    if (action === 'reject') await rejectAssessmentApi(props.applicationId, decisionText.value)
    decisionText.value = ''
  })

const authorize = () =>
  run(async () => {
    await authorizeAssessmentApi(props.applicationId)
    confirmAuthorize.value = false
  })
</script>

<style scoped>
.field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-600;
}
.lbl {
  @apply block font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm;
}
.btn-secondary {
  @apply px-5 py-2.5 border border-primary-700 text-primary-700 hover:bg-primary-50 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm;
}
.btn-green {
  @apply px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm;
}
.btn-yellow {
  @apply px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm;
}
.btn-red {
  @apply px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm;
}
</style>
