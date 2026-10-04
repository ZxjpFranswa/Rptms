<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Delinquent Real Property Accounts</h2>
        <p class="text-gray-600 mt-1">Monitor unpaid real property tax obligations, statutory penalties, and aging schedules</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="exportCsv"
          :disabled="loading || accounts.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Summary Aging Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Delinquencies</span>
          <span class="p-2 bg-red-50 text-red-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ totalAccounts }}</p>
        <p class="text-xs text-gray-500 mt-1">Properties with overdue quarters</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue Principal</span>
          <span class="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-amber-700 mt-2">₱{{ formatCurrency(summary.total_principal) }}</p>
        <p class="text-xs text-gray-500 mt-1">Basic RPT & SEF balances</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accrued Penalties</span>
          <span class="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-purple-700 mt-2">₱{{ formatCurrency(summary.total_penalty) }}</p>
        <p class="text-xs text-gray-500 mt-1">2%/month (capped at 72%)</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-red-200 bg-gradient-to-br from-white to-red-50/40 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-red-600 uppercase tracking-wider">Total Collectible</span>
          <span class="p-2 bg-red-100 text-red-700 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-red-700 mt-2">₱{{ formatCurrency(summary.total_due) }}</p>
        <p class="text-xs text-red-600 font-medium mt-1">Principal + Penalties</p>
      </div>
    </div>

    <!-- Aging Schedule Distribution -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Aging Schedule Breakdown</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-3 bg-yellow-50/70 border border-yellow-200 rounded-lg text-center">
          <p class="text-xs font-semibold text-yellow-800">≤ 1 Year</p>
          <p class="text-lg font-bold text-yellow-900 mt-1">₱{{ formatCurrency(agingSummary.less_than_1_yr) }}</p>
          <span class="text-[11px] text-yellow-700">{{ agingCounts.less_than_1_yr || 0 }} accounts</span>
        </div>
        <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-center">
          <p class="text-xs font-semibold text-amber-800">1 to 2 Years</p>
          <p class="text-lg font-bold text-amber-900 mt-1">₱{{ formatCurrency(agingSummary.one_to_two_yrs) }}</p>
          <span class="text-[11px] text-amber-700">{{ agingCounts.one_to_two_yrs || 0 }} accounts</span>
        </div>
        <div class="p-3 bg-orange-50/70 border border-orange-200 rounded-lg text-center">
          <p class="text-xs font-semibold text-orange-800">2 to 3 Years</p>
          <p class="text-lg font-bold text-orange-900 mt-1">₱{{ formatCurrency(agingSummary.two_to_three_yrs) }}</p>
          <span class="text-[11px] text-orange-700">{{ agingCounts.two_to_three_yrs || 0 }} accounts</span>
        </div>
        <div class="p-3 bg-red-50/70 border border-red-200 rounded-lg text-center">
          <p class="text-xs font-semibold text-red-800">&gt; 3 Years (Critical)</p>
          <p class="text-lg font-bold text-red-900 mt-1">₱{{ formatCurrency(agingSummary.more_than_three_yrs) }}</p>
          <span class="text-[11px] text-red-700">{{ agingCounts.more_than_three_yrs || 0 }} accounts</span>
        </div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Search & Barangay Filter -->
      <div class="p-4 border-b border-gray-200 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Search Property or Owner</label>
          <input
            v-model="searchQuery"
            @input="debounceSearch"
            type="text"
            placeholder="Search TD #, PIN, or Owner Name..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Filter by Barangay</label>
          <select
            v-model="selectedBarangay"
            @change="loadDelinquents"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
          >
            <option value="">All Barangays</option>
            <option v-for="b in barangays" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Delinquents Table -->
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Calculating and loading delinquent accounts...
      </div>

      <div v-else-if="accounts.length === 0" class="p-12 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Delinquent Accounts Found</p>
        <p class="text-sm text-gray-500 mt-1">All accounts in the filtered scope are up to date or no overdue installments exist.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <th class="py-3 px-4">TD Number</th>
              <th class="py-3 px-4">Owner Name</th>
              <th class="py-3 px-4">Barangay</th>
              <th class="py-3 px-4 text-center">Unpaid Quarters</th>
              <th class="py-3 px-4">Aging Bracket</th>
              <th class="py-3 px-4 text-right">Principal Balance</th>
              <th class="py-3 px-4 text-right">Penalty</th>
              <th class="py-3 px-4 text-right">Total Delinquent</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="acc in accounts"
              :key="acc.tax_declaration_id || acc.td_number"
              class="hover:bg-red-50/30 transition"
            >
              <td class="py-3 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">
                {{ acc.td_number }}
                <span v-if="acc.pin" class="block text-[11px] text-gray-500 font-mono">PIN: {{ acc.pin }}</span>
              </td>
              <td class="py-3 px-4 text-gray-800 font-medium whitespace-nowrap">
                {{ acc.owner_name }}
              </td>
              <td class="py-3 px-4 text-gray-600 whitespace-nowrap">
                {{ acc.barangay }}
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <span class="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold text-xs">
                  {{ acc.overdue_quarters_count || 1 }}
                </span>
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-1 text-xs font-semibold rounded-full',
                    getAgingBadgeClass(acc.aging_bracket)
                  ]"
                >
                  {{ acc.aging_bracket || '≤ 1 Year' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-medium text-gray-900 whitespace-nowrap">
                ₱{{ formatCurrency(acc.principal_balance) }}
              </td>
              <td class="py-3 px-4 text-right font-medium text-red-600 whitespace-nowrap">
                ₱{{ formatCurrency(acc.computed_penalty) }}
              </td>
              <td class="py-3 px-4 text-right font-bold text-red-700 whitespace-nowrap">
                ₱{{ formatCurrency(acc.total_due) }}
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <button
                  @click="openPrepareSoaModal(acc)"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition shadow-sm"
                  title="Prepare official Statement of Account for collection notice"
                >
                  Generate SOA
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Prepare SOA Modal for Selected Delinquent -->
    <div
      v-if="showSoaModal && selectedDelinquent"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-fadeIn">
        <div class="bg-primary-700 text-white px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold">Issue Statement of Account for Delinquency</h3>
          <button @click="showSoaModal = false" class="text-primary-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleGenerateDelinquentSoa" class="p-6 space-y-4">
          <!-- Property Info Box -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div class="flex justify-between items-center border-b border-red-200 pb-1.5">
              <span class="font-bold text-red-900">Delinquent Account Details</span>
              <span class="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">{{ selectedDelinquent.aging_bracket }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-gray-800">
              <div><span class="text-gray-500">TD Number:</span> <strong class="font-mono">{{ selectedDelinquent.td_number }}</strong></div>
              <div><span class="text-gray-500">Owner:</span> <strong>{{ selectedDelinquent.owner_name }}</strong></div>
              <div><span class="text-gray-500">Barangay:</span> {{ selectedDelinquent.barangay }}</div>
              <div><span class="text-gray-500">Total Delinquent:</span> <strong class="text-red-700">₱{{ formatCurrency(selectedDelinquent.total_due) }}</strong></div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">As-Of Date</label>
              <input
                v-model="soaForm.as_of_date"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Valid Until</label>
              <input
                v-model="soaForm.valid_until"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Remarks / Legal Reference</label>
            <textarea
              v-model="soaForm.remarks"
              rows="2"
              placeholder="e.g. Delinquency notice issued per Sec. 254 of the Local Government Code..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            ></textarea>
          </div>

          <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
            Note: Because late penalties are applied, this Statement will be submitted for <strong>Municipal Treasurer Approval</strong> before cashier collection.
          </p>

          <div class="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="showSoaModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 font-semibold rounded-lg shadow-sm transition"
            >
              {{ submitting ? 'Generating...' : 'Submit to Treasurer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchDelinquentsReport, createSoaApi } from '@/services/billingApi'

const router = useRouter()
const accounts = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const totalAccounts = ref(0)

const searchQuery = ref('')
const selectedBarangay = ref('')

const summary = ref({
  total_principal: 0,
  total_penalty: 0,
  total_due: 0,
})

const agingSummary = ref({
  less_than_1_yr: 0,
  one_to_two_yrs: 0,
  two_to_three_yrs: 0,
  more_than_three_yrs: 0,
})

const agingCounts = ref({
  less_than_1_yr: 0,
  one_to_two_yrs: 0,
  two_to_three_yrs: 0,
  more_than_three_yrs: 0,
})

const barangays = [
  'Barangay Poblacion',
  'Barangay San Juan',
  'Barangay Santa Maria',
  'Barangay San Pedro',
  'Barangay San Isidro',
]

// Modal state
const showSoaModal = ref(false)
const selectedDelinquent = ref<any | null>(null)
const soaForm = ref({
  as_of_date: new Date().toISOString().split('T')[0],
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  remarks: '',
})

const loadDelinquents = async () => {
  loading.value = true
  try {
    const res = await fetchDelinquentsReport({
      barangay: selectedBarangay.value || undefined,
      search: searchQuery.value || undefined,
    })

    accounts.value = res.accounts || []
    totalAccounts.value = accounts.value.length

    // Compute summaries
    let principal = 0
    let penalty = 0
    let due = 0

    let lt1 = 0, lt1_cnt = 0
    let o2 = 0, o2_cnt = 0
    let t3 = 0, t3_cnt = 0
    let mt3 = 0, mt3_cnt = 0

    for (const a of accounts.value) {
      principal += Number(a.principal_balance || 0)
      penalty += Number(a.computed_penalty || 0)
      due += Number(a.total_due || 0)

      const bracket = a.aging_bracket || '≤ 1 Year'
      if (bracket === '≤ 1 Year') {
        lt1 += Number(a.total_due || 0)
        lt1_cnt++
      } else if (bracket === '1-2 Years') {
        o2 += Number(a.total_due || 0)
        o2_cnt++
      } else if (bracket === '2-3 Years') {
        t3 += Number(a.total_due || 0)
        t3_cnt++
      } else {
        mt3 += Number(a.total_due || 0)
        mt3_cnt++
      }
    }

    summary.value = {
      total_principal: principal,
      total_penalty: penalty,
      total_due: due,
    }

    agingSummary.value = {
      less_than_1_yr: lt1,
      one_to_two_yrs: o2,
      two_to_three_yrs: t3,
      more_than_three_yrs: mt3,
    }

    agingCounts.value = {
      less_than_1_yr: lt1_cnt,
      one_to_two_yrs: o2_cnt,
      two_to_three_yrs: t3_cnt,
      more_than_three_yrs: mt3_cnt,
    }
  } catch (err) {
    console.error('Failed to load delinquents:', err)
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadDelinquents()
  }, 350)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedBarangay.value = ''
  loadDelinquents()
}

const openPrepareSoaModal = (acc: any) => {
  selectedDelinquent.value = acc
  soaForm.value = {
    as_of_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: `Delinquency Notice for Tax Declaration ${acc.td_number} (${acc.aging_bracket})`,
  }
  showSoaModal.value = true
}

const handleGenerateDelinquentSoa = async () => {
  if (!selectedDelinquent.value) return
  submitting.value = true
  try {
    await createSoaApi({
      tax_declaration_id: selectedDelinquent.value.tax_declaration_id,
      as_of_date: soaForm.value.as_of_date,
      valid_until: soaForm.value.valid_until,
      remarks: soaForm.value.remarks,
    })
    showSoaModal.value = false
    alert('Statement of Account generated and forwarded to Municipal Treasurer for penalty approval!')
    router.push('/revenue/soas')
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to generate SOA')
  } finally {
    submitting.value = false
  }
}

const exportCsv = () => {
  if (accounts.value.length === 0) return
  const headers = ['TD Number', 'PIN', 'Owner Name', 'Barangay', 'Aging Bracket', 'Principal Balance', 'Penalty', 'Total Delinquent']
  const rows = accounts.value.map(a => [
    `"${a.td_number || ''}"`,
    `"${a.pin || ''}"`,
    `"${a.owner_name || ''}"`,
    `"${a.barangay || ''}"`,
    `"${a.aging_bracket || ''}"`,
    Number(a.principal_balance || 0).toFixed(2),
    Number(a.computed_penalty || 0).toFixed(2),
    Number(a.total_due || 0).toFixed(2),
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Delinquent_Accounts_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getAgingBadgeClass = (bracket?: string) => {
  switch (bracket) {
    case '≤ 1 Year': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    case '1-2 Years': return 'bg-amber-100 text-amber-800 border border-amber-200'
    case '2-3 Years': return 'bg-orange-100 text-orange-800 border border-orange-200'
    case '> 3 Years': return 'bg-red-100 text-red-800 border border-red-200 font-bold'
    default: return 'bg-gray-100 text-gray-700'
  }
}

onMounted(() => {
  loadDelinquents()
})
</script>
