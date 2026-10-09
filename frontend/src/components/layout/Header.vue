<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0 transition-colors">
    <!-- Left: hamburger + title -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Sidebar toggle button -->
      <button
        @click="toggle"
        class="flex-shrink-0 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="min-w-0">
        <h1 class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{{ pageTitle }}</h1>
        <!-- Breadcrumbs — hidden on very small screens -->
        <nav class="hidden sm:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          <span v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center gap-1">
            <span v-if="index > 0" class="text-gray-400 dark:text-gray-500">/</span>
            <span :class="{ 'text-primary-700 dark:text-primary-400 font-semibold': index === breadcrumbs.length - 1 }">
              {{ crumb }}
            </span>
          </span>
        </nav>
      </div>
    </div>

    <!-- Right: actions -->
    <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
      <!-- Reactive Notifications Dropdown -->
      <NotificationDropdown />

      <!-- Role badge — hidden on small screens -->
      <div class="hidden md:flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ authStore.currentUser?.role }}</span>
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs',
            getRoleBadgeColor(authStore.currentUser?.role),
          ]"
        >
          {{ getRoleAbbrev(authStore.currentUser?.role) }}
        </div>
      </div>

      <!-- Divider — hidden on small screens -->
      <div class="hidden md:block w-px h-8 bg-gray-200 dark:border-gray-700"></div>

      <!-- Profile Dropdown -->
      <div class="relative">
        <button
          @click="showProfileMenu = !showProfileMenu"
          class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/60 px-2 sm:px-3 py-2 rounded-xl transition"
        >
          <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-xs">
            {{ getInitials(authStore.currentUser?.fullName) }}
          </div>
          <svg
            :class="['w-4 h-4 text-gray-600 dark:text-gray-400 transition hidden sm:block', showProfileMenu ? 'rotate-180' : '']"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showProfileMenu"
          class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
        >
          <div class="p-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ authStore.currentUser?.fullName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ authStore.currentUser?.email }}</p>
            <!-- Show role on mobile inside dropdown -->
            <div
              :class="[
                'mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white md:hidden',
                getRoleBadgeColor(authStore.currentUser?.role),
              ]"
            >
              {{ authStore.currentUser?.role }}
            </div>
          </div>

          <button
            @click="showSettingsModal = true; showProfileMenu = false"
            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2.5"
          >
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings & Theme</span>
          </button>

          <button
            @click="showLogoutModal = true; showProfileMenu = false"
            class="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition border-t border-gray-100 dark:border-gray-700 flex items-center gap-2.5"
          >
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- User Settings Modal (Credentials & Theme) -->
  <UserSettingsModal
    :visible="showSettingsModal"
    @close="showSettingsModal = false"
  />

  <!-- Logout Confirmation Modal -->
  <LogoutModal
    :visible="showLogoutModal"
    :loading="logoutLoading"
    @confirm="handleLogout"
    @cancel="showLogoutModal = false"
  />
</template>

<script setup lang="ts">
defineOptions({ name: 'AppHeader' })
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSidebar } from '@/composables/useSidebar'
import LogoutModal from '@/components/common/LogoutModal.vue'
import UserSettingsModal from '@/components/common/UserSettingsModal.vue'
import NotificationDropdown from '@/components/layout/NotificationDropdown.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showProfileMenu = ref(false)
const showSettingsModal = ref(false)
const showLogoutModal = ref(false)
const logoutLoading = ref(false)
const { isCollapsed, toggle } = useSidebar()

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/clerk/dashboard': 'Clerk Dashboard',
    '/clerk/new-registration': 'New Registration',
    '/clerk/registrations': 'Properties',
    '/clerk/properties': 'Property Details',
    '/assessor/dashboard': 'Assessor Dashboard',
    '/assessor/applications': 'Applications',
    '/assessor/review': 'Property Review',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'User Management',
    '/admin/settings': 'Settings',
    '/admin/audit-logs': 'Audit Logs',
    '/revenue/dashboard': 'Revenue Clerk Dashboard',
    '/revenue/bills': 'Tax Bills Management',
    '/revenue/soas': 'Statements of Account',
    '/revenue/delinquents': 'Delinquent Accounts',
    '/treasurer/dashboard': 'Treasurer Dashboard',
    '/treasurer/penalty-approvals': 'Penalty Approvals',
    '/treasurer/correction-approvals': 'Payment Corrections',
    '/treasurer/reports': 'Collection Reports',
    '/cashier/dashboard': 'Cashier Terminal',
    '/cashier/desk': 'Collection Desk',
    '/cashier/receipts': 'Official Receipts Register',
    '/taxpayer/portal': 'Taxpayer Portal',
  }
  if (route.name === 'PropertyReview') return 'Application Review'
  if (route.name === 'ClerkPropertyDetail') return 'Property Details'
  return titleMap[route.path] || 'Dashboard'
})

const breadcrumbs = computed(() => {
  const path = route.path
  const parts = path.split('/').filter((p) => p)

  const labels: Record<string, string> = {
    clerk: 'Assessment Clerk',
    assessor: 'Assessor',
    admin: 'Administrator',
    revenue: 'Revenue Office',
    treasurer: 'Municipal Treasury',
    cashier: 'Cashier Station',
    taxpayer: 'Taxpayer Portal',
    dashboard: 'Dashboard',
    'new-registration': 'New Registration',
    registrations: 'Properties',
    properties: 'Property',
    applications: 'Applications',
    review: 'Review',
    users: 'Users',
    settings: 'Settings',
    'audit-logs': 'Audit Logs',
    bills: 'Tax Bills',
    soas: 'Statements of Account',
    delinquents: 'Delinquent Accounts',
    'penalty-approvals': 'Penalty Approvals',
    'correction-approvals': 'Payment Corrections',
    reports: 'Reports',
    desk: 'Collection Desk',
    receipts: 'Official Receipts',
    portal: 'Portal',
  }

  return parts.map((part, i) => {
    if (labels[part]) return labels[part]
    if (parts[i - 1] === 'review') return 'Application Detail'
    return part
  })
})

const getRoleBadgeColor = (role?: string) => {
  switch (role) {
    case 'Assessment Clerk': return 'bg-blue-600'
    case 'Municipal Assessor': return 'bg-purple-600'
    case 'Administrator': return 'bg-red-600'
    case 'Revenue Clerk': return 'bg-amber-600'
    case 'Treasurer': return 'bg-emerald-600'
    case 'Cashier': return 'bg-teal-600'
    case 'Taxpayer': return 'bg-indigo-600'
    default: return 'bg-gray-600'
  }
}

const getRoleAbbrev = (role?: string) => {
  switch (role) {
    case 'Assessment Clerk': return 'AC'
    case 'Municipal Assessor': return 'MA'
    case 'Administrator': return 'AD'
    case 'Revenue Clerk': return 'RC'
    case 'Treasurer': return 'TR'
    case 'Cashier': return 'CS'
    case 'Taxpayer': return 'TP'
    default: return 'US'
  }
}

const getInitials = (name?: string) => {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleLogout = async () => {
  logoutLoading.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } finally {
    logoutLoading.value = false
    showLogoutModal.value = false
  }
}
</script>
