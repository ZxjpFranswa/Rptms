import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchApplications,
  fetchApplication,
  fetchReviews,
  createApplication,
  updateApplication,
  resubmitApplication as resubmitApplicationApi,
  submitApplication as submitApplicationApi,
  approveApplication,
  returnApplication,
  rejectApplication,
} from '@/services/applicationsApi'
import { parseApiError } from '@/services/apiError'

export type PropertyStatus =
  | 'Draft'
  | 'Under_Review'
  | 'Returned'
  | 'Rejected'
  | 'Active'

export interface PropertyDocument {
  type: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  uploadedAt?: string
  uploadStatus: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'
  downloadUrl?: string
  previewUrl?: string
  dataUrl?: string
}

export interface PropertyApplication {
  id: string
  intakeRef: string
  taxpayerName: string
  propertyType: string
  barangay: string
  submissionDate: string
  status: PropertyStatus
  lastAssessorAction?: string
  remarks?: string
  taxExempt?: boolean
  exemptionNotes?: string
  verificationStatus?: string
  createdAt: string
  updatedAt: string
  taxpayer?: {
    lastName: string
    firstName: string
    middleName?: string
    tin?: string
    address: string
    contact: string
    email: string
  }
  property?: {
    pin: string
    arpNumber: string
    landClassification: string
    actualUse: string
    totalArea: string
    surveyNumber?: string
  }
  location?: {
    street: string
    barangay: string
    municipality: string
    province: string
    zip: string
  }
  technical?: {
    northBoundary?: string
    southBoundary?: string
    eastBoundary?: string
    westBoundary?: string
    areaMeasurement?: string
    surveyReference?: string
    buildingType?: string
    floors?: string
    buildingArea?: string
  }
  documents?: PropertyDocument[]
}

export const usePropertyStore = defineStore('property', () => {
  const registrations = ref<PropertyApplication[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const reviewQueue = computed(() =>
    registrations.value.filter(
      (r) => r.status === 'Under_Review',
    ),
  )

  const upsertLocal = (app: PropertyApplication) => {
    const index = registrations.value.findIndex((r) => r.id === app.id)
    if (index >= 0) {
      registrations.value[index] = app
    } else {
      registrations.value.unshift(app)
    }
  }

  const fetchRegistrations = async () => {
    loading.value = true
    error.value = null
    try {
      registrations.value = await fetchApplications()
    } catch (e) {
      error.value = parseApiError(e).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchReviewQueue = async () => {
    loading.value = true
    error.value = null
    try {
      registrations.value = await fetchReviews()
    } catch (e) {
      error.value = parseApiError(e).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getRegistrationById = (id: string) => registrations.value.find((r) => r.id === id)

  const fetchRegistrationById = async (id: string) => {
    const app = await fetchApplication(id)
    upsertLocal(app)
    return app
  }

  const patchRegistration = async (id: string, patch: Partial<PropertyApplication>) => {
    const updated = await updateApplication(id, patch as Record<string, unknown>)
    upsertLocal(updated)
    return updated
  }

  const addRegistration = async (data: Partial<PropertyApplication>, asDraft = false) => {
    const reg = await createApplication(data as Record<string, unknown>, asDraft)
    upsertLocal(reg)
    return reg
  }

  const submitDraft = async (id: string) => {
    const reg = await submitApplicationApi(id)
    upsertLocal(reg)
    return reg
  }

  const resubmitApplication = async (id: string) => {
    const reg = await resubmitApplicationApi(id)
    upsertLocal(reg)
    return reg
  }

  const assessorApprove = async (id: string, remarks: string) => {
    const reg = await approveApplication(id, remarks)
    upsertLocal(reg)
    return reg
  }

  const assessorReturn = async (id: string, remarks: string) => {
    const reg = await returnApplication(id, remarks)
    upsertLocal(reg)
    return reg
  }

  const assessorReject = async (id: string, reason: string) => {
    const reg = await rejectApplication(id, reason)
    upsertLocal(reg)
    return reg
  }


  return {
    registrations,
    loading,
    error,
    reviewQueue,
    fetchRegistrations,
    fetchReviewQueue,
    getRegistrationById,
    fetchRegistrationById,
    patchRegistration,
    addRegistration,
    submitDraft,
    resubmitApplication,
    assessorApprove,
    assessorReturn,
    assessorReject,
  }
})
