import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return '/login'
      }
      const role = authStore.user?.role
      if (role === 'assessment_clerk') return '/clerk/dashboard'
      if (role === 'assessor') return '/assessor/dashboard'
      if (role === 'administrator') return '/admin/dashboard'
      return '/login'
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresAuth: false, layout: 'blank' },
  },
  // Assessment Clerk Routes
  {
    path: '/clerk',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, roles: ['assessment_clerk'] },
    children: [
      { path: '', redirect: { name: 'ClerkDashboard' } },
      {
        path: 'dashboard',
        name: 'ClerkDashboard',
        component: () => import('@/pages/clerk/DashboardPage.vue'),
      },
      {
        path: 'property-registration',
        name: 'PropertyRegistration',
        component: () => import('@/pages/clerk/PropertyRegistrationPage.vue'),
      },
      {
        path: 'encoding-queue',
        name: 'EncodingQueue',
        component: () => import('@/pages/clerk/EncodingQueuePage.vue'),
      },
      {
        path: 'verification-queue',
        name: 'VerificationQueue',
        component: () => import('@/pages/clerk/VerificationQueuePage.vue'),
      },
      {
        path: 'released-faas',
        name: 'ReleasedFAAS',
        component: () => import('@/pages/clerk/ReleasedFAASPage.vue'),
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/pages/clerk/NotificationsPage.vue'),
      },
    ],
  },
  // Municipal Assessor Routes
  {
    path: '/assessor',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, roles: ['assessor'] },
    children: [
      { path: '', redirect: { name: 'AssessorDashboard' } },
      {
        path: 'dashboard',
        name: 'AssessorDashboard',
        component: () => import('@/pages/assessor/DashboardPage.vue'),
      },
      {
        path: 'review-queue',
        name: 'ReviewQueue',
        component: () => import('@/pages/assessor/ReviewQueuePage.vue'),
      },
      {
        path: 'review/:propertyId',
        name: 'AssessorReview',
        component: () => import('@/pages/assessor/PropertyReviewPage.vue'),
      },
      {
        path: 'approved-properties',
        name: 'ApprovedProperties',
        component: () => import('@/pages/assessor/ApprovedPropertiesPage.vue'),
      },
      {
        path: 'rejected-properties',
        name: 'RejectedProperties',
        component: () => import('@/pages/assessor/RejectedPropertiesPage.vue'),
      },
      {
        path: 'assessments',
        name: 'Assessments',
        component: () => import('@/pages/assessor/AssessmentsPage.vue'),
      },
      {
        path: 'faas-generation',
        name: 'FAASGeneration',
        component: () => import('@/pages/assessor/FAASGenerationPage.vue'),
      },
      {
        path: 'audit-logs',
        name: 'AuditLogs',
        component: () => import('@/pages/assessor/AuditLogsPage.vue'),
      },
    ],
  },
  // Administrator Routes
  {
    path: '/admin',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, roles: ['administrator'] },
    children: [
      { path: '', redirect: { name: 'AdminDashboard' } },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/pages/admin/DashboardPage.vue'),
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('@/pages/admin/UserManagementPage.vue'),
      },
      {
        path: 'audit-logs',
        name: 'AdminAuditLogs',
        component: () => import('@/pages/admin/AuditLogsPage.vue'),
      },
      {
        path: 'system-settings',
        name: 'SystemSettings',
        component: () => import('@/pages/placeholder/PlaceholderPage.vue'),
      },
      {
        path: 'role-permissions',
        name: 'RolePermissions',
        component: () => import('@/pages/placeholder/PlaceholderPage.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth === false) {
    return true
  }

  if (!authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.includes(authStore.user?.role || '')) {
    return { name: 'Login' }
  }

  return true
})

export default router
