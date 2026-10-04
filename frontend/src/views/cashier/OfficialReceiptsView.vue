<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Official Receipts (OR) Register</h2>
        <p class="text-gray-600 mt-1">Audit issued tax payment receipts, reprint OR documents, and submit void/correction requests</p>
      </div>
      <router-link
        to="/cashier/desk"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Payment Collection
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Search OR # or Payor</label>
        <input
          v-model="searchQuery"
          @input="debounceSearch"
          type="text"
          placeholder="OR-2026-..., Name, or TD..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Filter by Status</label>
        <select
          v-model="filterStatus"
          @change="loadReceipts"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Posted">Posted (Valid)</option>
          <option value="Cancelled">Cancelled (Voided)</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Barangay</label>
        <select
          v-model="filterBarangay"
          @change="loadReceipts"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Barangays</option>
          <option v-for="b in barangays" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>
      <div>
        <button
          @click="resetFilters"
          class="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Receipts Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Loading Official Receipts...
      </div>

      <div v-else-if="receipts.length === 0" class="p-12 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Receipts Found</p>
        <p class="text-sm text-gray-500 mt-1">Try adjusting your search criteria or issue a new receipt.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">OR Number</th>
              <th class="py-3 px-4">Payor Name</th>
              <th class="py-3 px-4">TD Number</th>
              <th class="py-3 px-4">Barangay</th>
              <th class="py-3 px-4">Method</th>
              <th class="py-3 px-4 text-right">Discount</th>
              <th class="py-3 px-4 text-right">Amount Paid</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="r in filteredReceipts"
              :key="r.id"
              class="hover:bg-gray-50/80 transition"
            >
              <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ formatDate(r.payment_date) }}</td>
              <td class="py-3 px-4 font-mono font-bold text-primary-700 whitespace-nowrap">{{ r.or_number }}</td>
              <td class="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">{{ r.payor_name }}</td>
              <td class="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">{{ r.tax_declaration?.td_number || (r as any).td_number || '-' }}</td>
              <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ r.barangay }}</td>
              <td class="py-3 px-4 text-gray-600 whitespace-nowrap">{{ r.payment_method }}</td>
              <td class="py-3 px-4 text-right text-blue-700 font-medium whitespace-nowrap">₱{{ formatCurrency(r.discount_amount) }}</td>
              <td class="py-3 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">₱{{ formatCurrency(r.amount_paid) }}</td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                    r.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ r.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="viewReceipt(r)"
                    class="px-2.5 py-1 text-[11px] font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded transition"
                  >
                    View / Print
                  </button>
                  <button
                    v-if="r.status === 'Posted'"
                    @click="openCorrectionModal(r)"
                    class="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded transition"
                    title="Request Treasurer authorization to void this receipt"
                  >
                    Request Void
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Request Correction Modal -->
    <div
      v-if="showCorrectionModal && selectedReceipt"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div class="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 class="text-base font-bold">Request Receipt Cancellation / Void</h3>
          <button @click="showCorrectionModal = false" class="text-red-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleRequestCorrection" class="p-6 space-y-4">
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-500">OR Number:</span>
              <strong class="font-mono text-gray-900">{{ selectedReceipt.or_number }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Payor:</span>
              <strong class="text-gray-900">{{ selectedReceipt.payor_name }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Amount Paid:</span>
              <strong class="text-red-700 font-mono">₱{{ formatCurrency(selectedReceipt.amount_paid) }}</strong>
            </div>
          </div>

          <p class="text-xs text-gray-600">
            Per audit rules, cashiers cannot directly delete receipts. Submitting this request sends a formal cancellation request to the <strong>Municipal Treasurer</strong> for authorization.
          </p>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Reason for Cancellation *</label>
            <textarea
              v-model="correctionReason"
              required
              rows="3"
              placeholder="e.g. Erroneous tender entered; taxpayer check bounced; duplicate payment..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showCorrectionModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting || !correctionReason.trim()"
              class="px-5 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 font-bold rounded-lg shadow-sm transition"
            >
              {{ submitting ? 'Submitting...' : 'Submit Request to Treasurer' }}
            </button>
          </div>
        </form>
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
import { ref, computed, onMounted } from 'vue'
import {
  fetchReceiptRegister,
  requestPaymentCorrectionApi,
  type PaymentData,
} from '@/services/billingApi'
import OfficialReceiptModal from '@/components/billing/OfficialReceiptModal.vue'

const receipts = ref<PaymentData[]>([])
const loading = ref(false)
const submitting = ref(false)

const searchQuery = ref('')
const filterStatus = ref('')
const filterBarangay = ref('')

const barangays = [
  'Barangay Poblacion',
  'Barangay San Juan',
  'Barangay Santa Maria',
  'Barangay San Pedro',
  'Barangay San Isidro',
]

// Modal
const showReceiptModal = ref(false)
const viewingPayment = ref<PaymentData | null>(null)
const viewingPaymentId = ref('')
const showCorrectionModal = ref(false)
const selectedReceipt = ref<PaymentData | null>(null)
const correctionReason = ref('')

const loadReceipts = async () => {
  loading.value = true
  try {
    const res = await fetchReceiptRegister({
      status: filterStatus.value || undefined,
      barangay: filterBarangay.value || undefined,
    })
    receipts.value = res.receipts || []
  } catch (err) {
    console.error('Failed to load receipts:', err)
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    // client search filter applied in computed
  }, 200)
}

const filteredReceipts = computed(() => {
  if (!searchQuery.value.trim()) return receipts.value
  const q = searchQuery.value.toLowerCase()
  return receipts.value.filter(
    r =>
      r.or_number.toLowerCase().includes(q) ||
      r.payor_name.toLowerCase().includes(q) ||
      r.tax_declaration?.td_number?.toLowerCase().includes(q) ||
      (r as any).td_number?.toLowerCase().includes(q)
  )
})

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterBarangay.value = ''
  loadReceipts()
}

const viewReceipt = (payment: PaymentData) => {
  viewingPayment.value = payment
  viewingPaymentId.value = payment.id
  showReceiptModal.value = true
}

const openCorrectionModal = (r: PaymentData) => {
  selectedReceipt.value = r
  correctionReason.value = ''
  showCorrectionModal.value = true
}

const handleRequestCorrection = async () => {
  if (!selectedReceipt.value || !correctionReason.value.trim()) return
  submitting.value = true
  try {
    await requestPaymentCorrectionApi(selectedReceipt.value.id, correctionReason.value.trim())
    showCorrectionModal.value = false
    alert('Cancellation request submitted to the Municipal Treasurer for review and approval.')
    await loadReceipts()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to submit correction request')
  } finally {
    submitting.value = false
  }
}

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  loadReceipts()
})
</script>
