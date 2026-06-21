<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard title="Draft Applications" :value="draftCount" icon="draft" color="gray" />
      <StatCard title="Under Review" :value="underReviewCount" icon="clock" color="blue" />
      <StatCard title="Returned Applications" :value="returnedCount" icon="alert" color="yellow" />
      <StatCard title="Active Properties" :value="activeCount" icon="check" color="green" />
      <StatCard title="Rejected Applications" :value="rejectedCount" icon="x" color="red" />
    </div>

    <ClerkPropertiesTable />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePropertyStore } from '@/stores/property'
import StatCard from '@/components/dashboard/StatCard.vue'
import ClerkPropertiesTable from '@/components/tables/ClerkPropertiesTable.vue'

const propertyStore = usePropertyStore()

onMounted(async () => {
  try {
    await propertyStore.fetchRegistrations()
  } catch (e) {
    console.error('Failed to fetch registrations:', e)
  }
})

const draftCount = computed(
  () => propertyStore.registrations.filter((r) => r.status === 'Draft').length,
)
const underReviewCount = computed(
  () =>
    propertyStore.registrations.filter(
      (r) => r.status === 'Under_Review',
    ).length,
)
const returnedCount = computed(
  () => propertyStore.registrations.filter((r) => r.status === 'Returned').length,
)
const activeCount = computed(
  () => propertyStore.registrations.filter((r) => r.status === 'Active').length,
)
const rejectedCount = computed(
  () => propertyStore.registrations.filter((r) => r.status === 'Rejected').length,
)
</script>
