<template>
  <div>
    <DataTable
      title="Properties"
      :columns="columns"
      :data="propertyStore.registrations"
      :actions="clerkTableActions"
      status-filter-key="status"
      @action="handleTableAction"
    >
      <template #toolbar-actions>
        <router-link
          to="/clerk/new-registration"
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition"
        >
          <PlusIcon class="w-4 h-4" />
          New Registration
        </router-link>
      </template>
    </DataTable>

    <ClerkActionOverlays />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { usePropertyStore } from '@/stores/property'
import DataTable, { type Column } from '@/components/tables/DataTable.vue'
import ClerkActionOverlays from '@/components/clerk/ClerkActionOverlays.vue'
import { useClerkPropertyActions } from '@/composables/useClerkPropertyActions'

const propertyStore = usePropertyStore()
const { clerkTableActions, handleTableAction } = useClerkPropertyActions()

const columns: Column[] = [
  { key: 'intakeRef', label: 'Intake Ref #', sortable: true },
  { key: 'taxpayerName', label: 'Taxpayer Name', sortable: true },
  { key: 'propertyType', label: 'Property Type', sortable: true },
  { key: 'barangay', label: 'Barangay', sortable: true },
  { key: 'submissionDate', label: 'Submission Date', type: 'date', sortable: true },
  { key: 'status', label: 'Status', type: 'status', sortable: true },
  { key: 'lastAssessorAction', label: 'Last Assessor Action' },
  { key: 'remarks', label: 'Remarks' },
]
</script>
