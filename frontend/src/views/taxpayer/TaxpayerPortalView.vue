<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
    <!-- Welcome Header / Taxpayer Banner -->
    <div class="bg-gradient-to-r from-primary-800 to-primary-900 rounded-2xl shadow-md p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 bg-primary-700/80 text-primary-200 text-xs font-semibold rounded-full uppercase">
            Official Taxpayer Portal
          </span>
          <span class="text-xs text-primary-200">Republic of the Philippines</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold mt-1">
          Welcome, {{ duesData?.taxpayer?.name || authStore.currentUser?.fullName || 'Valued Taxpayer' }}
        </h2>
        <p class="text-sm text-primary-200 mt-0.5">
          View your registered properties, annual tax dues, payment history, and official electronic receipts.
        </p>
      </div>

      <!-- Outstanding Balance Highlight -->
      <div class="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 text-right flex-shrink-0">
        <span class="text-xs text-primary-200 uppercase tracking-wider block">Total Outstanding Balance</span>
        <p class="text-3xl font-extrabold text-white mt-1">
          ₱{{ formatCurrency(duesData?.total_outstanding || 0) }}
        </p>
        <span class="text-[11px] text-primary-300 block mt-0.5">Across all registered declarations</span>
      </div>
    </div>

    <!-- Notifications / Due Date Reminders -->
    <div v-if="notifications.length > 0" class="space-y-2">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="[
          'p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition',
          notif.is_read
            ? 'bg-gray-50 border-gray-200 text-gray-700'
            : 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm'
        ]"
      >
        <div class="flex items-start gap-2.5">
          <span class="p-1 rounded bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
          <div>
            <span class="font-bold text-sm block">{{ notif.title }}</span>
            <p class="mt-0.5">{{ notif.message }}</p>
            <span class="text-[10px] text-gray-500 mt-1 block">{{ formatDate(notif.created_at) }}</span>
          </div>
        </div>
        <button
          v-if="!notif.is_read"
          @click="markAsRead(notif.id)"
          class="text-xs font-semibold text-amber-800 hover:text-amber-900 underline flex-shrink-0"
        >
          Mark as Read
        </button>
      </div>
    </div>

    <!-- Portal Navigation Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in portalTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center gap-2',
            activeTab === tab.id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- Content Sections -->
    <div class="space-y-6">
      <!-- TAB 1: MY PROPERTIES & DUES -->
      <div v-if="activeTab === 'properties'" class="space-y-4">
        <div v-if="loadingDues" class="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Loading your declared properties...
        </div>

        <div v-else-if="!duesData?.properties || duesData.properties.length === 0" class="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <p class="text-base font-semibold text-gray-800">No Real Properties Linked to Account</p>
          <p class="text-xs text-gray-500 mt-1">If you own declared properties, contact the Municipal Assessor or Clerk to link your Taxpayer ID.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="prop in duesData.properties"
            :key="prop.tax_declaration_id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4 hover:shadow-md transition"
          >
            <div class="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span class="text-xs text-gray-500 block">Tax Declaration Number</span>
                <h4 class="font-mono font-bold text-lg text-primary-800">{{ prop.td_number }}</h4>
                <p class="text-xs text-gray-600 mt-0.5">Barangay {{ prop.barangay }}</p>
                <p v-if="prop.pin" class="text-xs text-gray-500 font-mono">PIN: {{ prop.pin }}</p>
              </div>
              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  prop.outstanding_principal > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                ]"
              >
                {{ prop.outstanding_principal > 0 ? 'Unpaid Balance' : 'Current / Paid' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-gray-50 p-2.5 rounded-lg">
                <span class="text-gray-500 block">Total Assessed Value</span>
                <strong class="text-gray-900 text-sm">₱{{ formatCurrency(prop.total_assessed_value) }}</strong>
              </div>
              <div class="bg-gray-50 p-2.5 rounded-lg">
                <span class="text-gray-500 block">Outstanding Principal</span>
                <strong class="text-gray-900 text-sm" :class="prop.outstanding_principal > 0 ? 'text-amber-700' : 'text-emerald-700'">
                  ₱{{ formatCurrency(prop.outstanding_principal) }}
                </strong>
              </div>
            </div>

            <!-- Active Statement If Any -->
            <div v-if="prop.active_soa" class="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span class="font-bold">Active SOA: {{ prop.active_soa.soa_no }}</span>
                <span class="block text-blue-700 text-[11px]">Due: ₱{{ formatCurrency(prop.active_soa.total_amount_due) }}</span>
              </div>
              <button
                @click="openSoaModal(prop.active_soa.id)"
                class="px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 border border-blue-300 rounded shadow-sm hover:bg-blue-50"
              >
                View Statement
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ANNUAL TAX BILLS -->
      <div v-if="activeTab === 'bills'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">Annual Tax Bills & Quarterly Schedules</h3>
          <p class="text-xs text-gray-500">Breakdown of 1% Basic Tax and 1% Special Education Fund (SEF)</p>
        </div>

        <div v-if="loadingBills" class="p-8 text-center text-gray-500">
          Loading tax bills...
        </div>

        <div v-else-if="bills.length === 0" class="p-8 text-center text-gray-500">
          No tax bills generated yet.
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div v-for="b in bills" :key="b.id" class="p-5 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-primary-800 text-sm">Bill # {{ b.bill_no }}</span>
                  <span class="font-semibold text-gray-900 text-sm">&bull; Tax Year {{ b.taxable_year }}</span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[11px] font-semibold',
                      b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    ]"
                  >
                    {{ b.status }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  TD No: {{ b.tax_declaration?.td_number }} ({{ b.tax_declaration?.barangay }})
                  &bull; Assessed Value: ₱{{ formatCurrency(b.assessed_value) }}
                </p>
              </div>

              <div class="text-right">
                <span class="text-xs text-gray-500 block">Total Annual Tax Due</span>
                <span class="text-base font-bold text-gray-900">₱{{ formatCurrency(b.total_tax) }}</span>
              </div>
            </div>

            <!-- Installment Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div
                v-for="inst in b.installments"
                :key="inst.id"
                :class="[
                  'p-2.5 rounded-lg border text-xs',
                  inst.status === 'Paid'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                ]"
              >
                <div class="flex justify-between items-center font-semibold">
                  <span>Q{{ inst.quarter }} Installment</span>
                  <span
                    :class="[
                      'px-1.5 py-0.2 rounded text-[10px]',
                      inst.status === 'Paid' ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-gray-200 text-gray-700'
                    ]"
                  >
                    {{ inst.status }}
                  </span>
                </div>
                <p class="text-gray-500 text-[11px] mt-1">Due: {{ formatDate(inst.due_date) }}</p>
                <div class="mt-2 flex justify-between font-bold">
                  <span>₱{{ formatCurrency(inst.total_due) }}</span>
                  <span v-if="inst.status === 'Paid'" class="text-emerald-700">Settled</span>
                  <span v-else class="text-amber-700">Bal: ₱{{ formatCurrency(inst.principal_balance) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: STATEMENTS OF ACCOUNT -->
      <div v-if="activeTab === 'soas'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">Statements of Account (SOA)</h3>
          <p class="text-xs text-gray-500">Official billing notices issued by the Municipal Revenue Office</p>
        </div>

        <div v-if="loadingSoas" class="p-8 text-center text-gray-500">
          Loading statements...
        </div>

        <div v-else-if="soas.length === 0" class="p-8 text-center text-gray-500">
          No statements issued for your account yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-4">SOA Number</th>
                <th class="py-2.5 px-4">TD Number</th>
                <th class="py-2.5 px-4 text-right">Principal</th>
                <th class="py-2.5 px-4 text-right">Penalty</th>
                <th class="py-2.5 px-4 text-right">Total Due</th>
                <th class="py-2.5 px-4">Valid Until</th>
                <th class="py-2.5 px-4 text-center">Status</th>
                <th class="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in soas" :key="s.id" class="hover:bg-gray-50">
                <td class="py-2.5 px-4 font-mono font-bold text-primary-700">{{ s.soa_no }}</td>
                <td class="py-2.5 px-4 font-mono text-gray-800">{{ s.td_number }}</td>
                <td class="py-2.5 px-4 text-right font-medium">₱{{ formatCurrency(s.total_principal) }}</td>
                <td class="py-2.5 px-4 text-right text-amber-700 font-medium">₱{{ formatCurrency(s.total_penalty) }}</td>
                <td class="py-2.5 px-4 text-right font-bold text-gray-900">₱{{ formatCurrency(s.total_amount_due) }}</td>
                <td class="py-2.5 px-4 text-gray-600">{{ formatDate(s.valid_until) }}</td>
                <td class="py-2.5 px-4 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[11px] font-semibold',
                      s.status === 'Issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-center">
                  <button
                    @click="openSoaModal(s.id)"
                    class="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded"
                  >
                    View / Print
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 4: PAYMENT HISTORY & OFFICIAL RECEIPTS -->
      <div v-if="activeTab === 'payments'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-gray-900">Payment History & Official Receipts</h3>
          <p class="text-xs text-gray-500">Historical records of paid property taxes and printable receipts</p>
        </div>

        <div v-if="loadingPayments" class="p-8 text-center text-gray-500">
          Loading payment history...
        </div>

        <div v-else-if="payments.length === 0" class="p-8 text-center text-gray-500">
          No payment transactions found.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                <th class="py-2.5 px-4">Payment Date</th>
                <th class="py-2.5 px-4">OR Number</th>
                <th class="py-2.5 px-4">TD Number</th>
                <th class="py-2.5 px-4">Method</th>
                <th class="py-2.5 px-4 text-right">Discount</th>
                <th class="py-2.5 px-4 text-right">Amount Paid</th>
                <th class="py-2.5 px-4 text-center">Status</th>
                <th class="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in payments" :key="p.id" class="hover:bg-gray-50">
                <td class="py-2.5 px-4">{{ formatDate(p.payment_date) }}</td>
                <td class="py-2.5 px-4 font-mono font-bold text-primary-700">{{ p.or_number }}</td>
                <td class="py-2.5 px-4 font-mono text-gray-800">{{ p.tax_declaration?.td_number || '-' }}</td>
                <td class="py-2.5 px-4 text-gray-600">{{ p.payment_method }}</td>
                <td class="py-2.5 px-4 text-right text-blue-700 font-medium">₱{{ formatCurrency(p.discount_amount) }}</td>
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
                    class="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded"
                  >
                    Print OR
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Official Receipt Modal -->
    <OfficialReceiptModal
      :visible="showReceiptModal"
      :receipt="viewingPayment"
      :payment-id="viewingPaymentId"
      @close="showReceiptModal = false"
    />

    <!-- SOA Document Modal -->
    <SoaDocumentModal
      :visible="showSoaModal"
      :soa-id="viewingSoaId"
      @close="showSoaModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  fetchMyDues,
  fetchMyBills,
  fetchMySoas,
  fetchMyPayments,
  fetchMyNotifications,
  markNotificationReadApi,
  type TaxBillData,
  type StatementOfAccountData,
  type PaymentData,
} from '@/services/billingApi'
import OfficialReceiptModal from '@/components/billing/OfficialReceiptModal.vue'
import SoaDocumentModal from '@/components/billing/SoaDocumentModal.vue'

const authStore = useAuthStore()

const activeTab = ref('properties')
const portalTabs = [
  { id: 'properties', name: 'My Properties & Dues' },
  { id: 'bills', name: 'Annual Tax Bills' },
  { id: 'soas', name: 'Statements of Account (SOA)' },
  { id: 'payments', name: 'Payment History & Receipts' },
]

const duesData = ref<any>(null)
const loadingDues = ref(false)

const bills = ref<TaxBillData[]>([])
const loadingBills = ref(false)

const soas = ref<StatementOfAccountData[]>([])
const loadingSoas = ref(false)

const payments = ref<PaymentData[]>([])
const loadingPayments = ref(false)

const notifications = ref<any[]>([])

// Modals
const showReceiptModal = ref(false)
const viewingPayment = ref<PaymentData | null>(null)
const viewingPaymentId = ref('')
const showSoaModal = ref(false)
const viewingSoaId = ref('')

const loadAllData = async () => {
  loadingDues.value = true
  loadingBills.value = true
  loadingSoas.value = true
  loadingPayments.value = true

  try {
    const [duesRes, billsRes, soasRes, paymentsRes, notifRes] = await Promise.all([
      fetchMyDues(),
      fetchMyBills(),
      fetchMySoas(),
      fetchMyPayments(),
      fetchMyNotifications(),
    ])

    duesData.value = duesRes
    bills.value = billsRes
    soas.value = soasRes
    payments.value = paymentsRes
    notifications.value = notifRes
  } catch (err) {
    console.error('Failed to load taxpayer portal data:', err)
  } finally {
    loadingDues.value = false
    loadingBills.value = false
    loadingSoas.value = false
    loadingPayments.value = false
  }
}

const markAsRead = async (notifId: string) => {
  try {
    await markNotificationReadApi(notifId)
    const n = notifications.value.find(item => item.id === notifId)
    if (n) n.is_read = true
  } catch (err) {
    console.error(err)
  }
}

const openReceiptModal = (p: PaymentData) => {
  viewingPayment.value = p
  viewingPaymentId.value = p.id
  showReceiptModal.value = true
}

const openSoaModal = (id: string) => {
  viewingSoaId.value = id
  showSoaModal.value = true
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
  loadAllData()
})
</script>
