<template>
  <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
      <!-- Modal Header (Non-printable) -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            OR
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Official Receipt</h3>
            <p class="text-xs text-gray-500">
              Document No: {{ receipt?.or_number || (loading ? 'Loading...' : 'N/A') }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="printReceipt"
            :disabled="loading || !receipt"
            class="px-3.5 py-1.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
          <button
            @click="$emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-16 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-sm font-semibold text-gray-700">Loading Official Receipt Details...</p>
        <p class="text-xs text-gray-400 mt-1">Please wait while the document records are retrieved.</p>
      </div>

      <!-- Error / Empty State -->
      <div v-else-if="!receipt" class="p-16 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Receipt Information Available</p>
        <p class="text-xs text-gray-500 mt-1">The requested receipt could not be loaded.</p>
      </div>

      <!-- Printable Document Body -->
      <div v-else id="receipt-printable-area" class="p-8 overflow-y-auto flex-1 text-gray-800 text-sm bg-white">
        <!-- LGU Official Header -->
        <div class="text-center pb-4 border-b-2 border-gray-900 space-y-0.5">
          <p class="text-xs uppercase tracking-widest text-gray-600 font-semibold">Republic of the Philippines</p>
          <p class="text-xs font-medium text-gray-700">Province of Camarines Sur</p>
          <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide">Municipality of Magarao</h2>
          <p class="text-xs font-semibold text-primary-800">OFFICE OF THE MUNICIPAL TREASURER</p>
          <div class="pt-2">
            <span class="inline-block px-3 py-1 bg-gray-100 border border-gray-300 font-bold text-xs uppercase tracking-wider">
              OFFICIAL RECEIPT (REAL PROPERTY TAX)
            </span>
          </div>
        </div>

        <!-- Meta info grid -->
        <div class="grid grid-cols-2 gap-4 py-4 border-b border-gray-200 text-xs">
          <div>
            <p>
              <span class="text-gray-500 font-medium">Payor / Owner:</span>
              <strong class="text-gray-900 text-sm ml-1">{{ receipt.payor_name || 'N/A' }}</strong>
            </p>
            <p class="mt-1">
              <span class="text-gray-500 font-medium">Barangay:</span>
              <span class="font-semibold text-gray-800 ml-1">{{ receipt.barangay || 'N/A' }}</span>
            </p>
            <p class="mt-1">
              <span class="text-gray-500 font-medium">Tax Declaration:</span>
              <span class="font-mono font-semibold text-primary-800 ml-1">{{ tdNumber }}</span>
            </p>
          </div>
          <div class="text-right">
            <p>
              <span class="text-gray-500 font-medium">Official Receipt No:</span>
              <strong class="font-mono text-primary-800 text-base ml-1">{{ receipt.or_number }}</strong>
            </p>
            <p class="mt-1">
              <span class="text-gray-500 font-medium">Date & Time:</span>
              <span class="font-semibold text-gray-800 ml-1">{{ formatDate(receipt.payment_date) }}</span>
            </p>
            <p class="mt-1">
              <span class="text-gray-500 font-medium">Payment Mode:</span>
              <span class="font-semibold uppercase text-gray-800 ml-1">{{ receipt.payment_method || 'Cash' }}</span>
              <span v-if="receipt.reference_no" class="text-gray-500 font-mono text-[11px] ml-1">({{ receipt.reference_no }})</span>
            </p>
          </div>
        </div>

        <!-- Allocation Breakdown Table -->
        <div class="py-4">
          <p class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Payment Breakdown by Period</p>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-100 text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-300">
                <tr>
                  <th class="p-2">Period</th>
                  <th class="p-2 text-right">Basic Tax</th>
                  <th class="p-2 text-right">SEF</th>
                  <th class="p-2 text-right">Penalty</th>
                  <th class="p-2 text-right">Discount</th>
                  <th class="p-2 text-right">Net Paid</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 font-mono text-xs">
                <tr v-for="alloc in (receipt.allocations || [])" :key="alloc.id || `${alloc.taxable_year}-${alloc.quarter}`" class="hover:bg-gray-50">
                  <td class="p-2 font-sans font-medium text-gray-800">
                    {{ alloc.taxable_year }} Q{{ alloc.quarter }}
                    <span v-if="alloc.discount_type" class="text-[10px] text-blue-600 block font-normal">({{ alloc.discount_type }})</span>
                  </td>
                  <td class="p-2 text-right">{{ formatPeso(alloc.basic_amount) }}</td>
                  <td class="p-2 text-right">{{ formatPeso(alloc.sef_amount) }}</td>
                  <td class="p-2 text-right text-red-600">{{ formatPeso(alloc.penalty_amount) }}</td>
                  <td class="p-2 text-right text-emerald-600">
                    {{ Number(alloc.discount_amount || 0) > 0 ? `-${formatPeso(alloc.discount_amount)}` : '0.00' }}
                  </td>
                  <td class="p-2 text-right font-bold text-gray-900">{{ formatPeso(alloc.total_amount) }}</td>
                </tr>
                <tr v-if="!receipt.allocations || receipt.allocations.length === 0">
                  <td colspan="6" class="p-3 text-center text-gray-500 font-sans">
                    Single transaction remittance: {{ receipt.remarks || 'Direct collection payment' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals & Cashier Summary -->
        <div class="grid grid-cols-2 gap-4 pt-2 pb-6 border-b border-gray-200">
          <div class="text-xs text-gray-500 space-y-1">
            <p v-if="receipt.remarks"><strong class="text-gray-700">Remarks:</strong> {{ receipt.remarks }}</p>
            <p v-if="receipt.status === 'Cancelled'" class="text-red-600 font-bold uppercase tracking-wider">
              *** VOID / CANCELLED PAYMENT ***
              <span class="block font-normal text-xs text-gray-700">Reason: {{ receipt.cancellation_reason }}</span>
            </p>
            <p class="pt-2 text-[11px] text-gray-400 italic">
              This serves as an official electronic receipt under the Real Property Tax Administration rules of Magarao, Camarines Sur.
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between text-gray-600">
              <span>Gross Due:</span>
              <span class="font-mono">{{ formatPeso(receipt.amount_due) }}</span>
            </div>
            <div class="flex justify-between text-emerald-700 font-medium" v-if="Number(receipt.discount_amount || 0) > 0">
              <span>Total Discounts Granted:</span>
              <span class="font-mono">-{{ formatPeso(receipt.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-300">
              <span>Amount Paid:</span>
              <span class="font-mono text-primary-800">PHP {{ formatPeso(receipt.amount_paid) }}</span>
            </div>
            <div class="flex justify-between text-gray-600 pt-1 text-[11px]">
              <span>Amount Tendered:</span>
              <span class="font-mono">{{ formatPeso(receipt.amount_tendered) }}</span>
            </div>
            <div class="flex justify-between text-gray-600 text-[11px]">
              <span>Change:</span>
              <span class="font-mono">{{ formatPeso(receipt.change_amount) }}</span>
            </div>
            <div class="flex justify-between text-gray-700 font-semibold pt-1 border-t border-gray-200 text-xs">
              <span>Remaining Balance:</span>
              <span class="font-mono text-amber-700">PHP {{ formatPeso(receipt.balance_after) }}</span>
            </div>
          </div>
        </div>

        <!-- Signatures footer -->
        <div class="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div class="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
              {{ receipt.payor_name || 'Taxpayer' }}
            </div>
            <p class="text-[11px] text-gray-500 uppercase">Taxpayer / Payor</p>
          </div>
          <div>
            <div class="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
              {{ cashierName }}
            </div>
            <p class="text-[11px] text-gray-500 uppercase">Collecting Officer / Cashier</p>
          </div>
        </div>
      </div>

      <!-- Modal Footer (Non-printable) -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 print:hidden">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Close
        </button>
        <button
          @click="printReceipt"
          :disabled="loading || !receipt"
          class="px-4 py-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Receipt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchReceiptDetail, type PaymentData } from '@/services/billingApi'

const props = withDefaults(
  defineProps<{
    visible: boolean
    receipt?: PaymentData | null
    paymentId?: string | null
  }>(),
  {
    receipt: null,
    paymentId: null,
  }
)

defineEmits<{
  close: []
}>()

const loading = ref(false)
const fetchedReceipt = ref<PaymentData | null>(null)
const receipt = computed(() => props.receipt || fetchedReceipt.value)

const tdNumber = computed(() => {
  const r = receipt.value as any
  if (!r) return 'N/A'
  return (
    r.td_number ||
    r.tax_declaration?.td_number ||
    r.taxDeclaration?.td_number ||
    r.statement_of_account?.td_number ||
    r.statementOfAccount?.td_number ||
    'N/A'
  )
})

const cashierName = computed(() => {
  const r = receipt.value as any
  if (!r) return 'Authorized Collecting Officer'
  return r.cashier?.full_name || r.cashier?.fullName || r.cashier_name || 'Authorized Collecting Officer'
})

watch(
  () => [props.visible, props.paymentId, props.receipt],
  async () => {
    if (!props.visible) {
      fetchedReceipt.value = null
      return
    }

    const current = props.receipt
    const pId = props.paymentId || current?.id

    // If we already have full receipt object with allocations loaded
    if (current && Array.isArray(current.allocations) && current.allocations.length > 0) {
      fetchedReceipt.value = null
      loading.value = false
      return
    }

    // If ID is available, fetch full relations
    if (pId) {
      loading.value = true
      try {
        fetchedReceipt.value = await fetchReceiptDetail(pId)
      } catch (e) {
        console.error('Failed to fetch receipt detail:', e)
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true }
)

const formatPeso = (val?: number | string | null) => {
  if (val === undefined || val === null || val === '') return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Reliable isolated iframe printing.
 * Completely immune to modal overflow/fixed clipping issues in Chromium.
 */
const printReceipt = () => {
  const printableArea = document.getElementById('receipt-printable-area')
  if (!printableArea) return

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Official Receipt - ${receipt.value?.or_number || ''}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 20mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1f2937;
            background: #ffffff;
            font-size: 13px;
            line-height: 1.45;
            padding: 10px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .uppercase { text-transform: uppercase; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .text-xs { font-size: 12px; }
          .text-sm { font-size: 13px; }
          .text-base { font-size: 15px; }
          .text-lg { font-size: 18px; }
          .border-b-2 { border-bottom: 2px solid #111827; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .border { border: 1px solid #d1d5db; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-4 { gap: 16px; }
          .gap-8 { gap: 32px; }
          .py-4 { padding-top: 16px; padding-bottom: 16px; }
          .pb-4 { padding-bottom: 16px; }
          .pb-6 { padding-bottom: 24px; }
          .pt-2 { padding-top: 8px; }
          .pt-6 { padding-top: 24px; }
          .mt-1 { margin-top: 4px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
          th, td { padding: 6px 10px; font-size: 12px; }
          th { background: #f3f4f6; border-bottom: 1px solid #9ca3af; text-transform: uppercase; font-weight: 600; }
          td { border-bottom: 1px solid #e5e7eb; }
          .bg-gray-50 { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .rounded-xl { border-radius: 8px; }
          .rounded-lg { border-radius: 6px; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .text-primary-800 { color: #065f46; }
          .text-emerald-700 { color: #047857; }
          .text-emerald-600 { color: #059669; }
          .text-amber-700 { color: #b45309; }
          .text-red-600 { color: #dc2626; }
          .text-gray-400 { color: #9ca3af; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-900 { color: #111827; }
          .italic { font-style: italic; }
        </style>
      </head>
      <body>
        ${printableArea.innerHTML}
      </body>
    </html>
  `)
  doc.close()

  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }, 1500)
  }, 350)
}
</script>
