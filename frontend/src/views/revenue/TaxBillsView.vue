<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Real Property Tax Bills</h2>
        <p class="text-xs text-gray-500 mt-0.5">Calculated real property tax assessments split into 4 quarterly installments</p>
      </div>

      <button
        @click="showGenerateModal = true"
        class="px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Generate Tax Bill
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Search Property / Owner</label>
        <input
          v-model="filters.search"
          @input="loadBills"
          type="text"
          placeholder="Search bill no, TD, owner..."
          class="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Taxable Year</label>
        <select
          v-model="filters.year"
          @change="loadBills"
          class="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Years</option>
          <option :value="2026">2026</option>
          <option :value="2025">2025</option>
          <option :value="2024">2024</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Billing Status</label>
        <select
          v-model="filters.status"
          @change="loadBills"
          class="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      <div class="flex items-end">
        <button
          @click="resetFilters"
          class="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Bills Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50 text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
            <tr>
              <th class="p-3.5">Bill Number</th>
              <th class="p-3.5">Tax Declaration</th>
              <th class="p-3.5">Owner / Payor</th>
              <th class="p-3.5">Barangay</th>
              <th class="p-3.5 text-center">Tax Year</th>
              <th class="p-3.5 text-right">Assessed Value</th>
              <th class="p-3.5 text-right">Basic (1%)</th>
              <th class="p-3.5 text-right">SEF (1%)</th>
              <th class="p-3.5 text-right">Total Tax</th>
              <th class="p-3.5 text-center">Status</th>
              <th class="p-3.5 text-center">Installments</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-sans">
            <tr v-if="loading" class="text-center">
              <td colspan="11" class="p-8 text-gray-400">Loading bills...</td>
            </tr>
            <tr v-else-if="bills.length === 0" class="text-center">
              <td colspan="11" class="p-8 text-gray-400">No tax bills found matching criteria.</td>
            </tr>
            <tr v-for="b in bills" :key="b.id" class="hover:bg-gray-50 transition">
              <td class="p-3.5 font-mono font-bold text-primary-900">{{ b.bill_no }}</td>
              <td class="p-3.5 font-mono">{{ b.tax_declaration?.td_number || '-' }}</td>
              <td class="p-3.5 font-medium text-gray-900">{{ b.tax_declaration?.owner_name || '-' }}</td>
              <td class="p-3.5 text-gray-600">{{ b.tax_declaration?.barangay || '-' }}</td>
              <td class="p-3.5 text-center font-bold text-gray-700">{{ b.taxable_year }}</td>
              <td class="p-3.5 text-right font-mono">{{ formatPeso(b.assessed_value) }}</td>
              <td class="p-3.5 text-right font-mono text-gray-600">{{ formatPeso(b.basic_tax) }}</td>
              <td class="p-3.5 text-right font-mono text-gray-600">{{ formatPeso(b.sef_tax) }}</td>
              <td class="p-3.5 text-right font-mono font-bold text-gray-900">{{ formatPeso(b.total_tax) }}</td>
              <td class="p-3.5 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ b.status }}
                </span>
              </td>
              <td class="p-3.5 text-center">
                <button
                  @click="openInstallmentsModal(b)"
                  class="px-2.5 py-1 text-[11px] font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
                >
                  View Q1-Q4
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Generate Bill Modal -->
    <div v-if="showGenerateModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 class="text-base font-bold text-gray-900">Generate Tax Bill</h3>
        <p class="text-xs text-gray-500">Search an active Tax Declaration to calculate and generate annual billing</p>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Search Property (TD / Owner / PIN)</label>
            <input
              v-model="searchQuery"
              @input="searchProperties"
              type="text"
              placeholder="e.g. Maria Santos or TD-2024..."
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <!-- Search results dropdown -->
          <div v-if="searchResults.length > 0" class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            <div
              v-for="r in searchResults"
              :key="r.tax_declaration_id"
              @click="selectedTd = r; searchResults = []"
              class="p-2 text-xs hover:bg-gray-50 cursor-pointer"
            >
              <p class="font-bold text-gray-900">{{ r.td_number }} - {{ r.owner_name }}</p>
              <p class="text-[11px] text-gray-500">{{ r.barangay }} • Assessed: PHP {{ formatPeso(r.total_assessed_value) }}</p>
            </div>
          </div>

          <div v-if="selectedTd" class="p-3 bg-primary-50 border border-primary-200 rounded-lg text-xs space-y-1">
            <p><strong class="text-primary-900">Selected Property:</strong> {{ selectedTd.td_number }}</p>
            <p class="text-gray-700">Owner: {{ selectedTd.owner_name }}</p>
            <p class="text-gray-700">Assessed Value: PHP {{ formatPeso(selectedTd.total_assessed_value) }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Taxable Year</label>
            <select
              v-model="targetYear"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option :value="2026">2026</option>
              <option :value="2025">2025</option>
              <option :value="2024">2024</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="showGenerateModal = false; selectedTd = null"
            class="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleGenerateBill"
            :disabled="!selectedTd || generating"
            class="px-4 py-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            {{ generating ? 'Generating...' : 'Confirm & Generate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Installments Breakdown Modal -->
    <div v-if="showInstallmentsModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-gray-900 text-base">Quarterly Installments breakdown</h3>
            <p class="text-xs text-gray-500 font-mono">{{ activeBill?.bill_no }} • {{ activeBill?.tax_declaration?.owner_name }}</p>
          </div>
          <button @click="showInstallmentsModal = false" class="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-600 uppercase font-semibold text-[11px] border-b">
              <tr>
                <th class="p-2.5">Quarter</th>
                <th class="p-2.5">Due Date</th>
                <th class="p-2.5 text-right">Basic Due</th>
                <th class="p-2.5 text-right">SEF Due</th>
                <th class="p-2.5 text-right">Paid</th>
                <th class="p-2.5 text-right">Principal Bal</th>
                <th class="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 font-mono text-xs">
              <tr v-for="inst in activeBill?.installments" :key="inst.id">
                <td class="p-2.5 font-sans font-bold text-gray-900">Q{{ inst.quarter }}</td>
                <td class="p-2.5 font-sans text-gray-600">{{ inst.due_date }}</td>
                <td class="p-2.5 text-right">{{ formatPeso(inst.basic_due) }}</td>
                <td class="p-2.5 text-right">{{ formatPeso(inst.sef_due) }}</td>
                <td class="p-2.5 text-right text-emerald-700">
                  {{ formatPeso(Number(inst.basic_paid) + Number(inst.sef_paid)) }}
                </td>
                <td class="p-2.5 text-right font-bold text-gray-900">{{ formatPeso(inst.principal_balance) }}</td>
                <td class="p-2.5 text-center font-sans">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      inst.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ inst.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <button
            @click="showInstallmentsModal = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchBills,
  generateTaxBillApi,
  searchPropertiesForBilling,
  type TaxBillData,
  type PropertySearchResult,
} from '@/services/billingApi'

const loading = ref(true)
const bills = ref<TaxBillData[]>([])
const filters = ref({
  search: '',
  year: '',
  status: '',
})

const showGenerateModal = ref(false)
const showInstallmentsModal = ref(false)
const activeBill = ref<TaxBillData | null>(null)

const searchQuery = ref('')
const searchResults = ref<PropertySearchResult[]>([])
const selectedTd = ref<PropertySearchResult | null>(null)
const targetYear = ref(2026)
const generating = ref(false)

const formatPeso = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadBills = async () => {
  loading.value = true
  try {
    const res = await fetchBills({
      year: filters.value.year ? Number(filters.value.year) : undefined,
      status: filters.value.status || undefined,
      search: filters.value.search || undefined,
    })
    bills.value = res.data || []
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = { search: '', year: '', status: '' }
  void loadBills()
}

const searchProperties = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  try {
    searchResults.value = await searchPropertiesForBilling(searchQuery.value)
  } catch (e) {
    console.error(e)
  }
}

const handleGenerateBill = async () => {
  if (!selectedTd.value) return
  generating.value = true
  try {
    await generateTaxBillApi(selectedTd.value.tax_declaration_id, targetYear.value)
    showGenerateModal.value = false
    selectedTd.value = null
    searchQuery.value = ''
    await loadBills()
    alert('Tax Bill generated successfully!')
  } catch (e: any) {
    alert(e.message || 'Failed to generate tax bill')
  } finally {
    generating.value = false
  }
}

const openInstallmentsModal = (bill: TaxBillData) => {
  activeBill.value = bill
  showInstallmentsModal.value = true
}

onMounted(() => {
  void loadBills()
})
</script>
