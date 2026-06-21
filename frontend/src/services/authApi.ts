import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'
import type { User } from '@/stores/auth'

export interface LoginResponse {
  token: string
  user: User
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  const { data } = await useApi().post<LoginResponse>(endpoints.auth.login, { username, password })
  return data
}

export async function logoutApi(): Promise<void> {
  await useApi().post(endpoints.auth.logout)
}

export async function meApi(): Promise<User> {
  const { data } = await useApi().get<{ user: User }>(endpoints.auth.me)
  return data.user
}
