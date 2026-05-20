<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Review queue</h2>
        <p class="text-sm text-gray-600 mt-1">
          {{ pendingCount }} application{{ pendingCount === 1 ? '' : 's' }} pending assessor action
        </p>
      </div>
      <router-link
        to="/assessor/dashboard"
        class="text-sm font-medium text-primary-700 hover:text-primary-800"
      >
        Back to dashboard
      </router-link>
    </div>

    <AssessorApplicationsTable />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePropertyStore } from '@/stores/property'
import AssessorApplicationsTable from '@/components/tables/AssessorApplicationsTable.vue'

const propertyStore = usePropertyStore()
const pendingCount = computed(() => propertyStore.reviewQueue.length)

onMounted(() => {
  void propertyStore.fetchReviewQueue()
})
</script>
