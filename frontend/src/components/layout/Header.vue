<template>
  <header class="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0">
    <!-- Left: hamburger + title -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Sidebar toggle button -->
      <button
        @click="toggle"
        class="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="min-w-0">
        <h1 class="text-lg sm:text-2xl font-bold text-gray-900 truncate">{{ pageTitle }}</h1>
        <!-- Breadcrumbs — hidden on very small screens -->
        <nav class="hidden sm:flex items-center gap-1 text-sm text-gray-600 mt-0.5">
          <span v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center gap-1">
            <span v-if="index > 0" class="text-gray-400">/</span>
            <span :class="{ 'text-primary-700 font-semibold': index === breadcrumbs.length - 1 }">
              {{ crumb }}
            </span>
          </span>
        </nav>
      </div>
    </div>

    <!-- Right: actions -->
    <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
      <!-- Notifications -->
      <button class="relative text-gray-600 hover:text-gray-900 transition p-2 rounded-lg hover:bg-gray-100">
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- Role badge — hidden on small screens -->
      <div class="hidden md:flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">{{ authStore.currentUser?.role }}</span>
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold text-white',
            getRoleBadgeColor(authStore.currentUser?.role),
          ]"
        >
          {{ getRoleAbbrev(authStore.currentUser?.role) }}
        </div>
      </div>

      <!-- Divider — hidden on small screens -->
      <div class="hidden md:block w-px h-8 bg-gray-200"></div>

      <!-- Profile Dropdown -->
      <div class="relative">
        <button
          @click="showProfileMenu = !showProfileMenu"
          class="flex items-center gap-2 hover:bg-gray-100 px-2 sm:px-3 py-2 rounded-lg transition"
        >
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {{ getInitials(authStore.currentUser?.fullName) }}
          </div>
          <svg
            :class="['w-4 h-4 text-gray-600 transition hidden sm:block', showProfileMenu ? 'rotate-180' : '']"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showProfileMenu"
          class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
        >
          <div class="p-3 border-b border-gray-100">
            <p class="text-sm font-semibold text-gray-900">{{ authStore.currentUser?.fullName }}</p>
            <p class="text-xs text-gray-600">{{ authStore.currentUser?.email }}</p>
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
          <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
            View Profile
          </button>
          <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition border-t border-gray-100">
            Settings
          </button>
          <button
            @click="showLogoutModal = true; showProfileMenu = false"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100 rounded-b-xl"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>

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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showProfileMenu = ref(false)
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
    dashboard: 'Dashboard',
    'new-registration': 'New Registration',
    registrations: 'Properties',
    properties: 'Property',
    applications: 'Applications',
    review: 'Review',
    users: 'Users',
    settings: 'Settings',
    'audit-logs': 'Audit Logs',
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
    default: return 'bg-gray-600'
  }
}

const getRoleAbbrev = (role?: string) => {
  switch (role) {
    case 'Assessment Clerk': return 'AC'
    case 'Municipal Assessor': return 'MA'
    case 'Administrator': return 'AD'
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
