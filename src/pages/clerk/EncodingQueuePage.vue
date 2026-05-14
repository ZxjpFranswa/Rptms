<template>
  <div class="card">
    <DataTable :data="rows" :columns="columns" :page-size="8">
      <template #cell-encodingStatus="{ row }">
        <Badge :variant="row.encodingStatus === 'completed' ? 'success' : 'warning'">
          {{ row.encodingStatus ?? 'draft' }}
        </Badge>
      </template>
      <template #row-actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <button type="button" class="text-sm font-medium text-emerald-600 hover:text-emerald-700" @click="open(row)">
            Open
          </button>
          <button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-700" @click="encode(row)">
            Encode
          </button>
        </div>
      </template>
    </DataTable>
  </div>

  <PropertyDetailModal v-model:open="detailOpen" :property-id="detailPropertyId" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import PropertyDetailModal from '@/components/PropertyDetailModal.vue'
import { usePropertiesStore } from '@/stores/properties'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const propertiesStore = usePropertiesStore()
const toast = useToastStore()

const detailOpen = ref(false)
const detailPropertyId = ref<string | null>(null)

const rows = computed(() => propertiesStore.encodingQueue)

const columns = [
  { key: 'pin', label: 'PIN' },
  { key: 'ownerName', label: 'Owner' },
  { key: 'barangay', label: 'Barangay' },
  { key: 'propertyType', label: 'Property Type' },
  { key: 'encodingStatus', label: 'Encoding Status' },
  { key: 'lastUpdated', label: 'Last Updated' },
]

const open = (row: (typeof rows.value)[0]) => {
  detailPropertyId.value = row.id
  detailOpen.value = true
}

const encode = (row: (typeof rows.value)[0]) => {
  propertiesStore.updateProperty(row.id, { encodingStatus: 'in_progress' })
  toast.push('Encoding session started. Continue in Property Registration.', 'success')
  router.push({ path: '/clerk/property-registration', query: { intake: row.intakeReferenceNo } })
}
</script>
