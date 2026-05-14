<template>
  <div class="card">
    <DataTable :data="rows" :columns="columns" :page-size="10">
      <template #cell-reviewStatus="{ row }">
        <Badge variant="success">{{ row.reviewStatus }}</Badge>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import { usePropertiesStore } from '@/stores/properties'

const store = usePropertiesStore()
const rows = computed(() => store.properties.filter((p) => p.reviewStatus === 'approved'))

const columns = [
  { key: 'pin', label: 'PIN' },
  { key: 'ownerName', label: 'Owner' },
  { key: 'propertyType', label: 'Property Type' },
  { key: 'submissionDate', label: 'Submission Date' },
  { key: 'reviewStatus', label: 'Status' },
]
</script>
