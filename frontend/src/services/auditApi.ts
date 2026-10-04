import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'
import type { AuditLog } from '@/stores/audit'

interface PaginatedAudit {
  data: AuditLog[]
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const { data } = await useApi().get<PaginatedAudit | AuditLog[]>(endpoints.auditLogs)
  if (Array.isArray(data)) return data
  return data.data ?? []
}
