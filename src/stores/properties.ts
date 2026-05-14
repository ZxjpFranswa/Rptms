import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Document {
  id: string
  type: string
  fileName: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface PropertyVerification {
  duplicateCheck: 'pass' | 'fail' | 'pending'
  ownershipValidation: 'pass' | 'fail' | 'pending'
  consistencyCheck: 'pass' | 'fail' | 'pending'
  exemptionCheck: 'pass' | 'fail' | 'pending'
  overallStatus: 'passed' | 'failed' | 'pending'
}

export interface TechnicalInfo {
  northBoundary: string
  southBoundary: string
  eastBoundary: string
  westBoundary: string
  areaMeasurement: number
  buildingType?: string
  numberOfFloors?: number
  buildingArea?: number
}

export interface Assessment {
  id: string
  marketValue: number
  assessmentLevel: number
  assessedValue: number
  assessmentDate: string
  status: 'pending' | 'completed'
}

export interface FAAS {
  id: string
  faasNumber: string
  generationDate: string
  releaseStatus: 'pending' | 'released'
  releasedBy?: string
  releasedDate?: string
}

export interface Property {
  id: string
  applicationId: string
  intakeReferenceNo: string
  pin: string
  arpNumber: string
  lotNumber?: string
  blockNumber?: string
  surveyNumber?: string
  ownerName: string
  ownerTIN: string
  street?: string
  barangay: string
  municipality: string
  province: string
  propertyType: string
  landClassification?: string
  actualUse?: string
  totalArea: number
  status: 'pending' | 'encoding' | 'verified' | 'reviewed' | 'active' | 'rejected'
  encodingStatus?: 'draft' | 'in_progress' | 'completed'
  reviewStatus?: 'pending_review' | 'approved' | 'returned' | 'rejected'
  assessorRemarks?: string
  submissionDate: string
  lastUpdated: string
  documents: Document[]
  technicalInfo?: TechnicalInfo
  assessment?: Assessment
  faas?: FAAS
  verification?: PropertyVerification
}

export interface ReleasedFaasRow {
  propertyId: string
  faasId: string
  faasNumber: string
  pin: string
  ownerName: string
  assessedValue: number
  releaseDate: string
  releaseStatus: 'released'
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const usePropertiesStore = defineStore('properties', () => {
  const properties = ref<Property[]>([
    {
      id: 'p1',
      applicationId: 'APP-2026-001',
      intakeReferenceNo: 'INT-2026-0001',
      pin: 'PIN-2024-001',
      arpNumber: 'ARP-001',
      lotNumber: '12',
      blockNumber: '3',
      surveyNumber: 'SV-8891',
      ownerName: 'Juan dela Cruz',
      ownerTIN: '123456789',
      street: 'Rizal Ave.',
      barangay: 'Bagbag',
      municipality: 'Quezon City',
      province: 'Metro Manila',
      propertyType: 'Residential',
      landClassification: 'Residential',
      actualUse: 'Dwelling',
      totalArea: 150,
      status: 'encoding',
      encodingStatus: 'in_progress',
      submissionDate: '2024-01-15',
      lastUpdated: '2024-01-18',
      documents: [
        { id: '1', type: 'Title', fileName: 'title.pdf', uploadDate: '2024-01-15', status: 'approved' },
        { id: '2', type: 'Tax Declaration', fileName: 'tax_decl.pdf', uploadDate: '2024-01-15', status: 'approved' },
      ],
    },
    {
      id: 'p2',
      applicationId: 'APP-2026-002',
      intakeReferenceNo: 'INT-2026-0002',
      pin: 'PIN-2024-002',
      arpNumber: 'ARP-002',
      ownerName: 'Maria Santos',
      ownerTIN: '987654321',
      barangay: 'Diliman',
      municipality: 'Quezon City',
      province: 'Metro Manila',
      propertyType: 'Commercial',
      totalArea: 500,
      status: 'verified',
      encodingStatus: 'completed',
      reviewStatus: 'pending_review',
      submissionDate: '2024-01-10',
      lastUpdated: '2024-01-20',
      documents: [],
      technicalInfo: {
        northBoundary: 'Road',
        southBoundary: 'Lot 11',
        eastBoundary: 'Alley',
        westBoundary: 'Lot 9',
        areaMeasurement: 500,
        buildingType: 'Mixed-use',
        numberOfFloors: 3,
        buildingArea: 800,
      },
      verification: {
        duplicateCheck: 'pass',
        ownershipValidation: 'pass',
        consistencyCheck: 'pass',
        exemptionCheck: 'pass',
        overallStatus: 'passed',
      },
      assessment: {
        id: 'a1',
        marketValue: 5_000_000,
        assessmentLevel: 0.8,
        assessedValue: 4_000_000,
        assessmentDate: '2024-01-20',
        status: 'completed',
      },
    },
    {
      id: 'p3',
      applicationId: 'APP-2026-003',
      intakeReferenceNo: 'INT-2026-0003',
      pin: 'PIN-2024-003',
      arpNumber: 'ARP-003',
      ownerName: 'LGU Demo Corp',
      ownerTIN: '111222333',
      barangay: 'Central',
      municipality: 'Sample City',
      province: 'Sample Province',
      propertyType: 'Industrial',
      totalArea: 2000,
      status: 'active',
      encodingStatus: 'completed',
      reviewStatus: 'approved',
      submissionDate: '2024-01-05',
      lastUpdated: '2024-01-22',
      documents: [],
      assessment: {
        id: 'a2',
        marketValue: 12_000_000,
        assessmentLevel: 0.75,
        assessedValue: 9_000_000,
        assessmentDate: '2024-01-21',
        status: 'completed',
      },
      faas: {
        id: 'f1',
        faasNumber: 'FAAS-2024-001',
        generationDate: '2024-01-20',
        releaseStatus: 'released',
        releasedBy: 'Maria Assessor',
        releasedDate: '2024-01-21',
      },
    },
  ])

  const releasedFaasRows = computed<ReleasedFaasRow[]>(() =>
    properties.value
      .filter((p) => p.faas?.releaseStatus === 'released')
      .map((p) => ({
        propertyId: p.id,
        faasId: p.faas!.id,
        faasNumber: p.faas!.faasNumber,
        pin: p.pin,
        ownerName: p.ownerName,
        assessedValue: p.assessment?.assessedValue ?? 0,
        releaseDate: p.faas!.releasedDate ?? p.faas!.generationDate,
        releaseStatus: 'released' as const,
      })),
  )

  const reviewQueue = computed(() =>
    properties.value.filter((p) => p.status === 'verified' && p.reviewStatus === 'pending_review'),
  )

  const encodingQueue = computed(() =>
    properties.value.filter(
      (p) =>
        p.status === 'encoding' &&
        (p.encodingStatus === undefined ||
          p.encodingStatus === 'draft' ||
          p.encodingStatus === 'in_progress'),
    ),
  )

  const verificationQueue = computed(() =>
    properties.value.filter((p) => p.encodingStatus === 'completed' && p.verification),
  )

  const addProperty = (property: Property) => {
    properties.value.push(property)
  }

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const index = properties.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      properties.value[index] = { ...properties.value[index], ...updates }
    }
  }

  const getProperty = (id: string) => properties.value.find((p) => p.id === id)

  const getPropertyByIntakeRef = (intakeReferenceNo: string) =>
    properties.value.find((p) => p.intakeReferenceNo === intakeReferenceNo)

  const pinExists = (pin: string, excludeId?: string) =>
    properties.value.some((p) => p.pin === pin && p.id !== excludeId)

  const registerProperty = (payload: Omit<Property, 'id' | 'applicationId' | 'intakeReferenceNo' | 'lastUpdated'>) => {
    const id = uid('p')
    const intakeNo = `INT-2026-${String(properties.value.length + 1).padStart(4, '0')}`
    const appId = `APP-2026-${String(properties.value.length + 1).padStart(3, '0')}`
    const row: Property = {
      ...payload,
      id,
      applicationId: appId,
      intakeReferenceNo: intakeNo,
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    addProperty(row)
    return id
  }

  const runAutomatedVerification = (propertyId: string) => {
    const p = getProperty(propertyId)
    if (!p) return
    const duplicate = pinExists(p.pin, p.id) ? 'fail' : 'pass'
    p.verification = {
      duplicateCheck: duplicate,
      ownershipValidation: 'pass',
      consistencyCheck: 'pass',
      exemptionCheck: 'pass',
      overallStatus: duplicate === 'fail' ? 'failed' : 'passed',
    }
    p.lastUpdated = new Date().toISOString().split('T')[0]
    if (p.verification.overallStatus === 'passed') {
      p.status = 'verified'
      p.reviewStatus = 'pending_review'
    }
  }

  const assessorDecision = (propertyId: string, decision: 'approve' | 'return' | 'reject', remarks?: string) => {
    const p = getProperty(propertyId)
    if (!p) return
    p.assessorRemarks = remarks
    if (decision === 'approve') {
      p.status = 'active'
      p.reviewStatus = 'approved'
    } else if (decision === 'return') {
      p.status = 'encoding'
      p.encodingStatus = 'in_progress'
      p.reviewStatus = 'returned'
    } else {
      p.status = 'rejected'
      p.reviewStatus = 'rejected'
    }
    p.lastUpdated = new Date().toISOString().split('T')[0]
  }

  const generateFaas = (propertyId: string) => {
    const p = getProperty(propertyId)
    if (!p) return { ok: false as const, message: 'Property not found' }
    if (p.status !== 'active') return { ok: false as const, message: 'Property must be ACTIVE' }
    if (!p.assessment || p.assessment.status !== 'completed') {
      return { ok: false as const, message: 'Assessment must be completed' }
    }
    if (p.faas) return { ok: false as const, message: 'FAAS already exists for this property' }
    p.faas = {
      id: uid('faas'),
      faasNumber: `FAAS-${new Date().getFullYear()}-${String(properties.value.length).padStart(4, '0')}`,
      generationDate: new Date().toISOString().split('T')[0],
      releaseStatus: 'pending',
    }
    p.lastUpdated = new Date().toISOString().split('T')[0]
    return { ok: true as const }
  }

  const releaseFAAS = (propertyId: string) => {
    const p = getProperty(propertyId)
    if (!p?.faas) return
    if (p.faas.releaseStatus === 'released') return
    p.faas.releaseStatus = 'released'
    p.faas.releasedDate = new Date().toISOString().split('T')[0]
    p.faas.releasedBy = 'Current Assessor'
    p.lastUpdated = new Date().toISOString().split('T')[0]
  }

  const saveAssessment = (
    propertyId: string,
    input: { marketValue: number; assessmentLevel: number; assessedValue: number },
  ) => {
    const p = getProperty(propertyId)
    if (!p) return
    p.assessment = {
      id: p.assessment?.id ?? uid('asmt'),
      marketValue: input.marketValue,
      assessmentLevel: input.assessmentLevel,
      assessedValue: input.assessedValue,
      assessmentDate: new Date().toISOString().split('T')[0],
      status: 'completed',
    }
    p.lastUpdated = new Date().toISOString().split('T')[0]
  }

  return {
    properties,
    releasedFaasRows,
    reviewQueue,
    encodingQueue,
    verificationQueue,
    addProperty,
    updateProperty,
    getProperty,
    getPropertyByIntakeRef,
    pinExists,
    registerProperty,
    runAutomatedVerification,
    assessorDecision,
    generateFaas,
    releaseFAAS,
    saveAssessment,
  }
})
