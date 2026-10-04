<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Municipal Treasurer Dashboard</h2>
        <p class="text-gray-600 mt-1">Supervise tax collections, authorize penalty calculations, and review receipt corrections</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Office of the Municipal Treasurer
        </span>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Pending Penalty Approvals -->
      <router-link
        to="/treasurer/penalty-approvals"
        class="bg-white rounded-xl shadow-sm border border-amber-200 p-5 hover:shadow-md hover:border-amber-300 transition group"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Penalty Approvals</span>
          <span class="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <p class="text-3xl font-bold text-gray-900">{{ pendingSoasCount }}</p>
          <span v-if="pendingSoasCount > 0" class="text-xs font-semibold text-amber-600 animate-pulse">Needs Review</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">SOAs with penalties awaiting decision</p>
      </router-link>

      <!-- Pending Payment Corrections -->
      <router-link
        to="/treasurer/correction-approvals"
        class="bg-white rounded-xl shadow-sm border border-red-200 p-5 hover:shadow-md hover:border-red-300 transition group"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-red-700 uppercase tracking-wider">Payment Corrections</span>
          <span class="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <p class="text-3xl font-bold text-gray-900">{{ pendingCorrectionsCount }}</p>
          <span v-if="pendingCorrectionsCount > 0" class="text-xs font-semibold text-red-600 animate-pulse">Action Required</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">Cashier cancellation requests</p>
      </router-link>

      <!-- Today's Collections -->
      <div class="bg-white rounded-xl shadow-sm border border-emerald-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Today's Collections</span>
          <span class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-emerald-700 mt-2">₱{{ formatCurrency(dailySummary.total_collected) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ dailySummary.total_transactions }} receipts issued today</p>
      </div>

      <!-- Annual Collections (YTD) -->
      <div class="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-blue-700 uppercase tracking-wider">YTD Collections</span>
          <span class="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-blue-800 mt-2">₱{{ formatCurrency(annualSummary.total_collected) }}</p>
        <p class="text-xs text-gray-500 mt-1">Fiscal Year {{ currentYear }} Total</p>
      </div>
    </div>

    <!-- Quick Workflow Shortcuts -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <router-link
        to="/treasurer/penalty-approvals"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-500 hover:shadow-md transition flex items-start gap-4"
      >
        <div class="p-3 bg-amber-50 rounded-xl text-amber-700 flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 text-sm">Review Penalty Calculations</h3>
          <p class="text-xs text-gray-500 mt-1">Authorize or deny statutory interest applied by Revenue Clerks on delinquent properties.</p>
        </div>
      </router-link>

      <router-link
        to="/treasurer/correction-approvals"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-500 hover:shadow-md transition flex items-start gap-4"
      >
        <div class="p-3 bg-red-50 rounded-xl text-red-700 flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 text-sm">Audit & Authorize Cancellations</h3>
          <p class="text-xs text-gray-500 mt-1">Review Official Receipt cancellation requests submitted by Cashiers and reverse balances.</p>
        </div>
      </router-link>

      <router-link
        to="/treasurer/reports"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-500 hover:shadow-md transition flex items-start gap-4"
      >
        <div class="p-3 bg-emerald-50 rounded-xl text-emerald-700 flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 text-sm">Financial & Collection Reports</h3>
          <p class="text-xs text-gray-500 mt-1">Access Daily, Monthly, Barangay shares, and Official Receipt Registers with CSV export.</p>
        </div>
      </router-link>
    </div>

    <!-- Pending Action Queue -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-gray-900">Statements Awaiting Treasurer Approval</h3>
          <p class="text-xs text-gray-500">Late penalties require approval prior to payment processing</p>
        </div>
        <router-link
          to="/treasurer/penalty-approvals"
          class="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          View All ({{ pendingSoasCount }}) &rarr;
        </router-link>
      </div>

      <div v-if="loadingQueue" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-6 w-6 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Loading approval queue...
      </div>

      <div v-else-if="pendingSoas.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-10 h-10 mx-auto text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-semibold text-gray-700">No Pending Approvals</p>
        <p class="text-xs text-gray-500 mt-0.5">All Statements of Account with penalties have been reviewed.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <th class="py-3 px-4">SOA #</th>
              <th class="py-3 px-4">Tax Declaration</th>
              <th class="py-3 px-4">Owner Name</th>
              <th class="py-3 px-4 text-right">Principal</th>
              <th class="py-3 px-4 text-right">Penalty</th>
              <th class="py-3 px-4 text-right">Total Due</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in pendingSoas.slice(0, 5)" :key="s.id" class="hover:bg-amber-50/30 transition">
              <td class="py-3 px-4 font-mono font-semibold text-amber-700">{{ s.soa_no }}</td>
              <td class="py-3 px-4 font-medium text-gray-900">{{ s.td_number }}</td>
              <td class="py-3 px-4 text-gray-700">{{ s.owner_name }}</td>
              <td class="py-3 px-4 text-right font-medium text-gray-800">₱{{ formatCurrency(s.total_principal) }}</td>
              <td class="py-3 px-4 text-right font-semibold text-amber-600">₱{{ formatCurrency(s.total_penalty) }}</td>
              <td class="py-3 px-4 text-right font-bold text-gray-900">₱{{ formatCurrency(s.total_amount_due) }}</td>
              <td class="py-3 px-4 text-center">
                <router-link
                  to="/treasurer/penalty-approvals"
                  class="px-3 py-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition"
                >
                  Review
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchSoas,
  fetchCorrectionRequests,
  fetchDailyReport,
  fetchAnnualReport,
  type StatementOfAccountData,
} from '@/services/billingApi'

const currentYear = new Date().getFullYear()
const todayStr = new Date().toISOString().split('T')[0]

const pendingSoasCount = ref(0)
const pendingCorrectionsCount = ref(0)
const pendingSoas = ref<StatementOfAccountData[]>([])
const loadingQueue = ref(false)

const dailySummary = ref({
  total_collected: 0,
  total_transactions: 0,
})

const annualSummary = ref({
  total_collected: 0,
})

const loadDashboardData = async () => {
  loadingQueue.value = true
  try {
    const [soasRes, corrRes, dailyRes, annualRes] = await Promise.all([
      fetchSoas({ status: 'PendingApproval' }),
      fetchCorrectionRequests({ status: 'Pending' }),
      fetchDailyReport(todayStr),
      fetchAnnualReport(currentYear),
    ])

    pendingSoas.value = soasRes.data
    pendingSoasCount.value = soasRes.total
    pendingCorrectionsCount.value = corrRes.total

    dailySummary.value = {
      total_collected: dailyRes?.summary?.total_collected ?? dailyRes?.total_collected ?? 0,
      total_transactions: dailyRes?.summary?.total_transactions ?? dailyRes?.total_transactions ?? 0,
    }

    annualSummary.value = {
      total_collected: annualRes?.summary?.total_collected ?? annualRes?.annual_total ?? annualRes?.total_collected ?? 0,
    }
  } catch (err) {
    console.error('Failed to load treasurer dashboard data:', err)
  } finally {
    loadingQueue.value = false
  }
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(() => {
  loadDashboardData()
})
</script>
