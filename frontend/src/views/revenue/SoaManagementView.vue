<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Statements of Account (SOA)</h2>
        <p class="text-gray-600 mt-1">Generate, track, and manage official real property tax billing statements</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Generate SOA
      </button>
    </div>

    <!-- Status Tabs & Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <!-- Status Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="selectedStatus = tab.value; loadSoas()"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
            selectedStatus === tab.value
              ? 'bg-primary-50 text-primary-700 font-semibold border border-primary-200'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Search Property or Taxpayer</label>
          <input
            v-model="searchQuery"
            @input="debounceSearch"
            type="text"
            placeholder="Search SOA #, TD #, or Owner..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Filter by Barangay</label>
          <select
            v-model="selectedBarangay"
            @change="loadSoas"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">All Barangays</option>
            <option v-for="b in barangays" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- SOAs Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto text-primary-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        Loading Statements of Account...
      </div>

      <div v-else-if="soas.length === 0" class="p-12 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-base font-semibold text-gray-800">No Statements of Account Found</p>
        <p class="text-sm text-gray-500 mt-1">Try adjusting your filters or generate a new SOA for a property.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
              <th class="py-3 px-4">SOA Number</th>
              <th class="py-3 px-4">Property / TD #</th>
              <th class="py-3 px-4">Taxpayer / Owner</th>
              <th class="py-3 px-4">Barangay</th>
              <th class="py-3 px-4 text-right">Principal</th>
              <th class="py-3 px-4 text-right">Penalty</th>
              <th class="py-3 px-4 text-right">Total Due</th>
              <th class="py-3 px-4">Valid Until</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="soa in soas"
              :key="soa.id"
              class="hover:bg-gray-50/80 transition"
            >
              <td class="py-3 px-4 font-mono font-semibold text-primary-700 whitespace-nowrap">
                {{ soa.soa_no }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">{{ soa.td_number }}</span>
                <span v-if="soa.pin" class="block text-xs text-gray-500 font-mono">PIN: {{ soa.pin }}</span>
              </td>
              <td class="py-3 px-4 text-gray-800 font-medium whitespace-nowrap">
                {{ soa.owner_name }}
              </td>
              <td class="py-3 px-4 text-gray-600 whitespace-nowrap">
                {{ soa.barangay }}
              </td>
              <td class="py-3 px-4 text-right font-medium text-gray-800 whitespace-nowrap">
                ₱{{ formatCurrency(soa.total_principal) }}
              </td>
              <td class="py-3 px-4 text-right font-medium whitespace-nowrap" :class="soa.total_penalty > 0 ? 'text-amber-600' : 'text-gray-500'">
                ₱{{ formatCurrency(soa.total_penalty) }}
              </td>
              <td class="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                ₱{{ formatCurrency(soa.total_amount_due) }}
              </td>
              <td class="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                {{ formatDate(soa.valid_until) }}
              </td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-1 text-xs font-semibold rounded-full',
                    getStatusBadgeClass(soa.status)
                  ]"
                >
                  {{ formatStatus(soa.status) }}
                </span>
                <span
                  v-if="soa.status === 'PendingApproval'"
                  class="block text-[11px] text-amber-600 mt-0.5"
                >
                  Forwarded to Treasurer
                </span>
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- View/Print Document -->
                  <button
                    @click="viewSoaDocument(soa.id)"
                    class="px-2.5 py-1 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition"
                    title="View & Print Official Statement"
                  >
                    View / Print
                  </button>

                  <!-- Revise Denied SOA -->
                  <button
                    v-if="soa.status === 'Denied'"
                    @click="openReviseModal(soa)"
                    class="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition"
                    title="Revise and Resubmit to Treasurer"
                  >
                    Revise
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="p-4 border-t border-gray-200 flex items-center justify-between">
        <p class="text-xs text-gray-500">
          Showing page {{ currentPage }} of {{ totalPages }} ({{ totalSoas }} total records)
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
            class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
            class="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Generate SOA Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        <div class="bg-primary-700 text-white px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold">Generate Statement of Account</h3>
          <button @click="showCreateModal = false" class="text-primary-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateSoa" class="p-6 space-y-4">
          <!-- Property Search -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">
              Select Real Property / Tax Declaration *
            </label>
            <div class="relative">
              <input
                v-model="createSearchQuery"
                @input="searchProperties"
                type="text"
                placeholder="Type TD #, Owner name, or PIN to search..."
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <div v-if="searchingProperties" class="absolute right-3 top-2.5">
                <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              </div>
            </div>

            <!-- Search Dropdown Results -->
            <div
              v-if="propertySearchResults.length > 0"
              class="mt-1 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100 bg-white shadow-lg"
            >
              <div
                v-for="prop in propertySearchResults"
                :key="prop.tax_declaration_id"
                @click="selectPropertyForSoa(prop)"
                class="p-2.5 hover:bg-primary-50 cursor-pointer transition text-xs"
              >
                <div class="flex justify-between items-center font-semibold text-gray-900">
                  <span>{{ prop.td_number }} - {{ prop.owner_name }}</span>
                  <span class="text-primary-700 font-mono">Bal: ₱{{ formatCurrency(prop.outstanding_principal) }}</span>
                </div>
                <div class="text-gray-500 mt-0.5">
                  Brgy. {{ prop.barangay }} | Assessed Value: ₱{{ formatCurrency(prop.total_assessed_value) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Property Preview -->
          <div v-if="selectedProperty" class="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div class="flex justify-between items-center border-b border-gray-200 pb-2">
              <span class="font-bold text-gray-800">Selected Property:</span>
              <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-semibold">Active TD</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-gray-700">
              <div><span class="text-gray-500">TD No:</span> <strong class="font-mono">{{ selectedProperty.td_number }}</strong></div>
              <div><span class="text-gray-500">Owner:</span> <strong>{{ selectedProperty.owner_name }}</strong></div>
              <div><span class="text-gray-500">Barangay:</span> {{ selectedProperty.barangay }}</div>
              <div><span class="text-gray-500">Principal Due:</span> <strong>₱{{ formatCurrency(selectedProperty.outstanding_principal) }}</strong></div>
            </div>
          </div>

          <!-- Dates & Options -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">As-Of Date (Computation Base)</label>
              <input
                v-model="createForm.as_of_date"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Validity Date (Expiration)</label>
              <input
                v-model="createForm.valid_until"
                type="date"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Remarks / Notes</label>
            <textarea
              v-model="createForm.remarks"
              rows="2"
              placeholder="e.g. Generated upon taxpayer request for transfer or clearance..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3 items-start text-xs text-blue-800">
            <svg class="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="font-semibold">Statutory Workflow Rule</p>
              <p class="mt-0.5 text-blue-700">
                If late penalties apply to this account, the Statement of Account will be automatically routed to the <strong>Municipal Treasurer</strong> for official review and approval before payments can be settled against it.
              </p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting || !selectedProperty"
              class="px-5 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 font-semibold rounded-lg shadow-sm transition"
            >
              {{ submitting ? 'Generating...' : 'Generate & Issue SOA' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Revise Denied SOA Modal -->
    <div
      v-if="showReviseModal && revisingSoa"
      class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-fadeIn">
        <div class="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold">Revise Denied Statement of Account</h3>
            <p class="text-xs text-amber-100 font-mono mt-0.5">{{ revisingSoa.soa_no }}</p>
          </div>
          <button @click="showReviseModal = false" class="text-amber-200 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleReviseSoa" class="p-6 space-y-4">
          <!-- Treasurer's Denial Reason -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs">
            <p class="font-bold text-red-800">Treasurer's Review / Denial Remarks:</p>
            <p class="mt-1 text-red-700 italic font-medium">"{{ revisingSoa.review_remarks || 'Penalty calculation requires adjustment.' }}"</p>
            <p class="mt-1 text-[11px] text-gray-500">Reviewed by: {{ revisingSoa.reviewer?.full_name || 'Municipal Treasurer' }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Clerk Revision Notes & Explanation *</label>
            <textarea
              v-model="reviseForm.remarks"
              required
              rows="3"
              placeholder="Explain changes made to address the Treasurer's denial..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="showReviseModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 font-semibold rounded-lg shadow-sm transition"
            >
              {{ submitting ? 'Submitting...' : 'Resubmit to Treasurer' }}
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
  searchPropertiesForBilling,
  createSoaApi,
  reviseSoaApi,
  type StatementOfAccountData,
  type PropertySearchResult,
} from '@/services/billingApi'
import SoaDocumentModal from '@/components/billing/SoaDocumentModal.vue'

const soas = ref<StatementOfAccountData[]>([])
const loading = ref(false)
const submitting = ref(false)
const totalSoas = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

const selectedStatus = ref('')
const selectedBarangay = ref('')
const searchQuery = ref('')

const barangays = [
  'Barangay Poblacion',
  'Barangay San Juan',
  'Barangay Santa Maria',
  'Barangay San Pedro',
  'Barangay San Isidro',
]

const statusTabs = [
  { label: 'All Statements', value: '' },
  { label: 'Pending Approval', value: 'PendingApproval' },
  { label: 'Issued (Ready for Payment)', value: 'Issued' },
  { label: 'Denied by Treasurer', value: 'Denied' },
  { label: 'Settled', value: 'Settled' },
]

// Create SOA modal state
const showCreateModal = ref(false)
const createSearchQuery = ref('')
const searchingProperties = ref(false)
const propertySearchResults = ref<PropertySearchResult[]>([])
const selectedProperty = ref<PropertySearchResult | null>(null)
const createForm = ref({
  as_of_date: new Date().toISOString().split('T')[0],
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  remarks: '',
})

// Revise SOA modal state
const showReviseModal = ref(false)
const revisingSoa = ref<StatementOfAccountData | null>(null)
const reviseForm = ref({
  remarks: '',
})

// Document modal state
const showDocumentModal = ref(false)
const viewingSoaId = ref('')

const loadSoas = async () => {
  loading.value = true
  try {
    const res = await fetchSoas({
      status: selectedStatus.value || undefined,
      barangay: selectedBarangay.value || undefined,
      search: searchQuery.value || undefined,
      page: currentPage.value,
    })
    soas.value = res.data
    totalSoas.value = res.total
    totalPages.value = Math.ceil(res.total / 15) || 1
  } catch (err) {
    console.error('Failed to load SOAs:', err)
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadSoas()
  }, 350)
}

const resetFilters = () => {
  selectedStatus.value = ''
  selectedBarangay.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  loadSoas()
}

const changePage = (page: number) => {
  currentPage.value = page
  loadSoas()
}

const openCreateModal = () => {
  selectedProperty.value = null
  createSearchQuery.value = ''
  propertySearchResults.value = []
  createForm.value = {
    as_of_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: '',
  }
  showCreateModal.value = true
}

let propSearchTimer: any = null
const searchProperties = () => {
  clearTimeout(propSearchTimer)
  if (!createSearchQuery.value.trim() || createSearchQuery.value.length < 2) {
    propertySearchResults.value = []
    return
  }
  propSearchTimer = setTimeout(async () => {
    searchingProperties.value = true
    try {
      propertySearchResults.value = await searchPropertiesForBilling(createSearchQuery.value)
    } catch (err) {
      console.error(err)
    } finally {
      searchingProperties.value = false
    }
  }, 300)
}

const selectPropertyForSoa = (prop: PropertySearchResult) => {
  selectedProperty.value = prop
  propertySearchResults.value = []
  createSearchQuery.value = `${prop.td_number} - ${prop.owner_name}`
}

const handleCreateSoa = async () => {
  if (!selectedProperty.value) return
  submitting.value = true
  try {
    const created = await createSoaApi({
      tax_declaration_id: selectedProperty.value.tax_declaration_id,
      as_of_date: createForm.value.as_of_date,
      valid_until: createForm.value.valid_until,
      remarks: createForm.value.remarks,
    })
    showCreateModal.value = false
    await loadSoas()

    // Automatically prompt view/print document
    viewSoaDocument(created.id)
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to generate Statement of Account')
  } finally {
    submitting.value = false
  }
}

const openReviseModal = (soa: StatementOfAccountData) => {
  revisingSoa.value = soa
  reviseForm.value.remarks = ''
  showReviseModal.value = true
}

const handleReviseSoa = async () => {
  if (!revisingSoa.value) return
  submitting.value = true
  try {
    await reviseSoaApi(revisingSoa.value.id, {
      remarks: reviseForm.value.remarks,
    })
    showReviseModal.value = false
    await loadSoas()
    alert('Statement of Account has been revised and resubmitted to the Municipal Treasurer.')
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to revise SOA')
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
    case 'Issued': return 'Issued / Approved'
    case 'Denied': return 'Denied by Treasurer'
    case 'Settled': return 'Settled / Paid'
    case 'Superseded': return 'Superseded'
    default: return status
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PendingApproval': return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 'Issued': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'Denied': return 'bg-red-100 text-red-800 border border-red-200'
    case 'Settled': return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'Superseded': return 'bg-gray-100 text-gray-600 border border-gray-200'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  loadSoas()
})
</script>
