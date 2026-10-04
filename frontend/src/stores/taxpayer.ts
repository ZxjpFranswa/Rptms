import { defineStore } from 'pinia'
import { searchTaxpayersByTin, searchTaxpayersByName } from '@/services/taxpayersApi'

export interface Taxpayer {
  id: string
  lastName: string
  firstName: string
  middleName?: string
  tin?: string
  address: string
  contact: string
  email: string
}

export const useTaxpayerStore = defineStore('taxpayer', () => {
  const findByTin = async (tin: string) => {
    if (!tin.trim()) return null
    return searchTaxpayersByTin(tin)
  }

  const findByName = async (lastName: string, firstName: string) => {
    if (!lastName.trim() || !firstName.trim()) return null
    return searchTaxpayersByName(lastName, firstName)
  }

  return { findByTin, findByName }
})
