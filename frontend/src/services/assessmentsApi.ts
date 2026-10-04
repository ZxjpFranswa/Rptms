import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'

export type ItemType = 'Land' | 'Building' | 'Machinery'
export type AssessmentStatus =
  | 'Draft'
  | 'UnderReview'
  | 'Approved'
  | 'Returned'
  | 'Rejected'
  | 'Authorized'

export interface AssessmentItemInput {
  item_type: ItemType
  classification: string
  actual_use: string
  area_sqm: number
  unit_value: number
  adjustment_factor_pct: number
  assessment_level_pct?: number
  details?: Record<string, unknown>
}

export interface AssessmentItem extends AssessmentItemInput {
  id?: string
  base_market_value: number
  market_value: number
  assessment_level_pct: number
  assessed_value: number
}

export interface AssessmentHistory {
  id: string
  from_status: string | null
  to_status: string
  remarks: string | null
  created_at: string
  actor?: { full_name: string } | null
}

export interface TaxDeclaration {
  id: string
  td_number: string
  effectivity_date: string
  total_market_value: string
  total_assessed_value: string
  status: string
}

export interface Assessment {
  id: string
  application_id: string
  pin: string | null
  arp_number: string | null
  total_market_value: string
  total_assessed_value: string
  taxability_status: 'Taxable' | 'Exempt'
  exemption_reason: string | null
  effective_year: number
  effective_quarter: number
  status: AssessmentStatus
  remarks: string | null
  items: AssessmentItem[]
  tax_declaration?: TaxDeclaration | null
  status_histories?: AssessmentHistory[]
}

export interface SaveAssessmentPayload {
  pin?: string
  arp_number?: string
  is_taxable: boolean
  exemption_reason?: string
  effective_year: number
  effective_quarter: number
  remarks?: string
  items: AssessmentItemInput[]
}

export interface CalculationResult {
  items: AssessmentItem[]
  total_market_value: number
  total_assessed_value: number
}

const base = (applicationId: string) => `${endpoints.applications}/${applicationId}/assessment`

export interface AssessmentRow {
  application_id: string
  intake_ref: string
  taxpayer_name: string
  barangay: string
  property_type: string
  pin: string | null
  arp_number: string | null
  land_classification: string | null
  total_area: number
  tax_exempt: boolean
  exemption_notes: string | null
  application_status: string
  assessment: {
    id: string
    status: AssessmentStatus
    total_market_value: string
    total_assessed_value: string
    submitted_at: string | null
    updated_at: string
    td_number: string | null
  } | null
}

export interface AssessmentStats {
  not_started: number
  draft: number
  under_review: number
  returned: number
  approved: number
  authorized: number
  rejected: number
  total_market_value: number
  total_assessed_value: number
}

export interface AssessmentListResponse {
  data: AssessmentRow[]
  meta: { current_page: number; last_page: number; total: number }
  stats: AssessmentStats
}

export async function listAssessmentsApi(params: {
  status?: string
  barangay?: string
  classification?: string
  search?: string
  page?: number
}): Promise<AssessmentListResponse> {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  const { data } = await useApi().get<AssessmentListResponse>(endpoints.assessments, {
    params: clean,
  })
  return data
}

export async function calculateAssessmentApi(
  items: AssessmentItemInput[],
  isTaxable: boolean,
  barangay?: string,
): Promise<CalculationResult> {
  const { data } = await useApi().post<CalculationResult>(`${endpoints.assessments}/calculate`, {
    items,
    is_taxable: isTaxable,
    barangay,
  })
  return data
}

export async function fetchAssessmentApi(applicationId: string): Promise<Assessment | null> {
  try {
    const { data } = await useApi().get<Assessment>(base(applicationId))
    return data
  } catch (e: any) {
    if (e?.response?.status === 404) return null
    throw e
  }
}

export async function fetchSmvApi(barangay: string, classification: string) {
  const { data } = await useApi().get<{ actual_use: string; unit_value: string }[]>(
    `${endpoints.assessments}/smv`,
    { params: { barangay, classification } },
  )
  return data
}

export async function saveAssessmentApi(applicationId: string, payload: SaveAssessmentPayload) {
  const { data } = await useApi().post<Assessment>(base(applicationId), payload)
  return data
}

export async function submitAssessmentApi(applicationId: string) {
  const { data } = await useApi().post<Assessment>(`${base(applicationId)}/submit`)
  return data
}

export async function approveAssessmentApi(applicationId: string, remarks: string) {
  const { data } = await useApi().post<Assessment>(`${base(applicationId)}/approve`, { remarks })
  return data
}

export async function returnAssessmentApi(applicationId: string, reason: string) {
  const { data } = await useApi().post<Assessment>(`${base(applicationId)}/return`, { reason })
  return data
}

export async function rejectAssessmentApi(applicationId: string, reason: string) {
  const { data } = await useApi().post<Assessment>(`${base(applicationId)}/reject`, { reason })
  return data
}

export async function authorizeAssessmentApi(applicationId: string) {
  const { data } = await useApi().post<TaxDeclaration>(`${base(applicationId)}/authorize`)
  return data
}
