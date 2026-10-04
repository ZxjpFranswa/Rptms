<template>
  <div v-if="visible" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
      <!-- Header (Non-printable) -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            SOA
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Statement of Account</h3>
            <p class="text-xs text-gray-500">
              {{ soa?.soa_no || (loading ? 'Loading...' : 'N/A') }}
              <span v-if="soa?.status"> • {{ soa.status }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="printDocument"
            :disabled="loading || !soa"
            class="px-3.5 py-1.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
            </svg>
            Print SOA
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
        <p class="text-sm font-semibold text-gray-700">Loading Statement of Account...</p>
        <p class="text-xs text-gray-400 mt-1">Please wait while the SOA records are retrieved.</p>
      </div>

      <!-- Error / Empty State -->
      <div v-else-if="!soa" class="p-16 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Statement of Account Available</p>
        <p class="text-xs text-gray-500 mt-1">The requested document could not be loaded.</p>
      </div>

      <!-- Printable SOA Content -->
      <div v-else id="soa-printable-area" class="p-8 overflow-y-auto flex-1 text-gray-800 text-sm bg-white">
        <!-- Official Header -->
        <div class="text-center pb-4 border-b-2 border-gray-900 space-y-0.5">
          <p class="text-xs uppercase tracking-widest text-gray-600 font-semibold">Republic of the Philippines</p>
          <p class="text-xs font-medium text-gray-700">Province of Camarines Sur</p>
          <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide">Municipality of Magarao</h2>
          <p class="text-xs font-semibold text-primary-800">OFFICE OF THE MUNICIPAL TREASURER</p>
          <div class="pt-2">
            <span class="inline-block px-3 py-1 bg-blue-50 border border-blue-200 font-bold text-xs uppercase tracking-wider text-blue-900">
              STATEMENT OF ACCOUNT (REAL PROPERTY TAX)
            </span>
          </div>
        </div>

        <!-- Property details -->
        <div class="grid grid-cols-2 gap-4 py-4 border-b border-gray-200 text-xs">
          <div class="space-y-1">
            <p><span class="text-gray-500 font-medium">Owner / Taxpayer:</span> <strong class="text-gray-900 text-sm ml-1">{{ soa.owner_name }}</strong></p>
            <p><span class="text-gray-500 font-medium">Barangay:</span> <span class="font-semibold ml-1">{{ soa.barangay }}</span></p>
            <p><span class="text-gray-500 font-medium">Tax Declaration No:</span> <span class="font-mono font-bold text-primary-900 ml-1">{{ soa.td_number }}</span></p>
            <p v-if="soa.pin"><span class="text-gray-500 font-medium">Property PIN:</span> <span class="font-mono ml-1">{{ soa.pin }}</span></p>
          </div>
          <div class="text-right space-y-1">
            <p><span class="text-gray-500 font-medium">SOA Reference No:</span> <strong class="font-mono text-base text-gray-900 ml-1">{{ soa.soa_no }}</strong></p>
            <p><span class="text-gray-500 font-medium">As of Date:</span> <span class="font-semibold ml-1">{{ formatDate(soa.as_of_date) }}</span></p>
            <p><span class="text-gray-500 font-medium">Valid Until:</span> <strong class="text-red-700 font-semibold ml-1">{{ formatDate(soa.valid_until) }}</strong></p>
            <p>
              <span class="text-gray-500 font-medium">Status:</span>
              <span
                :class="[
                  'ml-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase',
                  soa.status === 'Issued' ? 'bg-emerald-100 text-emerald-800' :
                  soa.status === 'PendingApproval' ? 'bg-amber-100 text-amber-800' :
                  soa.status === 'Settled' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ soa.status }}
              </span>
            </p>
          </div>
        </div>

        <!-- Breakdown table -->
        <div class="py-4">
          <p class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Itemized Assessment & Overdue Breakdown</p>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-100 text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-300">
                <tr>
                  <th class="p-2">Period</th>
                  <th class="p-2">Due Date</th>
                  <th class="p-2 text-right">Basic Balance</th>
                  <th class="p-2 text-right">SEF Balance</th>
                  <th class="p-2 text-center">Overdue</th>
                  <th class="p-2 text-right">Penalty</th>
                  <th class="p-2 text-right">Subtotal Due</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 font-mono text-xs">
                <tr v-for="item in soa.items" :key="item.id" class="hover:bg-gray-50">
                  <td class="p-2 font-sans font-medium text-gray-900">{{ item.taxable_year }} Q{{ item.quarter }}</td>
                  <td class="p-2 font-sans text-gray-600">{{ item.due_date }}</td>
                  <td class="p-2 text-right">{{ formatPeso(item.basic_balance) }}</td>
                  <td class="p-2 text-right">{{ formatPeso(item.sef_balance) }}</td>
                  <td class="p-2 text-center font-sans">
                    <span v-if="item.months_late > 0" class="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                      {{ item.months_late }} mo ({{ item.penalty_rate_pct }}%)
                    </span>
                    <span v-else class="text-gray-400 font-sans text-[11px]">Current</span>
                  </td>
                  <td class="p-2 text-right text-red-600 font-semibold">{{ formatPeso(item.penalty_amount) }}</td>
                  <td class="p-2 text-right font-bold text-gray-900">
                    {{ formatPeso(Number(item.principal_balance) + Number(item.penalty_amount)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals summary block -->
        <div class="grid grid-cols-2 gap-4 pt-2 pb-6 border-b border-gray-200">
          <div class="text-xs text-gray-500 space-y-1">
            <p v-if="soa.remarks"><strong class="text-gray-700">Remarks:</strong> {{ soa.remarks }}</p>
            <p v-if="soa.review_remarks"><strong class="text-gray-700">Treasurer Feedback:</strong> {{ soa.review_remarks }}</p>
            <p class="pt-2 text-[11px] text-gray-400 italic">
              Notice: Penalties accrue monthly pursuant to Sec. 255 of Republic Act No. 7160 (Local Government Code of 1991). Payments made on or before quarterly due dates are entitled to applicable prompt payment discounts.
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between text-gray-600">
              <span>Total Basic Tax Principal:</span>
              <span class="font-mono">{{ formatPeso(soa.total_basic) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Total SEF Principal:</span>
              <span class="font-mono">{{ formatPeso(soa.total_sef) }}</span>
            </div>
            <div class="flex justify-between font-semibold text-gray-800 pt-1 border-t border-gray-200">
              <span>Total Principal Balance:</span>
              <span class="font-mono">{{ formatPeso(soa.total_principal) }}</span>
            </div>
            <div class="flex justify-between text-red-600 font-semibold">
              <span>Total Penalties / Surcharges:</span>
              <span class="font-mono">{{ formatPeso(soa.total_penalty) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total Amount Due:</span>
              <span class="font-mono text-primary-800">PHP {{ formatPeso(soa.total_amount_due) }}</span>
            </div>
          </div>
        </div>

        <!-- Verification Signatures -->
        <div class="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div class="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
              {{ soa.preparer?.full_name || 'Assessment / Revenue Clerk' }}
            </div>
            <p class="text-[11px] text-gray-500 uppercase">Prepared By (Revenue Clerk)</p>
          </div>
          <div>
            <div class="border-b border-gray-400 pb-1 mb-1 font-semibold text-gray-800">
              {{ soa.reviewer?.full_name || 'Municipal Treasurer' }}
            </div>
            <p class="text-[11px] text-gray-500 uppercase">Approved By (Municipal Treasurer)</p>
          </div>
        </div>
      </div>

      <!-- Footer (Non-printable) -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 print:hidden">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Close
        </button>
        <button
          @click="printDocument"
          :disabled="loading || !soa"
          class="px-4 py-2 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
          </svg>
          Print SOA
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchSoaDetail, type StatementOfAccountData } from '@/services/billingApi'

const props = withDefaults(
  defineProps<{
    visible: boolean
    soa?: StatementOfAccountData | null
    soaId?: string | null
  }>(),
  {
    soa: null,
    soaId: null,
  }
)

defineEmits<{
  close: []
}>()

const loading = ref(false)
const fetchedSoa = ref<StatementOfAccountData | null>(null)
const soa = computed(() => props.soa || fetchedSoa.value)

watch(
  () => [props.visible, props.soaId, props.soa],
  async () => {
    if (!props.visible) {
      fetchedSoa.value = null
      return
    }

    if (props.soa) {
      fetchedSoa.value = null
      loading.value = false
      return
    }

    if (props.soaId) {
      loading.value = true
      try {
        fetchedSoa.value = await fetchSoaDetail(props.soaId)
      } catch (e) {
        console.error('Failed to fetch SOA detail:', e)
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
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const printDocument = () => {
  const printableArea = document.getElementById('soa-printable-area')
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
        <title>Statement of Account - ${soa.value?.soa_no || ''}</title>
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
          .bg-blue-50 { background-color: #eff6ff; }
          .border-blue-200 { border-color: #bfdbfe; }
          .text-blue-900 { color: #1e3a8a; }
          .text-primary-800 { color: #065f46; }
          .text-primary-900 { color: #064e3b; }
          .text-amber-800 { color: #92400e; }
          .bg-amber-50 { background-color: #fffbeb; }
          .text-red-600 { color: #dc2626; }
          .text-red-700 { color: #b91c1c; }
          .text-gray-400 { color: #9ca3af; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-700 { color: #374151; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-900 { color: #111827; }
          .rounded { border-radius: 4px; }
          .rounded-lg { border-radius: 6px; }
          .rounded-xl { border-radius: 8px; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
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
