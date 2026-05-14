import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: 'assessment_clerk' | 'assessor' | 'administrator'
  accountStatus: 'active' | 'inactive' | 'locked'
  lastLogin?: string
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem('user')
  if (!raw || raw === 'null') return null
  try {
    return JSON.parse(raw) as User
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(readStoredUser())

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = (loginToken: string, userData: User) => {
    token.value = loginToken
    user.value = userData
    localStorage.setItem('token', loginToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    setUser,
  }
})
