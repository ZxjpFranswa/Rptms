import { endpoints } from '@/services/api'
import { useApi } from '@/composables/useApi'

export interface SystemSettings {
  municipalityName: string
  officeName: string
  fiscalYear: number
  sessionTimeout: number
  emailNotifications: boolean
}

export async function fetchSettings(): Promise<SystemSettings> {
  const { data } = await useApi().get<SystemSettings>(endpoints.settings)
  return data
}

export async function updateSettings(payload: Partial<SystemSettings>): Promise<SystemSettings> {
  const { data } = await useApi().patch<SystemSettings>(endpoints.settings, payload)
  return data
}
