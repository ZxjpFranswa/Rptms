import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/stores/auth'
import {
  fetchUsers,
  createUserApi,
  updateUserApi,
  updateUserStatusApi,
} from '@/services/usersApi'
import { parseApiError } from '@/services/apiError'

export interface SystemUser extends User {
  lastLogin?: string
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<SystemUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    try {
      users.value = await fetchUsers()
    } catch (e) {
      error.value = parseApiError(e).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = async (id: string, status: User['status']) => {
    const updated = await updateUserStatusApi(id, status)
    const index = users.value.findIndex((u) => u.id === id)
    if (index >= 0) users.value[index] = updated
    return updated
  }

  const saveUser = async (user: SystemUser & { password?: string }) => {
    const isNew = !users.value.some((u) => u.id === user.id)
    const saved = isNew
      ? await createUserApi(user)
      : await updateUserApi(user.id, user)

    const index = users.value.findIndex((u) => u.id === saved.id)
    if (index >= 0) {
      users.value[index] = saved
    } else {
      users.value.push(saved)
    }
    return saved
  }

  return { users, loading, error, fetchAll, updateUserStatus, saveUser }
})
