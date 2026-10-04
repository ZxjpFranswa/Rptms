<template>
  <div
    :class="[
      'h-full flex flex-col bg-primary-800 text-white transition-all duration-300 ease-in-out',
      // On desktop: collapse to icon-only
      !isMobile && isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Logo / Header -->
    <div
      :class="[
        'flex items-center border-b border-primary-700 transition-all duration-300 flex-shrink-0',
        !isMobile && isCollapsed ? 'p-3 justify-center' : 'p-4 gap-3',
      ]"
    >
      <AppLogo class="flex-shrink-0" />

      <div
        :class="[
          'overflow-hidden transition-all duration-300',
          !isMobile && isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100',
        ]"
      >
        <h1 class="font-bold text-base whitespace-nowrap">Magarao Office</h1>
        <p class="text-xs text-primary-200 whitespace-nowrap">RPTMS</p>
      </div>

      <!-- Collapse toggle (desktop expanded) -->
      <button
        v-if="!isMobile && !isCollapsed"
        @click="toggle"
        class="ml-auto p-1.5 rounded-lg hover:bg-primary-700 transition text-primary-200 hover:text-white flex-shrink-0"
        title="Collapse sidebar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <!-- Close button on mobile -->
      <button
        v-if="isMobile"
        @click="closeMobile"
        class="ml-auto p-1.5 rounded-lg hover:bg-primary-700 transition text-primary-200 hover:text-white flex-shrink-0"
        title="Close menu"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Expand toggle — only desktop collapsed mode -->
    <button
      v-if="!isMobile && isCollapsed"
      @click="toggle"
      class="mx-auto mt-3 p-1.5 rounded-lg hover:bg-primary-700 transition text-primary-200 hover:text-white flex-shrink-0"
      title="Expand sidebar"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">

      <!-- Assessment Clerk -->
      <template v-if="authStore.currentUser?.role === 'Assessment Clerk'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/clerk/dashboard"
          label="Dashboard"
          :active="isActive('/clerk/dashboard')"
          @click="closeMobileIfMobile"
        />
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/clerk/new-registration"
          label="New Registration"
          :active="isActive('/clerk/new-registration')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/clerk/registrations"
          label="Properties"
          :active="isActive('/clerk/registrations')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/clerk/assessments"
          label="Appraisals & Assessments"
          :active="isActive('/clerk/assessments')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </template>
        </NavItem>
      </template>

      <!-- Municipal Assessor -->
      <template v-if="authStore.currentUser?.role === 'Municipal Assessor'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/assessor/dashboard"
          label="Dashboard"
          :active="isActive('/assessor/dashboard')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/assessor/applications"
          label="Applications"
          :active="isActive('/assessor/applications')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/assessor/assessments"
          label="Assessment Reviews"
          :active="isActive('/assessor/assessments')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </NavItem>
      </template>

      <!-- Administrator -->
      <template v-if="authStore.currentUser?.role === 'Administrator'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/admin/dashboard"
          label="Dashboard"
          :active="isActive('/admin/dashboard')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/admin/users"
          label="User Management"
          :active="isActive('/admin/users')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.666" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/admin/audit-logs"
          label="Audit Logs"
          :active="isActive('/admin/audit-logs')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/admin/settings"
          label="Settings"
          :active="isActive('/admin/settings')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </NavItem>
      </template>

      <!-- Revenue Clerk -->
      <template v-if="authStore.currentUser?.role === 'Revenue Clerk'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/revenue/dashboard"
          label="Dashboard"
          :active="isActive('/revenue/dashboard')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/revenue/bills"
          label="Tax Bills"
          :active="isActive('/revenue/bills')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/revenue/soas"
          label="Statements of Account"
          :active="isActive('/revenue/soas')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/revenue/delinquents"
          label="Delinquent Accounts"
          :active="isActive('/revenue/delinquents')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </template>
        </NavItem>
      </template>

      <!-- Municipal Treasurer -->
      <template v-if="authStore.currentUser?.role === 'Treasurer'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/treasurer/dashboard"
          label="Dashboard"
          :active="isActive('/treasurer/dashboard')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/treasurer/penalty-approvals"
          label="Penalty Approvals"
          :active="isActive('/treasurer/penalty-approvals')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/treasurer/correction-approvals"
          label="Payment Corrections"
          :active="isActive('/treasurer/correction-approvals')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/treasurer/reports"
          label="Collection Reports"
          :active="isActive('/treasurer/reports')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </NavItem>
      </template>

      <!-- Cashier -->
      <template v-if="authStore.currentUser?.role === 'Cashier'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/cashier/dashboard"
          label="Dashboard"
          :active="isActive('/cashier/dashboard')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/cashier/desk"
          label="Collection Desk"
          :active="isActive('/cashier/desk')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </template>
        </NavItem>
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/cashier/receipts"
          label="Official Receipts"
          :active="isActive('/cashier/receipts')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </template>
        </NavItem>
      </template>

      <!-- Taxpayer -->
      <template v-if="authStore.currentUser?.role === 'Taxpayer'">
        <NavItem
          :collapsed="!isMobile && isCollapsed"
          to="/taxpayer/portal"
          label="Taxpayer Portal"
          :active="isActive('/taxpayer/portal')"
          @click="closeMobileIfMobile"
        >
          <template #icon>
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </template>
        </NavItem>
      </template>
    </nav>

    <!-- User Profile Section -->
    <div class="border-t border-primary-700 p-3 space-y-2 flex-shrink-0">
      <div
        v-if="isMobile || !isCollapsed"
        class="px-3 py-2 bg-primary-700 rounded-xl"
      >
        <p class="text-xs text-primary-200 mb-0.5">SIGNED IN AS</p>
        <p class="font-semibold text-sm text-white truncate">{{ authStore.currentUser?.fullName }}</p>
        <p class="text-xs text-primary-200 truncate">{{ authStore.currentUser?.role }}</p>
      </div>

      <div
        v-else
        class="flex justify-center"
        :title="authStore.currentUser?.fullName"
      >
        <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs">
          {{ getInitials(authStore.currentUser?.fullName) }}
        </div>
      </div>

      <button
        @click="showLogoutModal = true"
        :class="[
          'w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition text-sm',
          !isMobile && isCollapsed ? 'justify-center p-2' : 'justify-center px-4 py-2',
        ]"
        :title="!isMobile && isCollapsed ? 'Logout' : undefined"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span
          :class="[
            'overflow-hidden whitespace-nowrap transition-all duration-300',
            !isMobile && isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          ]"
        >
          Logout
        </span>
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
    <LogoutModal
      :visible="showLogoutModal"
      :loading="logoutLoading"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppSidebar' })
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSidebar } from '@/composables/useSidebar'
import AppLogo from '@/components/common/AppLogo.vue'
import NavItem from '@/components/layout/NavItem.vue'
import LogoutModal from '@/components/common/LogoutModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isCollapsed, isMobile, toggle, closeMobile } = useSidebar()

const isActive = (path: string) => route.path.includes(path)

const closeMobileIfMobile = () => {
  if (isMobile.value) closeMobile()
}

const getInitials = (name?: string) => {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const showLogoutModal = ref(false)
const logoutLoading = ref(false)

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
