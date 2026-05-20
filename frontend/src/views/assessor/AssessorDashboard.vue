<template>
  <div class="p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard title="Pending Review" :value="pendingCount" icon="clock" color="blue" />
      <StatCard title="Approved Today" :value="approvedTodayCount" icon="check" color="green" />
      <StatCard title="Returned Today" :value="returnedTodayCount" icon="alert" color="yellow" />
      <StatCard title="Rejected Today" :value="rejectedTodayCount" icon="x" color="red" />
      <StatCard title="Active Properties" :value="activeCount" icon="check-circle" color="emerald" />
    </div>

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-600">Recent applications awaiting your review</p>
      <router-link
        to="/assessor/applications"
        class="text-sm font-semibold text-primary-700 hover:text-primary-800"
      >
        View all applications →
      </router-link>
    </div>

    <AssessorApplicationsTable />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePropertyStore } from '@/stores/property'
import StatCard from '@/components/dashboard/StatCard.vue'
import AssessorApplicationsTable from '@/components/tables/AssessorApplicationsTable.vue'

const propertyStore = usePropertyStore()

onMounted(async () => {
  try {
    await propertyStore.fetchReviewQueue()
  } catch (e) {
    console.error('Failed to fetch review queue:', e)
  }
})

const today = () => new Date().toISOString().split('T')[0]

const pendingCount = computed(() => propertyStore.reviewQueue.length)

const approvedTodayCount = computed(() =>
  propertyStore.registrations.filter(
    (r) => r.status === 'Approved' && r.updatedAt.split('T')[0] === today(),
  ).length,
)

const returnedTodayCount = computed(() =>
  propertyStore.registrations.filter(
    (r) => r.status === 'Returned' && r.updatedAt.split('T')[0] === today(),
  ).length,
)

const rejectedTodayCount = computed(() =>
  propertyStore.registrations.filter(
    (r) => r.status === 'Rejected' && r.updatedAt.split('T')[0] === today(),
  ).length,
)

const activeCount = computed(
  () => propertyStore.registrations.filter((r) => r.status === 'Active').length,
)
</script>
