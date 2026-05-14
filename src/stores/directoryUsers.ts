import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DirectoryRole = 'assessment_clerk' | 'assessor' | 'administrator'
export type DirectoryAccountStatus = 'active' | 'inactive' | 'locked'

export interface DirectoryUser {
  id: string
  fullName: string
  username: string
  role: DirectoryRole
  accountStatus: DirectoryAccountStatus
  lastLogin: string
}

export const useDirectoryUserStore = defineStore('directoryUsers', () => {
  const users = ref<DirectoryUser[]>([
    {
      id: '1',
      fullName: 'Anna Clerk',
      username: 'clerk',
      role: 'assessment_clerk',
      accountStatus: 'active',
      lastLogin: '2026-05-14T08:00:00',
    },
    {
      id: '2',
      fullName: 'Maria Assessor',
      username: 'assessor',
      role: 'assessor',
      accountStatus: 'active',
      lastLogin: '2026-05-13T11:20:00',
    },
    {
      id: '3',
      fullName: 'Admin User',
      username: 'admin',
      role: 'administrator',
      accountStatus: 'active',
      lastLogin: '2026-05-14T07:45:00',
    },
    {
      id: '4',
      fullName: 'Jose Encoder',
      username: 'jencoder',
      role: 'assessment_clerk',
      accountStatus: 'locked',
      lastLogin: '2026-04-01T10:00:00',
    },
  ])

  const updateUser = (id: string, patch: Partial<DirectoryUser>) => {
    const i = users.value.findIndex((u) => u.id === id)
    if (i !== -1) {
      users.value[i] = { ...users.value[i], ...patch }
    }
  }

  return { users, updateUser }
})
