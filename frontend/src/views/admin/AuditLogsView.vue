<template>
  <div class="p-6 space-y-6">
    <div class="bg-white rounded-xl shadow-md p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input
            v-model="filterDateFrom"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">User</label>
          <input
            v-model="filterUser"
            type="text"
            placeholder="Filter by user..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
          <select
            v-model="filterAction"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="">All Actions</option>
            <option v-for="action in actionTypes" :key="action" :value="action">
              {{ action }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <DataTable
      title="Audit Logs"
      :columns="auditColumns"
      :data="filteredLogs"
      :show-export="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuditStore } from '@/stores/audit'
import DataTable, { type Column } from '@/components/tables/DataTable.vue'

const auditStore = useAuditStore()

onMounted(() => {
  void auditStore.fetchLogs()
})

const filterDateFrom = ref('')
const filterUser = ref('')
const filterAction = ref('')

const auditColumns: Column[] = [
  { key: 'user', label: 'User', sortable: true },
  { key: 'action', label: 'Transaction Type', sortable: true },
  { key: 'timestamp', label: 'Date', type: 'date', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'previousValue', label: 'Previous Value' },
  { key: 'newValue', label: 'New Value' },
]

const actionTypes = computed(() => [...new Set(auditStore.logs.map((l) => l.action))])

const filteredLogs = computed(() => {
  return auditStore.logs.filter((log) => {
    const matchesUser =
      !filterUser.value || log.user.toLowerCase().includes(filterUser.value.toLowerCase())
    const matchesAction = !filterAction.value || log.action === filterAction.value
    const matchesDate =
      !filterDateFrom.value || log.timestamp.split('T')[0] >= filterDateFrom.value
    return matchesUser && matchesAction && matchesDate
  })
})
</script>
