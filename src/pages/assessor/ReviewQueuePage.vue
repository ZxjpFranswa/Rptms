<template>
  <div class="card">
    <DataTable :data="rows" :columns="columns" :page-size="8">
      <template #cell-reviewStatus="{ row }">
        <Badge variant="info">{{ row.reviewStatus ?? 'pending_review' }}</Badge>
      </template>
      <template #row-actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <router-link
            :to="`/assessor/review/${row.id}`"
            class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Open review
          </router-link>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import { usePropertiesStore } from '@/stores/properties'

const propertiesStore = usePropertiesStore()
const rows = computed(() => propertiesStore.reviewQueue)

const columns = [
  { key: 'applicationId', label: 'Application ID' },
  { key: 'pin', label: 'PIN' },
  { key: 'ownerName', label: 'Owner' },
  { key: 'propertyType', label: 'Property Type' },
  { key: 'reviewStatus', label: 'Review Status' },
  { key: 'submissionDate', label: 'Submission Date' },
]
</script>
