import axios, { type AxiosInstance } from 'axios'
import { API_BASE } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

let apiClient: AxiosInstance | null = null
let interceptorsRegistered = false

export function useApi(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_BASE,
      headers: { Accept: 'application/json' },
    })
  }

  if (!interceptorsRegistered) {
    interceptorsRegistered = true

    apiClient.interceptors.request.use((config) => {
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    })

    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status
        const authStore = useAuthStore()

        if (status === 401) {
          authStore.clearSession()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      },
    )
  }

  return apiClient
}
