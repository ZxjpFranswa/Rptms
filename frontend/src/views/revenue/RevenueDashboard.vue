<template>
  <div class="p-6 space-y-6">
    <!-- Top metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Tax Bills" :value="stats.totalBills" icon="draft" color="blue" />
      <StatCard title="Active SOAs" :value="stats.issuedSoas" icon="check-circle" color="emerald" />
      <StatCard title="Pending Treasurer Review" :value="stats.pendingSoas" icon="clock" color="yellow" />
      <StatCard title="Delinquent Accounts" :value="stats.delinquentCount" icon="alert" color="red" />
    </div>

    <!-- Quick action banner -->
    <div class="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
      <div class="space-y-1">
        <h3 class="text-xl font-bold">Revenue Clerk Operations</h3>
        <p class="text-primary-100 text-sm">
          Generate annual tax bills from authorized Tax Declarations, prepare Statements of Account (SOA), assess overdue penalties, and submit for Treasurer review.
        </p>
      </div>
      <div class="flex flex-wrap gap-2.5">
        <router-link
          to="/revenue/soas"
          class="px-4 py-2 bg-white text-primary-800 hover:bg-primary-50 rounded-xl font-semibold text-xs transition shadow-sm"
        >
          + Prepare New SOA
        </router-link>
        <router-link
          to="/revenue/bills"
          class="px-4 py-2 bg-primary-900/60 hover:bg-primary-900/80 text-white rounded-xl font-semibold text-xs transition border border-primary-600"
        >
          View Tax Bills
        </router-link>
      </div>
    </div>

    <!-- Recent SOAs needing attention -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-gray-900 text-base">Recent Statements of Account</h3>
          <p class="text-xs text-gray-500">Track SOAs generated and approval status from the Municipal Treasurer</p>
        </div>
        <router-link to="/revenue/soas" class="text-xs font-semibold text-primary-700 hover:text-primary-800">
          View all SOAs →
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50 text-gray-600 uppercase font-semibold text-[11px] border-b border-gray-200">
            <tr>
              <th class="p-3.5">SOA Number</th>
              <th class="p-3.5">Tax Declaration</th>
              <th class="p-3.5">Owner / Payor</th>
              <th class="p-3.5">Barangay</th>
              <th class="p-3.5 text-right">Principal</th>
              <th class="p-3.5 text-right">Penalties</th>
              <th class="p-3.5 text-right">Total Due</th>
              <th class="p-3.5 text-center">Status</th>
              <th class="p-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-sans">
            <tr v-if="loading" class="text-center">
              <td colspan="9" class="p-6 text-gray-400">Loading statements...</td>
            </tr>
            <tr v-else-if="recentSoas.length === 0" class="text-center">
              <td colspan="9" class="p-6 text-gray-400">No Statements of Account generated yet.</td>
            </tr>
            <tr v-for="s in recentSoas" :key="s.id" class="hover:bg-gray-50 transition">
              <td class="p-3.5 font-mono font-semibold text-primary-900">{{ s.soa_no }}</td>
              <td class="p-3.5 font-mono">{{ s.td_number }}</td>
              <td class="p-3.5 font-medium text-gray-900">{{ s.owner_name }}</td>
              <td class="p-3.5 text-gray-600">{{ s.barangay }}</td>
              <td class="p-3.5 text-right font-mono">{{ formatPeso(s.total_principal) }}</td>
              <td class="p-3.5 text-right font-mono text-red-600">{{ formatPeso(s.total_penalty) }}</td>
              <td class="p-3.5 text-right font-mono font-bold text-gray-900">{{ formatPeso(s.total_amount_due) }}</td>
              <td class="p-3.5 text-center">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    s.status === 'Issued' ? 'bg-emerald-100 text-emerald-800' :
                    s.status === 'PendingApproval' ? 'bg-amber-100 text-amber-800' :
                    s.status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ s.status === 'PendingApproval' ? 'Pending Review' : s.status }}
                </span>
              </td>
              <td class="p-3.5 text-center">
                <button
                  @click="openSoaModal(s)"
                  class="px-2.5 py-1 text-[11px] font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
                >
                  View SOA
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SOA Modal -->
    <SoaDocumentModal
      :visible="showModal"
      :soa="selectedSoa"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import SoaDocumentModal from '@/components/billing/SoaDocumentModal.vue'
import { fetchSoas, fetchBills, fetchDelinquentsReport, type StatementOfAccountData } from '@/services/billingApi'

const loading = ref(true)
const recentSoas = ref<StatementOfAccountData[]>([])
const stats = ref({
  totalBills: 0,
  issuedSoas: 0,
  pendingSoas: 0,
  delinquentCount: 0,
})

const showModal = ref(false)
const selectedSoa = ref<StatementOfAccountData | null>(null)

const formatPeso = (val?: number) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const openSoaModal = (soa: StatementOfAccountData) => {
  selectedSoa.value = soa
  showModal.value = true
}

onMounted(async () => {
  try {
    const [soasRes, billsRes, delinqRes] = await Promise.all([
      fetchSoas({ page: 1 }),
      fetchBills({ page: 1 }),
      fetchDelinquentsReport(),
    ])

    recentSoas.value = soasRes.data || []
    stats.value.totalBills = billsRes.total || 0
    stats.value.issuedSoas = (soasRes.data || []).filter((s) => s.status === 'Issued').length
    stats.value.pendingSoas = (soasRes.data || []).filter((s) => s.status === 'PendingApproval').length
    stats.value.delinquentCount = delinqRes.total_delinquent_properties || 0
  } catch (e) {
    console.error('Failed to load dashboard data:', e)
  } finally {
    loading.value = false
  }
})
</script>
