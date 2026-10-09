<template>
  <div class="p-6 space-y-8 max-w-4xl mx-auto">
    <!-- General Assessor Settings -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 space-y-6 border border-gray-100 dark:border-gray-700">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">System Preferences</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Configure municipal assessor office preferences and session rules</p>
      </div>

      <div v-if="generalSuccessMsg" class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs">
        {{ generalSuccessMsg }}
      </div>

      <form class="space-y-6" @submit.prevent="saveGeneralSettings">
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Municipality Name</label>
          <input
            v-model="settings.municipalityName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Office Name</label>
          <input
            v-model="settings.officeName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Fiscal Year</label>
            <input
              v-model="settings.fiscalYear"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Session Timeout (minutes)</label>
            <input
              v-model.number="settings.sessionTimeout"
              type="number"
              min="5"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
            />
          </div>
        </div>
        <label class="flex items-center gap-3">
          <input
            v-model="settings.emailNotifications"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable email notifications for status changes</span>
        </label>

        <button
          type="submit"
          :disabled="savingGeneral"
          class="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white font-semibold rounded-lg transition text-sm shadow-xs"
        >
          {{ savingGeneral ? 'Saving...' : 'Save General Settings' }}
        </button>
      </form>
    </div>

    <!-- Real Property Tax Rates & Statutory Billing Parameters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 space-y-6 border border-gray-100 dark:border-gray-700">
      <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Real Property Tax Rates & Statutory Billing</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Adjust statutory Basic Real Property Tax %, Special Education Fund (SEF) %, monthly penalties, and prompt payment discount rates (Sec. 233 &amp; 235, Local Government Code)
        </p>
      </div>

      <div v-if="loadingBilling" class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        Loading statutory billing rates...
      </div>

      <form v-else class="space-y-6" @submit.prevent="saveBillingSettings">
        <!-- Feedback banners -->
        <div v-if="billingSuccessMsg" class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs">
          {{ billingSuccessMsg }}
        </div>
        <div v-if="billingErrorMsg" class="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-800 dark:text-red-200 text-xs">
          {{ billingErrorMsg }}
        </div>

        <!-- Current Active Basis Banner -->
        <div class="p-4 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 text-xs space-y-1.5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="font-bold text-primary-900 dark:text-primary-300 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-primary-700 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Current Statutory Authority: {{ billingSettings.billOrOrdinanceName || 'Local Government Code of 1991 (R.A. 7160)' }}
            </span>
            <span class="text-gray-500 dark:text-gray-400">
              Enacted / Changed: <strong>{{ billingSettings.changedAt || '2026-01-01' }}</strong> | By: <strong>{{ billingSettings.changedBy || 'Administrator' }}</strong>
            </span>
          </div>
          <p v-if="billingSettings.changeNote" class="text-gray-600 dark:text-gray-300 italic border-t border-primary-100 dark:border-primary-900/50 pt-1.5">
            Note: "{{ billingSettings.changeNote }}"
          </p>
        </div>

        <!-- Rates & Penalties Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
            <h3 class="font-bold text-emerald-900 dark:text-emerald-300 text-sm">Tax Rates (% of Assessed Value)</h3>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Basic Real Property Tax (RPT) %</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.basicRatePct"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="3"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Municipal general fund levy (typically 1.0%)</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Education Fund (SEF) %</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.sefRatePct"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Dedicated local school board levy (1.0% statutory)</span>
            </div>
          </div>

          <div class="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
            <h3 class="font-bold text-amber-900 dark:text-amber-300 text-sm">Statutory Interest & Penalties</h3>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Monthly Overdue Penalty %</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.monthlyPenaltyPct"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Standard 2.0% per month overdue</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Max Penalty Cap (Months)</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.maxPenaltyMonths"
                  type="number"
                  min="12"
                  max="72"
                  class="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-xs font-bold">Mos</span>
              </div>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">LGC Sec. 255: Max 36 months (72% maximum penalty)</span>
            </div>
          </div>
        </div>

        <!-- Discounts & Prefixes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3">
            <h3 class="font-bold text-blue-900 dark:text-blue-300 text-sm">Prompt & Advance Payment Incentives</h3>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Advance Payment Discount % (Paid before Jan 1)</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.advanceDiscountPct"
                  type="number"
                  step="1"
                  min="0"
                  max="30"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Standard: 20% on principal</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Prompt Payment Discount % (Paid on/before Quarter Due Date)</label>
              <div class="relative">
                <input
                  v-model.number="billingSettings.promptDiscountPct"
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  class="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <span class="absolute right-3 top-2 text-gray-500 text-sm font-bold">%</span>
              </div>
              <span class="text-[11px] text-gray-500 dark:text-gray-400">Standard: 10% on principal</span>
            </div>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
            <h3 class="font-bold text-gray-900 dark:text-white text-sm">Sequential Number Prefixes</h3>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">OR Prefix</label>
                <input
                  v-model="billingSettings.orPrefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">SOA Prefix</label>
                <input
                  v-model="billingSettings.soaPrefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bill Prefix</label>
                <input
                  v-model="billingSettings.billPrefix"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-mono text-sm"
                />
              </div>
            </div>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">Sequential series automatically formats as PREFIX-YYYY-XXXXX</p>
          </div>
        </div>

        <!-- Requirement 2: Statutory Authority & Change Note Documentation -->
        <div class="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-indigo-950 dark:text-indigo-200 text-sm">
                Enacting Legislation & Change Note Documentation
              </h3>
              <p class="text-[11px] text-indigo-700 dark:text-indigo-400">
                Mandatory legal recording: Specify the enacting bill/ordinance, enactment date, and administrative notes whenever statutory rates are modified.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name of the Bill / Ordinance -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1.5">
                Name of Bill / Enacting Ordinance <span class="text-red-500">*</span>
              </label>
              <input
                v-model="billingSettings.billOrOrdinanceName"
                type="text"
                required
                placeholder="e.g. Municipal Ordinance No. 2026-004 / Sanggunian Panlalawigan Resolution 45"
                class="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-medium shadow-xs"
              />
              <span class="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Title or number of the approved municipal bill or tax ordinance.</span>
            </div>

            <!-- Date When It Was Changed -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1.5">
                Date When Changed / Effectivity Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="billingSettings.changedAt"
                type="date"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm font-mono shadow-xs"
              />
              <span class="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Date when the legislative bill was enacted or officially took effect.</span>
            </div>
          </div>

          <!-- Textbox for Notes -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1.5">
              Admin Note on Rate Change <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="billingSettings.changeNote"
              rows="3"
              required
              placeholder="Write administrative note explaining why rates were changed, sanggunian session reference, resolution highlights, or statutory justification..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm shadow-xs leading-relaxed"
            ></textarea>
            <span class="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Notes are preserved in the permanent statutory audit history log.</span>
          </div>
        </div>

        <!-- Optional: View Statutory Rate Revision History -->
        <div v-if="billingSettings.changeHistory && billingSettings.changeHistory.length > 0" class="pt-2">
          <button
            type="button"
            @click="showHistory = !showHistory"
            class="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ showHistory ? 'Hide' : 'View' }} Statutory Rate Revision History ({{ billingSettings.changeHistory.length }} recorded)</span>
          </button>

          <!-- History Table -->
          <div v-if="showHistory" class="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table class="w-full text-xs text-left">
              <thead class="bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="p-2.5">Date</th>
                  <th class="p-2.5">Enacting Bill / Ordinance</th>
                  <th class="p-2.5">Basic %</th>
                  <th class="p-2.5">SEF %</th>
                  <th class="p-2.5">Penalty %</th>
                  <th class="p-2.5">Recorded By</th>
                  <th class="p-2.5">Admin Note</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                <tr v-for="(rev, idx) in billingSettings.changeHistory" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td class="p-2.5 font-mono whitespace-nowrap">{{ rev.changedAt }}</td>
                  <td class="p-2.5 font-semibold text-gray-900 dark:text-white">{{ rev.billOrOrdinanceName }}</td>
                  <td class="p-2.5 font-mono">{{ rev.basicRatePct }}%</td>
                  <td class="p-2.5 font-mono">{{ rev.sefRatePct }}%</td>
                  <td class="p-2.5 font-mono">{{ rev.monthlyPenaltyPct }}%</td>
                  <td class="p-2.5 whitespace-nowrap">{{ rev.changedBy }}</td>
                  <td class="p-2.5 italic text-gray-600 dark:text-gray-400 max-w-xs truncate" :title="rev.changeNote">{{ rev.changeNote }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="submit"
          :disabled="savingBilling"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-sm shadow-xs flex items-center gap-2"
        >
          <svg v-if="savingBilling" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{ savingBilling ? 'Saving Statutory Rates...' : 'Update Statutory Tax Rates & Record Note' }}</span>
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
const generalSuccessMsg = ref('')
const settings = ref({
  municipalityName: 'Municipality of Magarao',
  officeName: "Municipal Assessor's Office",
  fiscalYear: 2026,
  sessionTimeout: 30,
  emailNotifications: true,
})

const loadingBilling = ref(false)
const savingBilling = ref(false)
const billingSuccessMsg = ref('')
const billingErrorMsg = ref('')
const showHistory = ref(false)

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
  billOrOrdinanceName: 'Local Government Code of 1991 (R.A. 7160)',
  changeNote: 'Statutory basic RPT & SEF rates established pursuant to RA 7160 Sections 233 and 235.',
  changedAt: '2026-01-01',
  changedBy: 'Municipal Assessor / Sangguniang Bayan',
  changeHistory: [],
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
    billingSettings.value = {
      ...billingSettings.value,
      ...bData,
      billOrOrdinanceName: bData.billOrOrdinanceName || 'Local Government Code of 1991 (R.A. 7160)',
      changedAt: bData.changedAt || new Date().toISOString().split('T')[0],
      changeNote: bData.changeNote || '',
    }
  } catch (err) {
    console.error('Failed to load billing settings:', err)
  } finally {
    loadingBilling.value = false
  }
})

const saveGeneralSettings = async () => {
  savingGeneral.value = true
  generalSuccessMsg.value = ''
  try {
    settings.value = await updateSettings(settings.value)
    generalSuccessMsg.value = 'General system preferences saved successfully.'
    setTimeout(() => {
      generalSuccessMsg.value = ''
    }, 4000)
  } catch (e) {
    alert(parseApiError(e).message)
  } finally {
    savingGeneral.value = false
  }
}

const saveBillingSettings = async () => {
  billingSuccessMsg.value = ''
  billingErrorMsg.value = ''

  if (!billingSettings.value.billOrOrdinanceName) {
    billingErrorMsg.value = 'Please provide the name of the legislative bill or enacting ordinance for this rate change.'
    return
  }

  if (!billingSettings.value.changeNote) {
    billingErrorMsg.value = 'Please write an administrative note explaining when and why the statutory rates were changed.'
    return
  }

  savingBilling.value = true
  try {
    billingSettings.value = await updateBillingSettingsApi(billingSettings.value)
    billingSuccessMsg.value = 'Statutory tax rates, enacting bill notes, and discount rules updated and recorded in the audit history!'
    setTimeout(() => {
      billingSuccessMsg.value = ''
    }, 5000)
  } catch (e) {
    billingErrorMsg.value = parseApiError(e).message
  } finally {
    savingBilling.value = false
  }
}
</script>
