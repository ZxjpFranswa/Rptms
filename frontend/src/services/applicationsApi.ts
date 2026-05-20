import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'
import type { PropertyApplication } from '@/stores/property'

export interface ApplicationsListResponse {
  data: PropertyApplication[]
}

export async function fetchApplications(params?: {
  status?: string
  review?: boolean
}): Promise<PropertyApplication[]> {
  const { data } = await useApi().get<ApplicationsListResponse | PropertyApplication[]>(
    endpoints.applications,
    {
      params: {
        status: params?.status,
        review: params?.review ? '1' : undefined,
      },
    },
  )
  if (Array.isArray(data)) return data
  return data.data ?? []
}

export async function fetchReviews(): Promise<PropertyApplication[]> {
  const { data } = await useApi().get<ApplicationsListResponse | PropertyApplication[]>(
    endpoints.reviews,
  )
  if (Array.isArray(data)) return data
  return data.data ?? []
}

export async function fetchApplication(id: string): Promise<PropertyApplication> {
  const { data } = await useApi().get<PropertyApplication>(`${endpoints.applications}/${id}`)
  return data
}

export async function createApplication(
  payload: Record<string, unknown>,
  asDraft: boolean,
): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(endpoints.applications, {
    ...payload,
    asDraft,
  })
  return data
}

export async function updateApplication(
  id: string,
  payload: Record<string, unknown>,
): Promise<PropertyApplication> {
  const { data } = await useApi().patch<PropertyApplication>(
    `${endpoints.applications}/${id}`,
    payload,
  )
  return data
}

export async function submitApplication(id: string): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(
    `${endpoints.applications}/${id}/submit`,
  )
  return data
}

export async function resubmitApplication(id: string): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(
    `${endpoints.applications}/${id}/resubmit`,
  )
  return data
}

export async function approveApplication(
  id: string,
  remarks: string,
  activateNow: boolean,
): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(
    `${endpoints.applications}/${id}/approve`,
    { remarks, activateNow },
  )
  return data
}

export async function returnApplication(id: string, reason: string): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(
    `${endpoints.applications}/${id}/return`,
    { reason },
  )
  return data
}

export async function rejectApplication(id: string, reason: string): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(
    `${endpoints.applications}/${id}/reject`,
    { reason },
  )
  return data
}

export async function activateApplication(id: string): Promise<PropertyApplication> {
  const { data } = await useApi().post<PropertyApplication>(
    `${endpoints.applications}/${id}/activate`,
  )
  return data
}
