<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" :value="totalUsers" icon="users" color="blue" />
      <StatCard title="Active Sessions" :value="activeSessions" icon="activity" color="green" />
      <StatCard title="Total Properties" :value="totalProperties" icon="home" color="primary" />
      <StatCard title="Audit Events" :value="auditEvents" icon="log" color="purple" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <router-link
        to="/admin/users"
        class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-900">User Management</h3>
        <p class="text-sm text-gray-600 mt-2">Manage clerk, assessor, and admin accounts</p>
      </router-link>
      <router-link
        to="/admin/audit-logs"
        class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-900">Audit Logs</h3>
        <p class="text-sm text-gray-600 mt-2">View system transaction history and filters</p>
      </router-link>
    </div>

    <DataTable
      title="Recent Audit Activity"
      :columns="auditColumns"
      :data="recentAudit"
      :show-export="false"
      :items-per-page="5"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePropertyStore } from '@/stores/property'
import { useUsersStore } from '@/stores/users'
import { useAuditStore } from '@/stores/audit'
import DataTable, { type Column } from '@/components/tables/DataTable.vue'
import StatCard from '@/components/dashboard/StatCard.vue'

const propertyStore = usePropertyStore()
const usersStore = useUsersStore()
const auditStore = useAuditStore()

onMounted(() => {
  void usersStore.fetchAll()
  void auditStore.fetchLogs()
})

const auditColumns: Column[] = [
  { key: 'user', label: 'User', sortable: true },
  { key: 'action', label: 'Transaction Type', sortable: true },
  { key: 'timestamp', label: 'Date', type: 'date', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
]

const totalUsers = computed(() => usersStore.users.length)
const activeSessions = computed(
  () => usersStore.users.filter((u) => u.status === 'active').length,
)
const totalProperties = computed(() => propertyStore.registrations.length)
const auditEvents = computed(() => auditStore.logs.length)
const recentAudit = computed(() => auditStore.logs.slice(0, 10))
</script>
