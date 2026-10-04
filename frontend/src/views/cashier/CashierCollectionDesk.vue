<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Payment Collection Desk</h2>
        <p class="text-gray-600 mt-1">Search taxpayer accounts, verify active SOAs, calculate prompt/advance discounts, and issue Official Receipts</p>
      </div>
      <div class="flex items-center gap-3">
        <router-link
          to="/cashier/receipts"
          class="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
        >
          View OR Register
        </router-link>
      </div>
    </div>

    <!-- Step 1: Search Taxpayer / Property -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
      <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">1</span>
        Search Property / Tax Declaration / SOA Number
      </h3>

      <div class="relative">
        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search by TD Number (e.g. 2026-001-00001), Owner Name, or PIN..."
          class="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        <div v-if="searching" class="absolute right-4 top-3.5">
          <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
      </div>

      <!-- Search Results Dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="border border-gray-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-100 bg-white shadow-lg"
      >
        <div
          v-for="res in searchResults"
          :key="res.tax_declaration_id"
          @click="selectProperty(res)"
          class="p-3 hover:bg-primary-50 cursor-pointer transition flex items-center justify-between"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-primary-800 text-sm">{{ res.td_number }}</span>
              <span class="font-semibold text-gray-900 text-sm">&bull; {{ res.owner_name }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              Brgy. {{ res.barangay }} | Assessed Value: ₱{{ formatCurrency(res.total_assessed_value) }}
              <span v-if="res.pin" class="font-mono ml-1 text-gray-400">| PIN: {{ res.pin }}</span>
            </p>
          </div>
          <div class="text-right">
            <span class="block text-xs font-semibold" :class="res.outstanding_principal > 0 ? 'text-amber-700' : 'text-emerald-700'">
              {{ res.outstanding_principal > 0 ? `Bal: ₱${formatCurrency(res.outstanding_principal)}` : 'Fully Paid' }}
            </span>
            <span
              v-if="res.active_soa"
              class="inline-block mt-0.5 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded"
            >
              Active SOA: {{ res.active_soa.soa_no }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Selected Property & Statement of Account Details -->
    <div v-if="selectedProperty" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">2</span>
          Account Dues & Active Statement
        </h3>
        <button
          @click="clearSelectedProperty"
          class="text-xs text-gray-500 hover:text-red-600 font-medium"
        >
          Change Property
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
        <div>
          <span class="text-gray-500 block">Tax Declaration No.</span>
          <strong class="text-gray-900 font-mono text-sm">{{ selectedProperty.td_number }}</strong>
        </div>
        <div>
          <span class="text-gray-500 block">Property Owner</span>
          <strong class="text-gray-900 text-sm">{{ selectedProperty.owner_name }}</strong>
        </div>
        <div>
          <span class="text-gray-500 block">Barangay</span>
          <strong class="text-gray-900">{{ selectedProperty.barangay }}</strong>
        </div>
        <div>
          <span class="text-gray-500 block">Total Assessed Value</span>
          <strong class="text-gray-900">₱{{ formatCurrency(selectedProperty.total_assessed_value) }}</strong>
        </div>
      </div>

      <!-- Active Statement Info -->
      <div v-if="activeSoa" class="bg-primary-50/70 border border-primary-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-primary-900 text-sm">Active Statement: {{ activeSoa.soa_no }}</span>
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
              {{ activeSoa.status }}
            </span>
          </div>
          <p class="text-xs text-primary-700 mt-1">
            As-of: {{ formatDate(activeSoa.as_of_date) }} | Valid until: {{ formatDate(activeSoa.valid_until) }}
          </p>
        </div>

        <div class="flex items-center gap-4 text-right">
          <div>
            <span class="text-xs text-gray-500 block">Total Amount Due</span>
            <span class="text-xl font-bold text-primary-900">₱{{ formatCurrency(activeSoa.total_amount_due) }}</span>
          </div>
          <button
            @click="showSoaDocument = true"
            class="px-3 py-1.5 text-xs font-semibold text-primary-700 bg-white border border-primary-300 hover:bg-primary-50 rounded-lg shadow-sm"
          >
            View SOA
          </button>
        </div>
      </div>

      <!-- No Active SOA Alert -->
      <div v-else class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-center justify-between">
        <div>
          <p class="font-bold">No Active or Approved Statement of Account Found</p>
          <p class="mt-0.5">Payments must be processed against an Issued Statement of Account. If penalties exist, it must be approved by the Treasurer.</p>
        </div>
        <button
          @click="generateQuickSoa"
          :disabled="creatingSoa"
          class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 flex-shrink-0"
        >
          {{ creatingSoa ? 'Generating...' : 'Generate SOA Now' }}
        </button>
      </div>
    </div>

    <!-- Step 3: Payment Entry & Real-time Allocation Preview -->
    <div v-if="selectedProperty && activeSoa" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Payment Details Form (5 cols) -->
      <div class="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">3</span>
          Payment & Tender Details
        </h3>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Payor Name *</label>
          <input
            v-model="payorName"
            type="text"
            required
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Payment Date *</label>
            <input
              v-model="paymentDate"
              @change="triggerPreview"
              type="date"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Payment Method *</label>
            <select
              v-model="paymentMethod"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
            </select>
          </div>
        </div>

        <!-- Check Details if Check -->
        <div v-if="paymentMethod === 'Check'" class="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Check Number / Reference *</label>
            <input
              v-model="checkReference"
              type="text"
              placeholder="e.g. LBP-CHK-981244"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        <!-- Amount Tendered -->
        <div>
          <label class="block text-xs font-bold text-gray-800 uppercase mb-1">
            Amount Tendered (₱) *
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-gray-500 font-bold text-lg">₱</span>
            <input
              v-model.number="amountTendered"
              @input="debouncePreview"
              type="number"
              step="0.01"
              min="1"
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-2.5 text-lg font-bold font-mono text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <!-- Quick Amount Buttons -->
          <div class="flex flex-wrap gap-2 mt-2">
            <button
              v-if="previewData?.net_amount_due"
              @click="setTenderExact(previewData.net_amount_due)"
              type="button"
              class="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium"
            >
              Exact Due (₱{{ formatCurrency(previewData.net_amount_due) }})
            </button>
            <button
              v-for="amt in [500, 1000, 2000, 5000]"
              :key="amt"
              @click="setTender(amt)"
              type="button"
              class="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium"
            >
              ₱{{ amt }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Remarks (Optional)</label>
          <input
            v-model="remarks"
            type="text"
            placeholder="e.g. Prompt payment discount applied"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <!-- Process Button -->
        <button
          @click="processPayment"
          :disabled="submitting || !canProcessPayment"
          class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-base rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4"
        >
          <svg v-if="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          {{ submitting ? 'Issuing Official Receipt...' : 'Record Payment & Issue OR' }}
        </button>
      </div>

      <!-- Right Column: Live Breakdown & Statutory Allocation (7 cols) -->
      <div class="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
          <span>Live Allocation & Discount Breakdown</span>
          <span v-if="previewLoading" class="text-xs text-primary-600 font-normal">Updating preview...</span>
        </h3>

        <!-- Financial Summary Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
          <div>
            <span class="text-gray-500 block">Gross Due</span>
            <strong class="text-gray-900 text-sm">₱{{ formatCurrency(previewData?.total_gross_due || activeSoa.total_amount_due) }}</strong>
          </div>
          <div>
            <span class="text-blue-700 block font-semibold">Total Discount</span>
            <strong class="text-blue-700 text-sm">₱{{ formatCurrency(previewData?.total_discount || 0) }}</strong>
          </div>
          <div>
            <span class="text-emerald-700 block font-semibold">Net Due</span>
            <strong class="text-emerald-800 text-base font-bold">₱{{ formatCurrency(previewData?.net_amount_due || activeSoa.total_amount_due) }}</strong>
          </div>
          <div>
            <span class="text-gray-600 block">Change Given</span>
            <strong class="text-gray-900 text-base font-bold">₱{{ formatCurrency(previewData?.change_amount || 0) }}</strong>
          </div>
        </div>

        <!-- Statutory Discount Callout -->
        <div v-if="previewData && previewData.total_discount > 0" class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <div>
            <span class="font-bold">Statutory Discount Applied: ₱{{ formatCurrency(previewData.total_discount) }}</span>
            <p class="text-blue-700 mt-0.5">
              Eligible prompt/advance payment discount deducted strictly from principal tax due in compliance with Republic Act No. 7160.
            </p>
          </div>
        </div>

        <!-- Installment Allocation Table -->
        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <th class="py-2.5 px-3">Period</th>
                <th class="py-2.5 px-3 text-right">Basic Due</th>
                <th class="py-2.5 px-3 text-right">SEF Due</th>
                <th class="py-2.5 px-3 text-right">Penalty</th>
                <th class="py-2.5 px-3 text-right">Discount</th>
                <th class="py-2.5 px-3 text-right">Applied</th>
                <th class="py-2.5 px-3 text-right">Bal After</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="alloc in (previewData?.allocations || [])"
                :key="alloc.installment_id"
                class="hover:bg-gray-50"
              >
                <td class="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                  {{ alloc.taxable_year }} - Q{{ alloc.quarter }}
                  <span v-if="alloc.discount_type" class="block text-[10px] text-blue-600 font-normal">
                    {{ alloc.discount_type }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-medium">₱{{ formatCurrency(alloc.basic_balance) }}</td>
                <td class="py-2.5 px-3 text-right font-medium">₱{{ formatCurrency(alloc.sef_balance) }}</td>
                <td class="py-2.5 px-3 text-right text-amber-700">₱{{ formatCurrency(alloc.penalty_due) }}</td>
                <td class="py-2.5 px-3 text-right text-blue-700">₱{{ formatCurrency(alloc.discount_amount) }}</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-700">₱{{ formatCurrency(alloc.cash_applied) }}</td>
                <td class="py-2.5 px-3 text-right font-medium text-gray-800">
                  ₱{{ formatCurrency(alloc.remaining_principal + alloc.remaining_penalty) }}
                </td>
              </tr>
              <tr v-if="!previewData?.allocations || previewData.allocations.length === 0">
                <td colspan="7" class="py-6 text-center text-gray-500">
                  Enter an amount tendered to preview exact quarter installment allocations.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Remaining Balance After Payment -->
        <div v-if="previewData" class="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-xs font-semibold">
          <span class="text-gray-700">Account Balance After This Transaction:</span>
          <span :class="previewData.balance_after === 0 ? 'text-emerald-700' : 'text-amber-700'">
            {{ previewData.balance_after === 0 ? 'Fully Paid (₱0.00)' : `₱${formatCurrency(previewData.balance_after)} Remaining` }}
          </span>
        </div>
      </div>
    </div>

    <!-- Official Receipt Modal -->
    <OfficialReceiptModal
      :visible="showReceiptModal"
      :receipt="viewingPayment"
      :payment-id="viewingPaymentId"
      @close="onCloseReceiptModal"
    />

    <!-- SOA Document Modal -->
    <SoaDocumentModal
      v-if="activeSoa"
      :visible="showSoaDocument"
      :soa-id="activeSoa.id"
      @close="showSoaDocument = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  searchPropertiesForBilling,
  previewPaymentApi,
  recordPaymentApi,
  createSoaApi,
  fetchPropertyDues,
  type PropertySearchResult,
  type StatementOfAccountData,
  type PaymentPreviewData,
  type PaymentData,
} from '@/services/billingApi'
import OfficialReceiptModal from '@/components/billing/OfficialReceiptModal.vue'
import SoaDocumentModal from '@/components/billing/SoaDocumentModal.vue'

const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<PropertySearchResult[]>([])

const selectedProperty = ref<PropertySearchResult | null>(null)
const activeSoa = ref<StatementOfAccountData | null>(null)
const creatingSoa = ref(false)

const payorName = ref('')
const paymentDate = ref(new Date().toISOString().split('T')[0])
const paymentMethod = ref<'Cash' | 'Check'>('Cash')
const checkReference = ref('')
const remarks = ref('')
const amountTendered = ref<number | null>(null)

const previewData = ref<PaymentPreviewData | null>(null)
const previewLoading = ref(false)
const submitting = ref(false)

// Modals
const showReceiptModal = ref(false)
const viewingPayment = ref<PaymentData | null>(null)
const viewingPaymentId = ref('')
const showSoaDocument = ref(false)

const canProcessPayment = computed(() => {
  return (
    selectedProperty.value &&
    activeSoa.value &&
    activeSoa.value.status === 'Issued' &&
    payorName.value.trim().length > 0 &&
    Number(amountTendered.value || 0) > 0 &&
    (paymentMethod.value !== 'Check' || checkReference.value.trim().length > 0)
  )
})

let searchTimer: any = null
const handleSearchInput = () => {
  clearTimeout(searchTimer)
  if (!searchQuery.value.trim() || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      searchResults.value = await searchPropertiesForBilling(searchQuery.value)
    } catch (err) {
      console.error(err)
    } finally {
      searching.value = false
    }
  }, 300)
}

const selectProperty = async (prop: PropertySearchResult) => {
  selectedProperty.value = prop
  searchResults.value = []
  searchQuery.value = `${prop.td_number} - ${prop.owner_name}`
  payorName.value = prop.owner_name

  try {
    const dues = await fetchPropertyDues(prop.tax_declaration_id)
    activeSoa.value = dues.active_soa

    if (activeSoa.value) {
      amountTendered.value = activeSoa.value.total_amount_due
      await triggerPreview()
    } else {
      previewData.value = null
    }
  } catch (err) {
    console.error(err)
  }
}

const clearSelectedProperty = () => {
  selectedProperty.value = null
  activeSoa.value = null
  previewData.value = null
  searchQuery.value = ''
  amountTendered.value = null
}

const generateQuickSoa = async () => {
  if (!selectedProperty.value) return
  creatingSoa.value = true
  try {
    const created = await createSoaApi({
      tax_declaration_id: selectedProperty.value.tax_declaration_id,
      as_of_date: paymentDate.value,
    })
    activeSoa.value = created
    amountTendered.value = created.total_amount_due
    await triggerPreview()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to generate SOA')
  } finally {
    creatingSoa.value = false
  }
}

let previewTimer: any = null
const debouncePreview = () => {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(() => {
    triggerPreview()
  }, 300)
}

const setTender = (amt: number) => {
  amountTendered.value = amt
  triggerPreview()
}

const setTenderExact = (amt: number) => {
  amountTendered.value = amt
  triggerPreview()
}

const triggerPreview = async () => {
  if (!activeSoa.value || !amountTendered.value || amountTendered.value <= 0) {
    previewData.value = null
    return
  }
  previewLoading.value = true
  try {
    previewData.value = await previewPaymentApi(
      activeSoa.value.id,
      amountTendered.value,
      paymentDate.value,
    )
  } catch (err) {
    console.error('Failed to preview payment:', err)
  } finally {
    previewLoading.value = false
  }
}

const processPayment = async () => {
  if (!canProcessPayment.value || !activeSoa.value) return
  submitting.value = true
  try {
    const payment = await recordPaymentApi(activeSoa.value.id, {
      payor_name: payorName.value.trim() || undefined,
      amount_tendered: Number(amountTendered.value),
      payment_method: paymentMethod.value,
      reference_no: paymentMethod.value === 'Check' ? checkReference.value : undefined,
      remarks: remarks.value || undefined,
      payment_date: paymentDate.value,
    })

    // Immediately open Official Receipt Modal with full payment object
    viewingPayment.value = payment
    viewingPaymentId.value = payment.id
    showReceiptModal.value = true
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Payment processing failed')
  } finally {
    submitting.value = false
  }
}

const onCloseReceiptModal = () => {
  showReceiptModal.value = false
  viewingPayment.value = null
  viewingPaymentId.value = ''
  // Reset desk for next transaction
  clearSelectedProperty()
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
</script>
