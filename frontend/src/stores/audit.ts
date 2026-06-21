import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAuditLogs } from '@/services/auditApi'
import { parseApiError } from '@/services/apiError'

export interface AuditLog {
  id: string
  user: string
  action: string
  timestamp: string
  status: 'Success' | 'Failed'
  previousValue: string
  newValue: string
}

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchLogs = async () => {
    loading.value = true
    error.value = null
    try {
      logs.value = await fetchAuditLogs()
    } catch (e) {
      error.value = parseApiError(e).message
      throw e
    } finally {
      loading.value = false
    }
  }

  /** @deprecated Server writes audit entries; kept for compatibility */
  const log = () => {
    // no-op: audit trail is recorded by the API
  }

  return { logs, loading, error, fetchLogs, log }
})
