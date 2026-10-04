<template>
  <div class="p-6 space-y-8 max-w-4xl mx-auto">
    <!-- General Assessor Settings -->
    <div class="bg-white rounded-xl shadow-md p-8 space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">System Preferences</h2>
        <p class="text-gray-600 mt-1">Configure municipal assessor office preferences and session rules</p>
      </div>

      <form class="space-y-6" @submit.prevent="saveGeneralSettings">
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Municipality Name</label>
          <input
            v-model="settings.municipalityName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Office Name</label>
          <input
            v-model="settings.officeName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Fiscal Year</label>
            <input
              v-model="settings.fiscalYear"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Session Timeout (minutes)</label>
            <input
              v-model.number="settings.sessionTimeout"
              type="number"
              min="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
        <label class="flex items-center gap-3">
          <input
            v-model="settings.emailNotifications"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm font-medium text-gray-700">Enable email notifications for status changes</span>
        </label>

        <button
          type="submit"
          :disabled="savingGeneral"
          class="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {{ savingGeneral ? 'Saving...' : 'Save General Settings' }}
        </button>
      </form>
    </div>

    <!-- Real Property Tax Rates & Statutory Billing Parameters -->
    <div class="bg-white rounded-xl shadow-md p-8 space-y-6">
      <div class="border-b border-gray-200 pb-4">
        <h2 class="text-2xl font-bold text-gray-900">Real Property Tax Rates & Statutory Billing</h2>
        <p class="text-gray-600 mt-1">
          Adjust statutory Basic Real Property Tax %, Special Education Fund (SEF) %, monthly penalties, and prompt payment discount rates (Sec. 233 &amp; 235, Local Government Code)
        </p>
      </div>

      <div v-if="loadingBilling" class="text-center py-6 text-gray-500">
        Loading statutory billing rates...
      </div>

      <form v-else class="space-y-6" @submit.prevent="saveBillingSettings">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
            <h3 class="font-bold text-emerald-900 text-sm">Tax Rates (% of Assessed Value)</h3>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Basic Real Property Tax (RPT) %</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.basicRatePct"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="3"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500">Municipal general fund levy (typically 1.0%)</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Special Education Fund (SEF) %</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.sefRatePct"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500">Dedicated local school board levy (1.0% statutory)</span>
            </div>
          </div>

          <div class="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
            <h3 class="font-bold text-amber-900 text-sm">Statutory Interest & Penalties</h3>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Monthly Overdue Penalty %</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.monthlyPenaltyPct"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500">Standard 2.0% per month overdue</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Max Penalty Cap (Months)</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.maxPenaltyMonths"
                  type="number"
                  min="12"
                  max="72"
                  class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-xs font-bold">Mos</span>
              </div>
              <span class="text-[11px] text-gray-500">LGC Sec. 255: Max 36 months (72% maximum penalty)</span>
            </div>
          </div>
        </div>

        <!-- Discounts & Prefixes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
            <h3 class="font-bold text-blue-900 text-sm">Prompt & Advance Payment Incentives</h3>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Advance Payment Discount % (Paid before Jan 1)</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.advanceDiscountPct"
                  type="number"
                  step="1"
                  min="0"
                  max="30"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500">Standard: 20% on principal</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Prompt Payment Discount % (Paid on/before Quarter Due Date)</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.promptDiscountPct"
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500">Standard: 10% on principal</span>
            </div>
          </div>

          <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <h3 class="font-bold text-gray-900 text-sm">Sequential Number Prefixes</h3>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">OR Prefix</label>
                <input
                  v-model="billingSettings.orPrefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">SOA Prefix</label>
                <input
                  v-model="billingSettings.soaPrefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Bill Prefix</label>
                <input
                  v-model="billingSettings.billPrefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
            <p class="text-[11px] text-gray-500">Sequential series automatically formats as PREFIX-YYYY-XXXXX</p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="savingBilling"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
        >
          {{ savingBilling ? 'Saving...' : 'Update Statutory Tax Rates & Settings' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchSettings, updateSettings } from '@/services/settingsApi'
import { fetchBillingSettings, updateBillingSettingsApi, type BillingSettingsData } from '@/services/billingApi'
import { parseApiError } from '@/services/apiError'

const savingGeneral = ref(false)
const settings = ref({
  municipalityName: 'Municipality of Magarao',
  officeName: "Municipal Assessor's Office",
  fiscalYear: 2024,
  sessionTimeout: 30,
  emailNotifications: true,
})

const loadingBilling = ref(false)
const savingBilling = ref(false)
const billingSettings = ref<BillingSettingsData>({
  basicRatePct: 1.0,
  sefRatePct: 1.0,
  monthlyPenaltyPct: 2.0,
  maxPenaltyMonths: 36,
  advanceDiscountPct: 20.0,
  promptDiscountPct: 10.0,
  quarterDueDates: [
    { quarter: 1, month: 1, day: 20 },
    { quarter: 2, month: 4, day: 20 },
    { quarter: 3, month: 7, day: 20 },
    { quarter: 4, month: 10, day: 20 },
  ],
  orPrefix: 'OR',
  soaPrefix: 'SOA',
  billPrefix: 'BILL',
})

onMounted(async () => {
  try {
    settings.value = { ...settings.value, ...(await fetchSettings()) }
  } catch {
    const stored = localStorage.getItem('rptms_settings')
    if (stored) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(stored) }
      } catch {
        /* ignore */
      }
    }
  }

  loadingBilling.value = true
  try {
    const bData = await fetchBillingSettings()
    billingSettings.value = bData
  } catch (err) {
    console.error('Failed to load billing settings:', err)
  } finally {
    loadingBilling.value = false
  }
})

const saveGeneralSettings = async () => {
  savingGeneral.value = true
  try {
    settings.value = await updateSettings(settings.value)
    alert('General settings saved successfully.')
  } catch (e) {
    alert(parseApiError(e).message)
  } finally {
    savingGeneral.value = false
  }
}

const saveBillingSettings = async () => {
  savingBilling.value = true
  try {
    billingSettings.value = await updateBillingSettingsApi(billingSettings.value)
    alert('Statutory tax rates, penalty percentages, and discount rules updated successfully!')
  } catch (e) {
    alert(parseApiError(e).message)
  } finally {
    savingBilling.value = false
  }
}
</script>
