<template>
  <div class="p-6">
    <ClerkPropertiesTable />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePropertyStore } from '@/stores/property'
import ClerkPropertiesTable from '@/components/tables/ClerkPropertiesTable.vue'

const propertyStore = usePropertyStore()

onMounted(async () => {
  try {
    await propertyStore.fetchRegistrations()
  } catch (e) {
    console.error('Failed to fetch registrations:', e)
  }
})
</script>
