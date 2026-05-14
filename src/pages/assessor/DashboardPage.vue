<template>
  <div class="space-y-8">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Pending Reviews</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ pendingReviews }}</p>
            <p class="mt-1 text-sm text-amber-600">⏳ Awaiting action</p>
          </div>
          <div class="rounded-xl bg-amber-100 p-3">
            <svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Approved Properties</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ approvedCount }}</p>
            <p class="mt-1 text-sm text-emerald-600">✓ This month</p>
          </div>
          <div class="rounded-xl bg-emerald-100 p-3">
            <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">FAAS Generated</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ faasGenerated }}</p>
            <p class="mt-1 text-sm text-blue-600">↑ Ready for release</p>
          </div>
          <div class="rounded-xl bg-blue-100 p-3">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Rejected Applications</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ rejectedCount }}</p>
            <p class="mt-1 text-sm text-red-600">⚠️ With observations</p>
          </div>
          <div class="rounded-xl bg-red-100 p-3">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Queue Table -->
    <div class="card">
      <h3 class="mb-6 text-lg font-semibold text-slate-900">Review Queue</h3>
      <DataTable :data="reviewRows" :columns="reviewColumns" :page-size="5">
        <template #cell-reviewStatus="{ row }">
          <Badge variant="info">{{ row.reviewStatus ?? 'pending_review' }}</Badge>
        </template>
        <template #row-actions="{ row }">
          <div class="flex items-center gap-2">
            <router-link :to="`/assessor/review/${row.id}`" class="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Open review
            </router-link>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-4 text-slate-600">All properties up to date</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/assessor/approved-properties" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-emerald-100 p-3">
            <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Approved Properties</h4>
            <p class="text-sm text-slate-600">18 approved</p>
          </div>
        </div>
      </router-link>

      <router-link to="/assessor/faas-generation" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-blue-100 p-3">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">FAAS Generation</h4>
            <p class="text-sm text-slate-600">15 ready</p>
          </div>
        </div>
      </router-link>

      <router-link to="/assessor/assessments" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-purple-100 p-3">
            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Assessments</h4>
            <p class="text-sm text-slate-600">View valuations</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePropertiesStore } from '@/stores/properties'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'

const propertiesStore = usePropertiesStore()

const reviewRows = computed(() => propertiesStore.reviewQueue)

const pendingReviews = computed(() => reviewRows.value.length)
const approvedCount = computed(() => propertiesStore.properties.filter((p) => p.reviewStatus === 'approved').length)
const rejectedCount = computed(() => propertiesStore.properties.filter((p) => p.status === 'rejected').length)
const faasGenerated = computed(() => propertiesStore.properties.filter((p) => p.faas).length)

const reviewColumns = [
  { key: 'applicationId', label: 'Application ID' },
  { key: 'pin', label: 'PIN' },
  { key: 'ownerName', label: 'Owner' },
  { key: 'propertyType', label: 'Property Type' },
  { key: 'reviewStatus', label: 'Review Status' },
  { key: 'submissionDate', label: 'Submission Date' },
]
</script>
