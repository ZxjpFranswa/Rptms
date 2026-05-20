import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/auth/LoginView.vue'
import ClerkDashboard from '@/views/clerk/ClerkDashboard.vue'
import NewRegistrationWizard from '@/views/clerk/NewRegistrationWizard.vue'
import RegistrationQueueView from '@/views/clerk/RegistrationQueueView.vue'
import ClerkPropertyDetail from '@/views/clerk/ClerkPropertyDetail.vue'
import AssessorDashboard from '@/views/assessor/AssessorDashboard.vue'
import ApplicationsForReview from '@/views/assessor/ApplicationsForReview.vue'
import PropertyReview from '@/views/assessor/PropertyReview.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import AuditLogsView from '@/views/admin/AuditLogsView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return '/login'
      return authStore.dashboardPath
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/clerk',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Assessment Clerk'], requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'ClerkDashboard', component: ClerkDashboard },
      { path: 'new-registration', name: 'NewRegistration', component: NewRegistrationWizard },
      { path: 'registrations', name: 'RegistrationQueue', component: RegistrationQueueView },
      { path: 'properties/:id', name: 'ClerkPropertyDetail', component: ClerkPropertyDetail },
    ],
  },
  {
    path: '/assessor',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Municipal Assessor'], requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'AssessorDashboard', component: AssessorDashboard },
      { path: 'review/:id', name: 'PropertyReview', component: PropertyReview },
      {
        path: 'applications',
        name: 'ApplicationsList',
        component: ApplicationsForReview,
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Administrator'], requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'users', name: 'UserManagement', component: UserManagement },
      { path: 'settings', name: 'Settings', component: SettingsView },
      { path: 'audit-logs', name: 'AuditLogs', component: AuditLogsView },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: PlaceholderView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth !== false)
  const requiredRole = to.matched.find((r) => r.meta.role)?.meta.role as string[] | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (requiredRole?.length && authStore.isAuthenticated) {
    if (!requiredRole.includes(authStore.currentUser?.role || '')) {
      next('/login')
      return
    }
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    next(authStore.dashboardPath)
    return
  }

  next()
})

export default router
