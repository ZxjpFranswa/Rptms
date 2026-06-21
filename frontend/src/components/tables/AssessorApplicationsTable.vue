<template>
  <DataTable
    title="Applications for Review"
    :columns="columns"
    :data="rows"
    :actions="actions"
    status-filter-key="status"
    :loading="loading"
    @action="onAction"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore, type PropertyApplication } from '@/stores/property'
import DataTable, { type Column, type Action } from '@/components/tables/DataTable.vue'

interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const router = useRouter()
const propertyStore = usePropertyStore()

const columns: Column[] = [
  { key: 'intakeRef', label: 'Intake Ref', sortable: true },
  { key: 'taxpayerName', label: 'Taxpayer', sortable: true },
  { key: 'propertyType', label: 'Property Type', sortable: true },
  { key: 'submissionDate', label: 'Submission Date', type: 'date', sortable: true },
  { key: 'verificationStatus', label: 'Verification Status', sortable: true },
  { key: 'exemption', label: 'Exemption', sortable: true },
  { key: 'status', label: 'Current Status', type: 'status', sortable: true },
]

const actions: Action[] = [
  { label: 'Review' },
  { label: 'Approve', when: (row) => row.status === 'Under_Review' },
  { label: 'Return', when: (row) => row.status === 'Under_Review' },
  { label: 'Reject', when: (row) => row.status === 'Under_Review' },
]

const rows = computed(() =>
  propertyStore.reviewQueue.map((app) => ({
    ...app,
    exemption: app.taxExempt
      ? `Yes${app.exemptionNotes ? ` — ${app.exemptionNotes}` : ''}`
      : 'No',
  })),
)

const onAction = (action: Action, row: Record<string, unknown>) => {
  const app = row as unknown as PropertyApplication

  switch (action.label) {
    case 'Review':
    case 'Approve':
    case 'Return':
    case 'Reject':
      router.push({ name: 'PropertyReview', params: { id: app.id } })
      break
  }
}
</script>
