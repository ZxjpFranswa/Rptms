<template>
  <div class="space-y-8">
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Total Users</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ userCount }}</p>
            <p class="mt-1 text-sm text-emerald-600">↑ 2 active today</p>
          </div>
          <div class="rounded-xl bg-emerald-100 p-3">
            <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Active Sessions</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">7</p>
            <p class="mt-1 text-sm text-blue-600">⚡ Connected now</p>
          </div>
          <div class="rounded-xl bg-blue-100 p-3">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Audit Activities</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ auditCount }}</p>
            <p class="mt-1 text-sm text-amber-600">📊 This week</p>
          </div>
          <div class="rounded-xl bg-amber-100 p-3">
            <svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">System Health</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">99.8%</p>
            <p class="mt-1 text-sm text-green-600">✓ All systems operational</p>
          </div>
          <div class="rounded-xl bg-green-100 p-3">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/admin/user-management" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-emerald-100 p-3">
            <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H6v-2z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">User Management</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">Manage {{ userCount }} directory users</p>
          </div>
        </div>
      </router-link>

      <router-link to="/admin/audit-logs" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-blue-100 p-3">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Audit Logs</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ auditCount }} log entries</p>
          </div>
        </div>
      </router-link>

      <router-link to="/admin/system-settings" class="card hover:shadow-soft-lg transition-all">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-purple-100 p-3">
            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">System Settings</h4>
            <p class="text-sm text-slate-600">Configure system</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDirectoryUserStore } from '@/stores/directoryUsers'
import { useAuditLogStore } from '@/stores/auditLog'

const usersStore = useDirectoryUserStore()
const auditStore = useAuditLogStore()

const userCount = computed(() => usersStore.users.length)
const auditCount = computed(() => auditStore.entries.length)
</script>
