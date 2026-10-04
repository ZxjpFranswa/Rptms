<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Cashier Collection Terminal</h2>
        <p class="text-gray-600 mt-1">Receive tax payments, apply discounts, issue official receipts, and manage transactions</p>
      </div>
      <router-link
        to="/cashier/desk"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Open Payment Collection Desk
      </router-link>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <p class="text-xs text-gray-500 mt-1">Cash: ₱{{ formatCurrency(dailySummary.cash_total) }} | Check: ₱{{ formatCurrency(dailySummary.check_total) }}</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipts Issued</span>
          <span class="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ dailySummary.total_transactions }}</p>
        <p class="text-xs text-gray-500 mt-1">Today's sequential OR count</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Discounts Applied</span>
          <span class="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-purple-700 mt-2">₱{{ formatCurrency(dailySummary.total_discount) }}</p>
        <p class="text-xs text-gray-500 mt-1">20% advance & 10% prompt</p>
      </div>

      <router-link
        to="/cashier/receipts"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-400 transition"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correction Requests</span>
          <span class="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        </div>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ pendingCorrectionCount }}</p>
        <p class="text-xs text-gray-500 mt-1">Pending Treasurer review</p>
      </router-link>
    </div>

    <!-- Recent Transactions Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-gray-900">Today's Issued Official Receipts</h3>
          <p class="text-xs text-gray-500">Latest payments collected at this station</p>
        </div>
        <router-link
          to="/cashier/receipts"
          class="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          View Full OR Register &rarr;
        </router-link>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-6 w-6 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Loading recent receipts...
      </div>

      <div v-else-if="recentPayments.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-sm font-semibold text-gray-700">No Receipts Issued Today Yet</p>
        <p class="text-xs text-gray-500 mt-1">Click "Open Payment Collection Desk" above to receive payments.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
              <th class="py-2.5 px-4">OR Number</th>
              <th class="py-2.5 px-4">Payor Name</th>
              <th class="py-2.5 px-4">TD Number</th>
              <th class="py-2.5 px-4">Method</th>
              <th class="py-2.5 px-4 text-right">Discount</th>
              <th class="py-2.5 px-4 text-right">Amount Paid</th>
              <th class="py-2.5 px-4 text-center">Status</th>
              <th class="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in recentPayments" :key="p.id" class="hover:bg-gray-50">
              <td class="py-2.5 px-4 font-mono font-bold text-primary-700">{{ p.or_number }}</td>
              <td class="py-2.5 px-4 font-semibold text-gray-900">{{ p.payor_name }}</td>
              <td class="py-2.5 px-4 font-mono text-gray-600">{{ p.tax_declaration?.td_number || (p as any).td_number || '-' }}</td>
              <td class="py-2.5 px-4 text-gray-600">{{ p.payment_method }}</td>
              <td class="py-2.5 px-4 text-right text-blue-700">₱{{ formatCurrency(p.discount_amount) }}</td>
              <td class="py-2.5 px-4 text-right font-bold text-emerald-700">₱{{ formatCurrency(p.amount_paid) }}</td>
              <td class="py-2.5 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[11px] font-semibold',
                    p.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ p.status }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-center">
                <button
                  @click="openReceiptModal(p)"
                  class="px-2.5 py-1 text-[11px] font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded transition"
                >
                  View / Print OR
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Official Receipt Modal -->
    <OfficialReceiptModal
      :visible="showReceiptModal"
      :receipt="viewingPayment"
      :payment-id="viewingPaymentId"
      @close="showReceiptModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchDailyReport,
  fetchCorrectionRequests,
  type PaymentData,
} from '@/services/billingApi'
import OfficialReceiptModal from '@/components/billing/OfficialReceiptModal.vue'

const todayStr = new Date().toISOString().split('T')[0]
const loading = ref(false)

const dailySummary = ref({
  total_collected: 0,
  total_transactions: 0,
  cash_total: 0,
  check_total: 0,
  total_discount: 0,
})

const pendingCorrectionCount = ref(0)
const recentPayments = ref<PaymentData[]>([])

// Receipt Modal
const showReceiptModal = ref(false)
const viewingPayment = ref<PaymentData | null>(null)
const viewingPaymentId = ref('')

const loadDashboard = async () => {
  loading.value = true
  try {
    const [dailyRes, corrRes] = await Promise.all([
      fetchDailyReport(todayStr),
      fetchCorrectionRequests({ status: 'Pending' }),
    ])

    dailySummary.value = {
      total_collected: dailyRes?.summary?.total_collected ?? dailyRes?.total_collected ?? 0,
      total_transactions: dailyRes?.summary?.total_transactions ?? dailyRes?.total_transactions ?? 0,
      cash_total: dailyRes?.summary?.cash_total ?? dailyRes?.cash_total ?? 0,
      check_total: dailyRes?.summary?.check_total ?? dailyRes?.check_total ?? 0,
      total_discount: dailyRes?.summary?.total_discount ?? dailyRes?.total_discount ?? 0,
    }

    recentPayments.value = dailyRes?.transactions || dailyRes?.payments || []
    pendingCorrectionCount.value = corrRes?.total || 0
  } catch (err) {
    console.error('Failed to load cashier dashboard:', err)
  } finally {
    loading.value = false
  }
}

const openReceiptModal = (p: PaymentData) => {
  viewingPayment.value = p
  viewingPaymentId.value = p.id
  showReceiptModal.value = true
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(() => {
  loadDashboard()
})
</script>
