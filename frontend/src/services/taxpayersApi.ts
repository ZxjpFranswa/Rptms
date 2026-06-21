import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'
import type { Taxpayer } from '@/stores/taxpayer'

export async function searchTaxpayersByTin(tin: string): Promise<Taxpayer | null> {
  const { data } = await useApi().get<Taxpayer[]>(endpoints.taxpayers, { params: { tin } })
  return data[0] ?? null
}

export async function searchTaxpayersByName(
  lastName: string,
  firstName: string,
): Promise<Taxpayer | null> {
  const { data } = await useApi().get<Taxpayer[]>(endpoints.taxpayers, {
    params: { lastName, firstName },
  })
  return data[0] ?? null
}

export async function createTaxpayerApi(payload: Omit<Taxpayer, 'id'>): Promise<Taxpayer> {
  const { data } = await useApi().post<Taxpayer>(endpoints.taxpayers, payload)
  return data
}
