<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <aside
      class="w-64 shrink-0 border-r border-emerald-900/70 bg-gradient-to-b from-emerald-950 via-emerald-950 to-emerald-950 text-emerald-50 shadow-[inset_-1px_0_0_0_rgba(16,185,129,0.12)]"
    >
      <div class="flex h-full min-h-screen flex-col">
        <div class="border-b border-emerald-800/50 px-6 py-6">
          <div class="flex items-center gap-2">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <LandPlot class="h-5 w-5 text-emerald-300" :stroke-width="2" aria-hidden="true" />
            </span>
            <div>
              <h1 class="text-xl font-bold tracking-tight text-white">RPRAMS</h1>
              <p class="text-xs text-emerald-300/80">LGU Real Property System</p>
            </div>
          </div>
        </div>

        <div class="border-b border-emerald-800/50 px-6 py-4">
          <p class="text-sm font-medium text-emerald-50">{{ authStore.user?.fullName }}</p>
          <p class="text-xs text-emerald-400/90">{{ getRoleLabel(authStore.user?.role) }}</p>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-6">
          <div v-for="group in menuItems" :key="group.label" class="mb-6">
            <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-500/90">
              {{ group.label }}
            </p>
            <div class="space-y-1">
              <router-link
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive(item.to)
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                    : 'text-emerald-100/90 hover:bg-emerald-900/55 hover:text-white',
                ]"
              >
                <component
                  :is="item.icon"
                  class="h-5 w-5 shrink-0 opacity-95"
                  :stroke-width="2"
                  aria-hidden="true"
                />
                <span>{{ item.label }}</span>
              </router-link>
            </div>
          </div>
        </nav>

        <div class="border-t border-emerald-800/50 px-3 py-6">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-emerald-100/90 transition-colors hover:bg-emerald-900/55 hover:text-white"
            @click="logout"
          >
            <LogOut class="h-5 w-5 shrink-0" :stroke-width="2" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <header
        class="flex shrink-0 items-center justify-between gap-4 border-b border-emerald-200/60 bg-white px-6 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/25 lg:px-8"
      >
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-xl font-bold text-emerald-950 dark:text-emerald-50 lg:text-2xl">
            {{ pageTitle }}
          </h2>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-emerald-200/80 bg-white p-2 text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
            :title="theme.dark ? 'Light mode' : 'Dark mode'"
            @click="theme.toggle()"
          >
            <Sun v-if="theme.dark" class="h-5 w-5" :stroke-width="2" />
            <Moon v-else class="h-5 w-5" :stroke-width="2" />
          </button>
          <button
            type="button"
            class="relative rounded-lg border border-emerald-200/80 bg-white p-2 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
            title="Notifications"
          >
            <Bell class="h-5 w-5" :stroke-width="2" />
            <span
              class="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-emerald-950"
            />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-auto">
        <div class="mx-auto max-w-7xl p-6 lg:p-8">
          <Breadcrumbs v-if="breadcrumbItems.length" :items="breadcrumbItems" />
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  LandPlot,
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  ShieldCheck,
  FileOutput,
  Inbox,
  CircleCheck,
  CircleX,
  ChartColumn,
  FileSpreadsheet,
  ScrollText,
  Users,
  Settings,
  KeyRound,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import type { BreadcrumbItem } from '@/components/Breadcrumbs.vue'

interface NavItem {
  label: string
  to: string
  icon: Component
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const theme = useThemeStore()

const pageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    ClerkDashboard: 'Dashboard',
    AssessorDashboard: 'Dashboard',
    AdminDashboard: 'Dashboard',
    PropertyRegistration: 'Property Registration',
    EncodingQueue: 'Encoding Queue',
    VerificationQueue: 'Verification Queue',
    ReleasedFAAS: 'Released FAAS',
    Notifications: 'Notifications',
    ReviewQueue: 'Review Queue',
    AssessorReview: 'Review Application',
    ApprovedProperties: 'Approved Properties',
    RejectedProperties: 'Rejected Properties',
    Assessments: 'Assessments',
    FAASGeneration: 'FAAS Generation',
    AuditLogs: 'Audit Logs',
    UserManagement: 'User Management',
    AdminAuditLogs: 'Audit Logs',
    SystemSettings: 'System Settings',
    RolePermissions: 'Role Permissions',
  }
  return titleMap[route.name as string] || 'Dashboard'
})

const homePath = computed(() => {
  if (route.path.startsWith('/clerk')) return '/clerk/dashboard'
  if (route.path.startsWith('/assessor')) return '/assessor/dashboard'
  if (route.path.startsWith('/admin')) return '/admin/dashboard'
  return '/'
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const name = route.name as string
  if (['ClerkDashboard', 'AssessorDashboard', 'AdminDashboard'].includes(name)) {
    return [{ label: 'Dashboard', to: homePath.value }]
  }
  if (name === 'AssessorReview') {
    return [
      { label: 'Dashboard', to: '/assessor/dashboard' },
      { label: 'Review Queue', to: '/assessor/review-queue' },
      { label: pageTitle.value },
    ]
  }
  return [{ label: 'Dashboard', to: homePath.value }, { label: pageTitle.value }]
})

const clerkMenu: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/clerk/dashboard', icon: LayoutDashboard },
      { label: 'Property Registration', to: '/clerk/property-registration', icon: ClipboardList },
      { label: 'Encoding Queue', to: '/clerk/encoding-queue', icon: ListChecks },
      { label: 'Verification Queue', to: '/clerk/verification-queue', icon: ShieldCheck },
      { label: 'Released FAAS', to: '/clerk/released-faas', icon: FileOutput },
      { label: 'Notifications', to: '/clerk/notifications', icon: Bell },
    ],
  },
]

const assessorMenu: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/assessor/dashboard', icon: LayoutDashboard },
      { label: 'Review Queue', to: '/assessor/review-queue', icon: Inbox },
      { label: 'Approved Properties', to: '/assessor/approved-properties', icon: CircleCheck },
      { label: 'Rejected Properties', to: '/assessor/rejected-properties', icon: CircleX },
      { label: 'Assessments', to: '/assessor/assessments', icon: ChartColumn },
      { label: 'FAAS Generation', to: '/assessor/faas-generation', icon: FileSpreadsheet },
      { label: 'Audit Logs', to: '/assessor/audit-logs', icon: ScrollText },
    ],
  },
]

const adminMenu: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User Management', to: '/admin/user-management', icon: Users },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
      { label: 'System Settings', to: '/admin/system-settings', icon: Settings },
      { label: 'Role Permissions', to: '/admin/role-permissions', icon: KeyRound },
    ],
  },
]

const menuItems = computed(() => {
  const role = authStore.user?.role
  if (role === 'assessment_clerk') return clerkMenu
  if (role === 'assessor') return assessorMenu
  if (role === 'administrator') return adminMenu
  return []
})

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)

const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    assessment_clerk: 'Assessment Clerk',
    assessor: 'Municipal Assessor',
    administrator: 'Administrator',
  }
  return labels[role || ''] || 'User'
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
