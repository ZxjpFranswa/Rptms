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
import ClerkAssessmentsView from '@/views/clerk/ClerkAssessmentsView.vue'
import AssessorAssessmentsView from '@/views/assessor/AssessorAssessmentsView.vue'

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
      { path: 'assessments', name: 'ClerkAssessments', component: ClerkAssessmentsView },
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
      { path: 'assessments', name: 'AssessorAssessments', component: AssessorAssessmentsView },
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
    path: '/revenue',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Revenue Clerk', 'Administrator'], requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'RevenueDashboard', component: () => import('@/views/revenue/RevenueDashboard.vue') },
      { path: 'bills', name: 'RevenueTaxBills', component: () => import('@/views/revenue/TaxBillsView.vue') },
      { path: 'soas', name: 'RevenueSoas', component: () => import('@/views/revenue/SoaManagementView.vue') },
      { path: 'delinquents', name: 'RevenueDelinquents', component: () => import('@/views/revenue/DelinquentAccountsView.vue') },
    ],
  },
  {
    path: '/treasurer',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Treasurer', 'Administrator'], requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'TreasurerDashboard', component: () => import('@/views/treasurer/TreasurerDashboard.vue') },
      { path: 'penalty-approvals', name: 'PenaltyApprovals', component: () => import('@/views/treasurer/PenaltyApprovalsView.vue') },
      { path: 'correction-approvals', name: 'CorrectionApprovals', component: () => import('@/views/treasurer/CorrectionApprovalsView.vue') },
      { path: 'reports', name: 'CollectionReports', component: () => import('@/views/treasurer/CollectionReportsView.vue') },
    ],
  },
  {
    path: '/cashier',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Cashier', 'Administrator'], requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'CashierDashboard', component: () => import('@/views/cashier/CashierDashboard.vue') },
      { path: 'desk', name: 'CashierDesk', component: () => import('@/views/cashier/CashierCollectionDesk.vue') },
      { path: 'receipts', name: 'OfficialReceipts', component: () => import('@/views/cashier/OfficialReceiptsView.vue') },
    ],
  },
  {
    path: '/taxpayer',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { role: ['Taxpayer', 'Administrator'], requiresAuth: true },
    children: [
      { path: 'portal', name: 'TaxpayerPortal', component: () => import('@/views/taxpayer/TaxpayerPortalView.vue') },
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
