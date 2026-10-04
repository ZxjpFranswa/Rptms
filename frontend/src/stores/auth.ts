import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, logoutApi, meApi } from '@/services/authApi'
import { parseApiError } from '@/services/apiError'

export interface User {
  id: string
  username: string
  fullName: string
  role: 'Assessment Clerk' | 'Municipal Assessor' | 'Administrator'
  email: string
  status: 'active' | 'inactive' | 'locked'
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token') || null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)

  const persistSession = (user: User, authToken: string) => {
    currentUser.value = user
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  const clearSession = () => {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      const { token: authToken, user } = await loginApi(username, password)
      persistSession(user, authToken)
      return { success: true as const }
    } catch (error) {
      return { success: false as const, error: parseApiError(error).message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await logoutApi()
      }
    } catch {
      // ignore network errors on logout
    } finally {
      clearSession()
    }
  }

  const initializeAuth = async () => {
    if (!token.value) {
      clearSession()
      return
    }

    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        currentUser.value = JSON.parse(storedUser) as User
      } catch {
        clearSession()
        return
      }
    }

    try {
      const user = await meApi()
      persistSession(user, token.value!)
    } catch {
      clearSession()
    }
  }

  const dashboardPath = computed(() => {
    switch (currentUser.value?.role) {
      case 'Assessment Clerk':
        return '/clerk/dashboard'
      case 'Municipal Assessor':
        return '/assessor/dashboard'
      case 'Administrator':
        return '/admin/dashboard'
      default:
        return '/login'
    }
  })

  return {
    currentUser,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    clearSession,
    dashboardPath,
  }
})
