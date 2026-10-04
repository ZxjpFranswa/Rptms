<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Penalty Review & Approval Queue</h2>
        <p class="text-gray-600 mt-1">Review statutory 2%/month late penalties submitted by Revenue Clerks</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
          {{ pendingCount }} Statements Awaiting Decision
        </span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="selectedStatus = tab.value; loadApprovals()"
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

    <!-- Approvals List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Loading Statements for review...
      </div>

      <div v-else-if="soas.length === 0" class="p-12 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Statements of Account in this Queue</p>
        <p class="text-sm text-gray-500 mt-1">There are no statements matching your current status filter.</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="soa in soas"
          :key="soa.id"
          class="p-5 hover:bg-gray-50/70 transition space-y-4"
        >
          <!-- Top Row: Identification & Amounts -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-base text-primary-800">{{ soa.soa_no }}</span>
                <span
                  :class="[
                    'px-2.5 py-0.5 text-xs font-semibold rounded-full',
                    getStatusBadgeClass(soa.status)
                  ]"
                >
                  {{ formatStatus(soa.status) }}
                </span>
                <span class="text-xs text-gray-500">
                  Valid until: <strong class="text-gray-700">{{ formatDate(soa.valid_until) }}</strong>
                </span>
              </div>
              <p class="text-sm font-semibold text-gray-900 mt-1">
                {{ soa.owner_name }} &bull; TD No: <span class="font-mono text-primary-700">{{ soa.td_number }}</span>
              </p>
              <p class="text-xs text-gray-500">
                Barangay {{ soa.barangay }} | Prepared by: {{ soa.preparer?.full_name || 'Revenue Clerk' }}
              </p>
            </div>

            <!-- Summary Totals -->
            <div class="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs">
              <div>
                <span class="text-gray-500 block">Principal Due</span>
                <strong class="text-gray-800 text-sm">₱{{ formatCurrency(soa.total_principal) }}</strong>
              </div>
              <div class="w-px h-8 bg-gray-200"></div>
              <div>
                <span class="text-amber-600 block font-medium">Late Penalty</span>
                <strong class="text-amber-700 text-sm">₱{{ formatCurrency(soa.total_penalty) }}</strong>
              </div>
              <div class="w-px h-8 bg-gray-200"></div>
              <div>
                <span class="text-gray-700 block font-semibold">Total Amount</span>
                <strong class="text-primary-800 text-base font-bold">₱{{ formatCurrency(soa.total_amount_due) }}</strong>
              </div>
            </div>
          </div>

          <!-- Quarterly Penalty Calculation Breakdown -->
          <div v-if="soa.items && soa.items.length > 0" class="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th class="py-2 px-3">Taxable Year & Quarter</th>
                  <th class="py-2 px-3">Due Date</th>
                  <th class="py-2 px-3 text-right">Principal Balance</th>
                  <th class="py-2 px-3 text-center">Months Overdue</th>
                  <th class="py-2 px-3 text-center">Penalty Rate</th>
                  <th class="py-2 px-3 text-right">Computed Penalty</th>
                  <th class="py-2 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in soa.items" :key="item.id" class="hover:bg-gray-50/50">
                  <td class="py-2 px-3 font-semibold text-gray-900">
                    {{ item.taxable_year }} - Q{{ item.quarter }}
                  </td>
                  <td class="py-2 px-3 text-gray-600">{{ formatDate(item.due_date) }}</td>
                  <td class="py-2 px-3 text-right font-medium">₱{{ formatCurrency(item.principal_balance) }}</td>
                  <td class="py-2 px-3 text-center">
                    <span :class="item.months_late > 0 ? 'text-amber-700 font-bold' : 'text-gray-500'">
                      {{ item.months_late }} mos
                    </span>
                  </td>
                  <td class="py-2 px-3 text-center font-mono">
                    {{ item.penalty_rate_pct }}%
                  </td>
                  <td class="py-2 px-3 text-right font-semibold text-amber-700">
                    ₱{{ formatCurrency(item.penalty_amount) }}
                  </td>
                  <td class="py-2 px-3 text-right font-bold text-gray-900">
                    ₱{{ formatCurrency(Number(item.principal_balance) + Number(item.penalty_amount)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Clerk Remarks if any -->
          <div v-if="soa.remarks" class="bg-amber-50/60 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-800">
            <span class="font-semibold">Clerk Remarks:</span> {{ soa.remarks }}
          </div>

          <!-- Review Remarks if already decided -->
          <div v-if="soa.review_remarks" class="bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700">
            <span class="font-semibold">Treasurer Decision Remarks:</span> {{ soa.review_remarks }}
            <span class="text-gray-500 block text-[11px] mt-0.5">By: {{ soa.reviewer?.full_name || 'Municipal Treasurer' }}</span>
          </div>

          <!-- Decision Actions (Only for PendingApproval) -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              @click="viewSoaDocument(soa.id)"
              class="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              View Printable Statement &rarr;
            </button>

            <div v-if="soa.status === 'PendingApproval'" class="flex items-center gap-2">
              <button
                @click="openDenyModal(soa)"
                class="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
              >
                Deny & Return to Clerk
              </button>
              <button
                @click="openApproveModal(soa)"
                class="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
              >
                Approve Penalties & Authorize SOA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div
      v-if="showApproveModal && targetSoa"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div class="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 class="text-base font-bold">Approve Statement of Account</h3>
          <button @click="showApproveModal = false" class="text-emerald-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleApproveSoa" class="p-6 space-y-4">
          <p class="text-sm text-gray-700">
            You are officially approving the penalty computation for Statement
            <strong class="font-mono text-gray-900">{{ targetSoa.soa_no }}</strong> for taxpayer
            <strong>{{ targetSoa.owner_name }}</strong>.
          </p>

          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-emerald-800">Approved Penalty:</span>
              <strong class="text-emerald-900 font-mono">₱{{ formatCurrency(targetSoa.total_penalty) }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-emerald-800">Total Authorized Due:</span>
              <strong class="text-emerald-900 font-mono">₱{{ formatCurrency(targetSoa.total_amount_due) }}</strong>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Approval Remarks (Optional)</label>
            <textarea
              v-model="actionRemarks"
              rows="2"
              placeholder="e.g. Penalty calculation audited and verified compliant with Sec. 255 LGC."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showApproveModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 font-bold rounded-lg shadow-sm transition"
            >
              {{ submitting ? 'Approving...' : 'Confirm Approval' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Deny Modal -->
    <div
      v-if="showDenyModal && targetSoa"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div class="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 class="text-base font-bold">Deny Statement & Return to Clerk</h3>
          <button @click="showDenyModal = false" class="text-red-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleDenySoa" class="p-6 space-y-4">
          <p class="text-sm text-gray-700">
            Please specify the reason for denying Statement
            <strong class="font-mono text-gray-900">{{ targetSoa.soa_no }}</strong>. The Revenue Clerk will be notified to revise the computation.
          </p>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Reason for Denial *</label>
            <textarea
              v-model="actionRemarks"
              required
              rows="3"
              placeholder="e.g. Penalty calculation month count error; please verify if prior payment receipt exists for Q1..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showDenyModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting || !actionRemarks.trim()"
              class="px-5 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 font-bold rounded-lg shadow-sm transition"
            >
              {{ submitting ? 'Denying...' : 'Deny Statement' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Official SOA Document Modal -->
    <SoaDocumentModal
      :visible="showDocumentModal"
      :soa-id="viewingSoaId"
      @close="showDocumentModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchSoas,
  approveSoaApi,
  denySoaApi,
  type StatementOfAccountData,
} from '@/services/billingApi'
import SoaDocumentModal from '@/components/billing/SoaDocumentModal.vue'

const soas = ref<StatementOfAccountData[]>([])
const loading = ref(false)
const submitting = ref(false)
const pendingCount = ref(0)

const selectedStatus = ref('PendingApproval')

const filterTabs = [
  { label: 'Pending Review', value: 'PendingApproval' },
  { label: 'Approved Statements', value: 'Issued' },
  { label: 'Denied Statements', value: 'Denied' },
  { label: 'All Statements', value: '' },
]

// Modal states
const showApproveModal = ref(false)
const showDenyModal = ref(false)
const targetSoa = ref<StatementOfAccountData | null>(null)
const actionRemarks = ref('')

const showDocumentModal = ref(false)
const viewingSoaId = ref('')

const loadApprovals = async () => {
  loading.value = true
  try {
    const res = await fetchSoas({
      status: selectedStatus.value || undefined,
    })
    soas.value = res.data

    if (selectedStatus.value === 'PendingApproval') {
      pendingCount.value = res.total
    } else {
      // also fetch pending count
      const pRes = await fetchSoas({ status: 'PendingApproval' })
      pendingCount.value = pRes.total
    }
  } catch (err) {
    console.error('Failed to load approvals:', err)
  } finally {
    loading.value = false
  }
}

const openApproveModal = (soa: StatementOfAccountData) => {
  targetSoa.value = soa
  actionRemarks.value = ''
  showApproveModal.value = true
}

const handleApproveSoa = async () => {
  if (!targetSoa.value) return
  submitting.value = true
  try {
    await approveSoaApi(targetSoa.value.id, actionRemarks.value || undefined)
    showApproveModal.value = false
    await loadApprovals()
    alert(`Statement ${targetSoa.value.soa_no} has been approved and is now active for cashier collection.`)
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to approve Statement of Account')
  } finally {
    submitting.value = false
  }
}

const openDenyModal = (soa: StatementOfAccountData) => {
  targetSoa.value = soa
  actionRemarks.value = ''
  showDenyModal.value = true
}

const handleDenySoa = async () => {
  if (!targetSoa.value || !actionRemarks.value.trim()) return
  submitting.value = true
  try {
    await denySoaApi(targetSoa.value.id, actionRemarks.value.trim())
    showDenyModal.value = false
    await loadApprovals()
    alert(`Statement ${targetSoa.value.soa_no} has been denied and returned to the Revenue Clerk.`)
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to deny Statement of Account')
  } finally {
    submitting.value = false
  }
}

const viewSoaDocument = (soaId: string) => {
  viewingSoaId.value = soaId
  showDocumentModal.value = true
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

const formatStatus = (status: string) => {
  switch (status) {
    case 'PendingApproval': return 'Pending Treasurer Review'
    case 'Issued': return 'Approved / Issued'
    case 'Denied': return 'Denied'
    case 'Settled': return 'Settled'
    case 'Superseded': return 'Superseded'
    default: return status
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PendingApproval': return 'bg-amber-100 text-amber-800'
    case 'Issued': return 'bg-emerald-100 text-emerald-800'
    case 'Denied': return 'bg-red-100 text-red-800'
    case 'Settled': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-700'
  }
}

onMounted(() => {
  loadApprovals()
})
</script>
