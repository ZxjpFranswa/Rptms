import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'
import type { SystemUser } from '@/stores/users'

export async function fetchUsers(): Promise<SystemUser[]> {
  const { data } = await useApi().get<SystemUser[]>(endpoints.users)
  return data
}

export async function createUserApi(user: SystemUser & { password?: string }): Promise<SystemUser> {
  const { data } = await useApi().post<SystemUser>(endpoints.users, user)
  return data
}

export async function updateUserApi(
  id: string,
  user: Partial<SystemUser> & { password?: string },
): Promise<SystemUser> {
  const { data } = await useApi().patch<SystemUser>(`${endpoints.users}/${id}`, user)
  return data
}

export async function updateUserStatusApi(
  id: string,
  status: SystemUser['status'],
): Promise<SystemUser> {
  const { data } = await useApi().patch<SystemUser>(`${endpoints.users}/${id}/status`, { status })
  return data
}
