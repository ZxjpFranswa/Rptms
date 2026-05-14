<template>
  <div class="card">
    <DataTable :data="rows" :columns="columns" :page-size="8">
      <template #cell-duplicateCheck="{ row }">
        <Badge :variant="badgeVariant(row.verification?.duplicateCheck)">{{ row.verification?.duplicateCheck ?? '-' }}</Badge>
      </template>
      <template #cell-ownershipValidation="{ row }">
        <Badge :variant="badgeVariant(row.verification?.ownershipValidation)">{{ row.verification?.ownershipValidation ?? '-' }}</Badge>
      </template>
      <template #cell-consistencyCheck="{ row }">
        <Badge :variant="badgeVariant(row.verification?.consistencyCheck)">{{ row.verification?.consistencyCheck ?? '-' }}</Badge>
      </template>
      <template #cell-verificationStatus="{ row }">
        <Badge :variant="row.verification?.overallStatus === 'passed' ? 'success' : 'warning'">
          {{ row.verification?.overallStatus ?? 'pending' }}
        </Badge>
      </template>
      <template #row-actions="{ row }">
        <button type="button" class="text-sm font-medium text-emerald-600 hover:text-emerald-700" @click="view(row)">View</button>
      </template>
    </DataTable>
  </div>

  <PropertyDetailModal v-model:open="detailOpen" :property-id="detailPropertyId" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import PropertyDetailModal from '@/components/PropertyDetailModal.vue'
import { usePropertiesStore } from '@/stores/properties'
import { useToastStore } from '@/stores/toast'

const propertiesStore = usePropertiesStore()
const toast = useToastStore()

const detailOpen = ref(false)
const detailPropertyId = ref<string | null>(null)

const rows = computed(() => propertiesStore.verificationQueue)

const columns = [
  { key: 'pin', label: 'PIN' },
  { key: 'duplicateCheck', label: 'Duplicate Check' },
  { key: 'ownershipValidation', label: 'Ownership' },
  { key: 'consistencyCheck', label: 'Consistency' },
  { key: 'verificationStatus', label: 'Verification Status' },
]

const badgeVariant = (v?: string) => {
  if (v === 'pass') return 'success' as const
  if (v === 'fail') return 'danger' as const
  return 'info' as const
}

const view = (row: (typeof rows.value)[0]) => {
  detailPropertyId.value = row.id
  detailOpen.value = true
  toast.push(`Loaded verification context for ${row.pin}`, 'info')
}
</script>
