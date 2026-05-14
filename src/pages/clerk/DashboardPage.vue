<template>
  <div class="space-y-8">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Received Transactions</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ receivedCount }}</p>
            <p class="mt-1 text-sm text-emerald-600">↑ 3 this week</p>
          </div>
          <div class="rounded-xl bg-emerald-100 p-3">
            <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Pending Encodings</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ pendingEncoding }}</p>
            <p class="mt-1 text-sm text-amber-600">⚠️ In progress</p>
          </div>
          <div class="rounded-xl bg-amber-100 p-3">
            <svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Returned Applications</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ returnedCount }}</p>
            <p class="mt-1 text-sm text-red-600">↓ 2 resolved</p>
          </div>
          <div class="rounded-xl bg-red-100 p-3">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Released FAAS</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ releasedCount }}</p>
            <p class="mt-1 text-sm text-blue-600">→ Ready for print</p>
          </div>
          <div class="rounded-xl bg-blue-100 p-3">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Received Transactions Table -->
    <div class="card">
      <h3 class="mb-6 text-lg font-semibold text-slate-900">Recent Transactions</h3>
      <DataTable
        :data="properties"
        :columns="transactionColumns"
        :page-size="5"
      >
        <template #cell-status="{ row }">
          <Badge :variant="getStatusVariant(row.status)">
            {{ getStatusLabel(row.status) }}
          </Badge>
        </template>
        <template #row-actions="{ row }">
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="text-emerald-600 hover:text-emerald-700 text-sm font-medium" @click="handleView(row)">
              View
            </button>
            <button
              v-if="row.status === 'encoding'"
              type="button"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              @click="handleEncode(row)"
            >
              Encode
            </button>
            <button
              v-if="row.encodingStatus === 'in_progress'"
              type="button"
              class="text-amber-700 hover:text-amber-800 text-sm font-medium"
              @click="handleContinue(row)"
            >
              Continue session
            </button>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-4 text-slate-600">No transactions available</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/clerk/encoding-queue" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-emerald-100 p-3">
            <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Encoding Queue</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ pendingEncoding }} pending</p>
          </div>
        </div>
      </router-link>

      <router-link to="/clerk/verification-queue" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-blue-100 p-3">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Verification Queue</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ verificationCount }} in verification</p>
          </div>
        </div>
      </router-link>

      <router-link to="/clerk/released-faas" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-amber-100 p-3">
            <svg class="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Released FAAS</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ releasedCount }} ready to print</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>

  <PropertyDetailModal v-model:open="detailOpen" :property-id="detailPropertyId" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertiesStore, type Property } from '@/stores/properties'
import { useToastStore } from '@/stores/toast'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import PropertyDetailModal from '@/components/PropertyDetailModal.vue'

const router = useRouter()
const propertiesStore = usePropertiesStore()
const toast = useToastStore()

const detailOpen = ref(false)
const detailPropertyId = ref<string | null>(null)

const properties = computed(() => propertiesStore.properties)
const receivedCount = computed(() => properties.value.length)
const pendingEncoding = computed(() => propertiesStore.encodingQueue.length)
const releasedCount = computed(() => propertiesStore.releasedFaasRows.length)
const returnedCount = computed(() => properties.value.filter((p) => p.reviewStatus === 'returned').length)
const verificationCount = computed(() => propertiesStore.verificationQueue.length)

const transactionColumns = [
  { key: 'intakeReferenceNo', label: 'Intake Ref. No.' },
  { key: 'ownerName', label: 'Owner Name' },
  { key: 'propertyType', label: 'Property Type' },
  { key: 'submissionDate', label: 'Submission Date' },
  { key: 'status', label: 'Status' },
]

const getStatusVariant = (status: string) => {
  const variants: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
    'pending': 'info',
    'encoding': 'warning',
    'verified': 'success',
    'reviewed': 'info',
    'active': 'success',
    'rejected': 'danger',
  }
  return variants[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': 'Pending',
    'encoding': 'Encoding',
    'verified': 'Verified',
    'reviewed': 'Reviewed',
    'active': 'Active',
    'rejected': 'Rejected',
  }
  return labels[status] || status
}

const handleView = (property: Property) => {
  detailPropertyId.value = property.id
  detailOpen.value = true
}

const handleEncode = (property: Property) => {
  propertiesStore.updateProperty(property.id, { encodingStatus: 'in_progress' })
  toast.push('Encoding session started.', 'success')
  router.push('/clerk/encoding-queue')
}

const handleContinue = (property: Property) => {
  toast.push(`Resuming encoding for ${property.pin}`, 'info')
  router.push('/clerk/property-registration')
}
</script>
