import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'

export type ItemType = 'Land' | 'Building' | 'Machinery' | 'Plants/Trees'
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
  details?: {
    depreciation_pct?: number
    acquisition_cost?: number
    plant_kind?: string
    age_years?: number
    quantity_trees?: number
    stage?: string
    age_bracket?: string
    is_bearing?: boolean
    unit?: string
    standard_unit_value?: number
    [key: string]: unknown
  }
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

export interface ComponentValuation {
  count: number
  base_mv: number
  market_value: number
  assessed_value: number
  area_sqm?: number
  units?: number
  total_trees?: number
}

export interface ValuationSummary {
  total_base_market_value: number
  total_adjustments_value: number
  total_market_value: number
  total_assessed_value: number
  effective_assessment_level_pct: number
  breakdown: {
    land: ComponentValuation
    building: ComponentValuation
    machinery: ComponentValuation
    plants_trees: ComponentValuation
  }
}

export interface TaxSummary {
  is_taxable: boolean
  basic_tax_rate_pct: number
  basic_tax_amount: number
  sef_tax_rate_pct: number
  sef_tax_amount: number
  total_annual_tax: number
  quarterly_installment: number
  prompt_discount_pct: number
  prompt_discount_amount: number
  discounted_annual_tax: number
}

export interface YearlyProjection {
  year: number
  escalation_pct: number
  cumulative_factor_pct: number
  market_value: number
  assessed_value: number
  basic_tax: number
  sef_tax: number
  total_annual_tax: number
  quarterly_installment: number
  annual_increase_amount: number
}

export interface AnnualTaxIncrease {
  enabled: boolean
  rate_pct: number
  start_year: number
  projections: YearlyProjection[]
}

export interface Reassessment {
  id: string
  assessment_id: string
  application_id: string
  reassessment_type: string
  adjustment_mode: string
  adjustment_pct: number | string
  previous_market_value: number | string
  new_market_value: number | string
  previous_assessed_value: number | string
  new_assessed_value: number | string
  effective_year: number
  effective_quarter: number
  reason: string
  remarks?: string | null
  status: 'Pending' | 'Approved' | 'Rejected'
  created_at: string
  creator?: { id: string; full_name: string } | null
  approver?: { id: string; full_name: string } | null
}

export interface LandPhoto {
  id: string
  application_id: string
  title: string
  category: string
  file_name: string
  file_size: number
  mime_type: string
  caption?: string | null
  uploader?: string | null
  created_at: string
  url: string
}

export interface PlantBracket {
  min_age: number
  max_age: number
  stage: string
  unit_value: number
  is_bearing: boolean
}

export interface PlantScheduleEntry {
  species: string
  description: string
  unit: string
  brackets: PlantBracket[]
}

export interface PlantPricingResult {
  species: string
  age_years: number
  unit_value: number
  stage: string
  age_bracket: string
  is_bearing: boolean
  unit: string
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
  annual_tax_increase_pct?: number
  annual_tax_increase_enabled?: boolean
  status: AssessmentStatus
  remarks: string | null
  items: AssessmentItem[]
  tax_declaration?: TaxDeclaration | null
  status_histories?: AssessmentHistory[]
  reassessments?: Reassessment[]
  valuation_summary?: ValuationSummary | null
  tax_summary?: TaxSummary | null
  annual_tax_increase?: AnnualTaxIncrease | null
}

export interface SaveAssessmentPayload {
  pin?: string
  arp_number?: string
  is_taxable: boolean
  exemption_reason?: string
  effective_year: number
  effective_quarter: number
  annual_tax_increase_pct?: number
  annual_tax_increase_enabled?: boolean
  remarks?: string
  items: AssessmentItemInput[]
}

export interface CalculationResult {
  items: AssessmentItem[]
  total_base_market_value: number
  total_adjustments_value: number
  total_market_value: number
  total_assessed_value: number
  effective_assessment_level_pct: number
  valuation_summary?: ValuationSummary
  tax_summary?: TaxSummary
  annual_tax_increase?: AnnualTaxIncrease
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
  options?: {
    barangay?: string
    annual_tax_increase_pct?: number
    annual_tax_increase_enabled?: boolean
    effective_year?: number
  },
): Promise<CalculationResult> {
  const { data } = await useApi().post<CalculationResult>(`${endpoints.assessments}/calculate`, {
    items,
    is_taxable: isTaxable,
    barangay: options?.barangay,
    annual_tax_increase_pct: options?.annual_tax_increase_pct,
    annual_tax_increase_enabled: options?.annual_tax_increase_enabled,
    effective_year: options?.effective_year,
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

export async function fetchPlantsScheduleApi(): Promise<PlantScheduleEntry[]> {
  const { data } = await useApi().get<PlantScheduleEntry[]>(`${endpoints.assessments}/plants-schedule`)
  return data
}

export async function lookupPlantPriceApi(species: string, age: number): Promise<PlantPricingResult> {
  const { data } = await useApi().post<PlantPricingResult>(`${endpoints.assessments}/plants/lookup`, {
    species,
    age,
  })
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

// Reassessment APIs (Price Changes Increase or Decrease)
export async function fetchReassessmentsApi(applicationId: string): Promise<Reassessment[]> {
  const { data } = await useApi().get<Reassessment[]>(`${endpoints.applications}/${applicationId}/reassessments`)
  return data
}

export async function previewReassessmentApi(
  applicationId: string,
  payload: {
    adjustment_pct: number
    reassessment_type?: string
    effective_year?: number
    effective_quarter?: number
  },
) {
  const { data } = await useApi().post(`${endpoints.applications}/${applicationId}/reassessments/preview`, payload)
  return data
}

export async function createReassessmentApi(
  applicationId: string,
  payload: {
    adjustment_pct: number
    reassessment_type: string
    reason: string
    remarks?: string
    effective_year?: number
    effective_quarter?: number
  },
): Promise<Reassessment> {
  const { data } = await useApi().post<Reassessment>(`${endpoints.applications}/${applicationId}/reassessments`, payload)
  return data
}

export async function approveReassessmentApi(reassessmentId: string, remarks?: string): Promise<Reassessment> {
  const { data } = await useApi().post<Reassessment>(`/reassessments/${reassessmentId}/approve`, { remarks })
  return data
}

export async function rejectReassessmentApi(reassessmentId: string, reason: string): Promise<Reassessment> {
  const { data } = await useApi().post<Reassessment>(`/reassessments/${reassessmentId}/reject`, { reason })
  return data
}

// Land Photos APIs (Pictures image of the land)
export async function fetchLandPhotosApi(applicationId: string): Promise<LandPhoto[]> {
  const { data } = await useApi().get<LandPhoto[]>(`${endpoints.applications}/${applicationId}/land-photos`)
  return data
}

export async function uploadLandPhotoApi(applicationId: string, formData: FormData): Promise<LandPhoto> {
  const { data } = await useApi().post<LandPhoto>(
    `${endpoints.applications}/${applicationId}/land-photos`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return data
}

export async function deleteLandPhotoApi(applicationId: string, photoId: string): Promise<void> {
  await useApi().delete(`${endpoints.applications}/${applicationId}/land-photos/${photoId}`)
}
