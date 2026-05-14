import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AuditActionStatus = 'success' | 'failed' | 'pending'

export interface AuditLogEntry {
  id: string
  user: string
  transactionType: string
  date: string
  previousValue: string
  newValue: string
  actionStatus: AuditActionStatus
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const entries = ref<AuditLogEntry[]>([
    {
      id: '1',
      user: 'admin',
      transactionType: 'USER_LOCK',
      date: '2026-05-12T09:15:00',
      previousValue: 'active',
      newValue: 'locked',
      actionStatus: 'success',
    },
    {
      id: '2',
      user: 'assessor',
      transactionType: 'PROPERTY_APPROVE',
      date: '2026-05-11T14:22:00',
      previousValue: 'verified',
      newValue: 'active',
      actionStatus: 'success',
    },
    {
      id: '3',
      user: 'clerk',
      transactionType: 'FAAS_RELEASE',
      date: '2026-05-10T16:40:00',
      previousValue: 'pending',
      newValue: 'released',
      actionStatus: 'success',
    },
    {
      id: '4',
      user: 'system',
      transactionType: 'BACKUP',
      date: '2026-05-10T02:00:00',
      previousValue: '-',
      newValue: 'completed',
      actionStatus: 'success',
    },
  ])

  const addEntry = (entry: Omit<AuditLogEntry, 'id'>) => {
    const id = `audit-${Date.now()}`
    entries.value.unshift({ ...entry, id })
  }

  return { entries, addEntry }
})
