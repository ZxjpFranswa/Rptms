<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Payment Cancellation & Correction Audit</h2>
        <p class="text-gray-600 mt-1">Review cashier void requests, audit reversal reasons, and approve cancellation of Official Receipts</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
          {{ pendingCount }} Pending Requests
        </span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="selectedStatus = tab.value; loadRequests()"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            selectedStatus === tab.value
              ? 'bg-primary-50 text-primary-700 font-semibold border border-primary-200'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Loading cancellation requests...
      </div>

      <div v-else-if="requests.length === 0" class="p-12 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Payment Correction Requests Found</p>
        <p class="text-sm text-gray-500 mt-1">There are no correction requests matching the selected filter.</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="req in requests"
          :key="req.id"
          class="p-5 hover:bg-gray-50/70 transition space-y-4"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-base text-primary-800">
                  OR # {{ req.payment?.or_number || 'N/A' }}
                </span>
                <span
                  :class="[
                    'px-2.5 py-0.5 text-xs font-semibold rounded-full',
                    getStatusBadgeClass(req.status)
                  ]"
                >
                  {{ req.status }}
                </span>
                <span class="text-xs text-gray-500">
                  Requested: {{ formatDate(req.created_at) }}
                </span>
              </div>

              <p class="text-sm font-semibold text-gray-900 mt-1">
                Payor: {{ req.payment?.payor_name || 'N/A' }}
                <span class="text-gray-500 font-normal">
                  &bull; TD No: {{ req.payment?.tax_declaration?.td_number || 'N/A' }} ({{ req.payment?.tax_declaration?.barangay || '' }})
                </span>
              </p>

              <p class="text-xs text-gray-600 mt-0.5">
                Cashier: <strong>{{ req.requester?.full_name || 'Cashier' }}</strong>
                &bull; Payment Method: {{ req.payment?.payment_method || 'Cash' }}
              </p>
            </div>

            <!-- Amount Box -->
            <div class="text-right bg-red-50/60 border border-red-200 rounded-xl px-4 py-2 flex-shrink-0">
              <span class="text-xs text-red-600 uppercase font-semibold">Payment Amount to Void</span>
              <p class="text-xl font-bold text-red-700">₱{{ formatCurrency(req.payment?.amount_paid) }}</p>
            </div>
          </div>

          <!-- Reason for Cancellation -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
            <span class="font-semibold text-gray-800">Cashier's Justification / Reason:</span>
            <p class="text-gray-700 italic">"{{ req.reason }}"</p>
          </div>

          <!-- Treasurer Remarks if Reviewed -->
          <div v-if="req.review_remarks" class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1 text-blue-900">
            <span class="font-semibold">Treasurer Review Remarks:</span>
            <p class="italic">"{{ req.review_remarks }}"</p>
            <span class="text-[11px] text-blue-600 block">Reviewed by: {{ req.reviewer?.full_name || 'Municipal Treasurer' }}</span>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              v-if="req.payment"
              @click="viewReceipt(req.payment)"
              class="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              View Official Receipt &rarr;
            </button>

            <div v-if="req.status === 'Pending'" class="flex items-center gap-2">
              <button
                @click="openReviewModal(req, false)"
                class="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Deny Cancellation
              </button>
              <button
                @click="openReviewModal(req, true)"
                class="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
              >
                Approve & Void Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div
      v-if="showModal && selectedRequest"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div
          :class="[
            'px-6 py-4 flex items-center justify-between text-white',
            isApproving ? 'bg-red-600' : 'bg-gray-800'
          ]"
        >
          <h3 class="text-base font-bold">
            {{ isApproving ? 'Confirm Payment Cancellation' : 'Deny Cancellation Request' }}
          </h3>
          <button @click="showModal = false" class="text-gray-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleReview" class="p-6 space-y-4">
          <div v-if="isApproving" class="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
            <p class="font-bold">Important Audit Notice:</p>
            <p>
              Approving this will permanently mark Official Receipt
              <strong>{{ selectedRequest.payment?.or_number }}</strong> as <strong>Cancelled</strong>.
              All principal and penalty amounts applied will be reversed back to the taxpayer's account.
            </p>
          </div>

          <div v-else class="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3">
            The payment will remain valid and active. The cashier will be notified that the cancellation request was denied.
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ isApproving ? 'Audit Remarks (Optional)' : 'Reason for Denial *' }}
            </label>
            <textarea
              v-model="reviewRemarks"
              :required="!isApproving"
              rows="3"
              placeholder="Enter your administrative review remarks..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting || (!isApproving && !reviewRemarks.trim())"
              :class="[
                'px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition disabled:opacity-50',
                isApproving ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-900'
              ]"
            >
              {{ submitting ? 'Processing...' : (isApproving ? 'Authorize Void' : 'Confirm Denial') }}
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
import { ref, onMounted } from 'vue'
import {
  fetchCorrectionRequests,
  reviewCorrectionApi,
  type PaymentCorrectionRequestData,
  type PaymentData,
} from '@/services/billingApi'
import OfficialReceiptModal from '@/components/billing/OfficialReceiptModal.vue'

const requests = ref<PaymentCorrectionRequestData[]>([])
const loading = ref(false)
const submitting = ref(false)
const pendingCount = ref(0)
const selectedStatus = ref('Pending')

const filterTabs = [
  { label: 'Pending Requests', value: 'Pending' },
  { label: 'Approved (Voided)', value: 'Approved' },
  { label: 'Denied Requests', value: 'Denied' },
  { label: 'All Requests', value: '' },
]

// Modal
const showModal = ref(false)
const selectedRequest = ref<PaymentCorrectionRequestData | null>(null)
const isApproving = ref(true)
const reviewRemarks = ref('')

// Receipt Modal
const showReceiptModal = ref(false)
const viewingPayment = ref<PaymentData | null>(null)
const viewingPaymentId = ref('')

const loadRequests = async () => {
  loading.value = true
  try {
    const res = await fetchCorrectionRequests({
      status: selectedStatus.value || undefined,
    })
    requests.value = res.data

    if (selectedStatus.value === 'Pending') {
      pendingCount.value = res.total
    } else {
      const pRes = await fetchCorrectionRequests({ status: 'Pending' })
      pendingCount.value = pRes.total
    }
  } catch (err) {
    console.error('Failed to load corrections:', err)
  } finally {
    loading.value = false
  }
}

const openReviewModal = (req: PaymentCorrectionRequestData, approve: boolean) => {
  selectedRequest.value = req
  isApproving.value = approve
  reviewRemarks.value = ''
  showModal.value = true
}

const handleReview = async () => {
  if (!selectedRequest.value) return
  submitting.value = true
  try {
    await reviewCorrectionApi(
      selectedRequest.value.id,
      isApproving.value,
      reviewRemarks.value || undefined,
    )
    showModal.value = false
    await loadRequests()
    alert(isApproving.value ? 'Payment has been successfully voided and balances reversed.' : 'Request has been denied.')
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to review correction request')
  } finally {
    submitting.value = false
  }
}

const viewReceipt = (payment: PaymentData) => {
  viewingPayment.value = payment
  viewingPaymentId.value = payment.id
  showReceiptModal.value = true
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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-amber-100 text-amber-800'
    case 'Approved': return 'bg-red-100 text-red-800'
    case 'Denied': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-700'
  }
}

onMounted(() => {
  loadRequests()
})
</script>
