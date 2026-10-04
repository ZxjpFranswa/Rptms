import { useApi } from '@/composables/useApi'

export interface PropertySearchResult {
  tax_declaration_id: string
  td_number: string
  owner_name: string
  barangay: string
  pin: string | null
  arp_number: string | null
  total_assessed_value: number
  taxpayer_id: string | null
  taxpayer_name: string
  taxpayer_email: string | null
  taxpayer_contact: string | null
  has_outstanding_balance: boolean
  outstanding_principal: number
  active_soa: {
    id: string
    soa_no: string
    status: 'PendingApproval' | 'Issued' | 'Denied' | 'Superseded' | 'Settled'
    total_amount_due: number
    valid_until: string
    has_penalty: boolean
  } | null
}

export interface TaxBillInstallmentData {
  id: string
  quarter: number
  due_date: string
  basic_due: number
  sef_due: number
  total_due: number
  basic_paid: number
  sef_paid: number
  penalty_paid: number
  discount_granted: number
  basic_balance: number
  sef_balance: number
  principal_balance: number
  status: 'Unpaid' | 'Partial' | 'Paid'
}

export interface TaxBillData {
  id: string
  bill_no: string
  taxable_year: number
  assessed_value: number
  basic_tax: number
  sef_tax: number
  total_tax: number
  status: 'Unpaid' | 'Partial' | 'Paid'
  installments: TaxBillInstallmentData[]
  tax_declaration?: {
    td_number: string
    owner_name: string
    barangay: string
  }
}

export interface SoaItemData {
  id: string
  taxable_year: number
  quarter: number
  due_date: string
  basic_balance: number
  sef_balance: number
  principal_balance: number
  months_late: number
  penalty_rate_pct: number
  computed_penalty: number
  penalty_amount: number
  adjustment_reason?: string | null
}

export interface StatementOfAccountData {
  id: string
  soa_no: string
  tax_declaration_id: string
  taxpayer_id?: string | null
  owner_name: string
  pin?: string | null
  td_number: string
  barangay: string
  as_of_date: string
  valid_until: string
  total_basic: number
  total_sef: number
  total_principal: number
  computed_penalty: number
  total_penalty: number
  total_amount_due: number
  has_penalty: boolean
  status: 'PendingApproval' | 'Issued' | 'Denied' | 'Superseded' | 'Settled'
  remarks?: string | null
  review_remarks?: string | null
  prepared_by?: string | null
  reviewed_by?: string | null
  preparer?: { full_name: string }
  reviewer?: { full_name: string }
  items: SoaItemData[]
  tax_declaration?: {
    total_assessed_value: number
    assessment?: {
      pin: string
    }
  }
}

export interface PaymentAllocationData {
  id: string
  taxable_year: number
  quarter: number
  basic_amount: number
  sef_amount: number
  penalty_amount: number
  discount_amount: number
  discount_type?: string | null
  total_amount: number
}

export interface PaymentData {
  id: string
  or_number: string
  statement_of_account_id: string
  tax_declaration_id: string
  payor_name: string
  barangay: string
  payment_date: string
  amount_due: number
  discount_amount: number
  amount_paid: number
  amount_tendered: number
  change_amount: number
  balance_after: number
  payment_method: 'Cash' | 'Check'
  reference_no?: string | null
  remarks?: string | null
  cashier_id?: string | null
  status: 'Posted' | 'Cancelled'
  cancellation_reason?: string | null
  cashier?: { full_name: string }
  allocations: PaymentAllocationData[]
  statement_of_account?: StatementOfAccountData
  tax_declaration?: {
    td_number: string
    owner_name: string
    barangay: string
  }
}

export interface PaymentPreviewData {
  soa_no: string
  owner_name: string
  td_number: string
  as_of_date: string
  payment_date: string
  total_gross_due: number
  total_discount: number
  net_amount_due: number
  amount_tendered: number
  amount_paid: number
  change_amount: number
  balance_after: number
  is_full_payment: boolean
  allocations: Array<{
    installment_id: string
    taxable_year: number
    quarter: number
    due_date: string
    basic_balance: number
    sef_balance: number
    penalty_due: number
    gross_due: number
    discount_eligible: boolean
    discount_type: string | null
    discount_amount: number
    net_needed: number
    cash_applied: number
    basic_applied: number
    sef_applied: number
    penalty_applied: number
    remaining_principal: number
    remaining_penalty: number
  }>
}

export interface PaymentCorrectionRequestData {
  id: string
  payment_id: string
  request_type: string
  reason: string
  requested_by: string
  status: 'Pending' | 'Approved' | 'Denied'
  reviewed_by?: string | null
  review_remarks?: string | null
  created_at: string
  payment: PaymentData
  requester?: { full_name: string }
  reviewer?: { full_name: string }
}

export interface BillingSettingsData {
  basicRatePct: number
  sefRatePct: number
  monthlyPenaltyPct: number
  maxPenaltyMonths: number
  advanceDiscountPct: number
  promptDiscountPct: number
  quarterDueDates: Array<{ quarter: number; month: number; day: number }>
  orPrefix: string
  soaPrefix: string
  billPrefix: string
}

// ================= API CALLS =================

export async function searchPropertiesForBilling(query: string): Promise<PropertySearchResult[]> {
  const { data } = await useApi().get<PropertySearchResult[]>('/billing/search', {
    params: { query },
  })
  return data
}

export async function fetchPropertyDues(taxDeclarationId: string): Promise<{
  property: any
  bills: TaxBillData[]
  active_soa: StatementOfAccountData | null
  recent_payments: PaymentData[]
}> {
  const { data } = await useApi().get(`/billing/properties/${taxDeclarationId}/dues`)
  return data
}

export async function fetchBills(params?: {
  year?: number
  barangay?: string
  status?: string
  search?: string
  page?: number
}): Promise<{ data: TaxBillData[]; total: number; current_page: number }> {
  const { data } = await useApi().get('/billing/bills', { params })
  return data
}

export async function generateTaxBillApi(
  taxDeclarationId: string,
  taxableYear?: number,
): Promise<TaxBillData> {
  const { data } = await useApi().post<TaxBillData>('/billing/bills/generate', {
    tax_declaration_id: taxDeclarationId,
    taxable_year: taxableYear,
  })
  return data
}

export async function fetchSoas(params?: {
  status?: string
  barangay?: string
  search?: string
  page?: number
}): Promise<{ data: StatementOfAccountData[]; total: number; current_page: number }> {
  const { data } = await useApi().get('/billing/soas', { params })
  return data
}

export async function fetchSoaDetail(soaId: string): Promise<StatementOfAccountData> {
  const { data } = await useApi().get<StatementOfAccountData>(`/billing/soas/${soaId}`)
  return data
}

export async function createSoaApi(payload: {
  tax_declaration_id: string
  as_of_date?: string
  valid_until?: string
  remarks?: string
  adjustments?: Record<string, any>
}): Promise<StatementOfAccountData> {
  const { data } = await useApi().post<StatementOfAccountData>('/billing/soas', payload)
  return data
}

export async function approveSoaApi(
  soaId: string,
  remarks?: string,
): Promise<StatementOfAccountData> {
  const { data } = await useApi().post<StatementOfAccountData>(`/billing/soas/${soaId}/approve`, {
    remarks,
  })
  return data
}

export async function denySoaApi(soaId: string, reason: string): Promise<StatementOfAccountData> {
  const { data } = await useApi().post<StatementOfAccountData>(`/billing/soas/${soaId}/deny`, {
    reason,
  })
  return data
}

export async function reviseSoaApi(
  soaId: string,
  payload: { adjustments?: Record<string, any>; remarks?: string },
): Promise<StatementOfAccountData> {
  const { data } = await useApi().post<StatementOfAccountData>(
    `/billing/soas/${soaId}/revise`,
    payload,
  )
  return data
}

export async function previewPaymentApi(
  soaId: string,
  amountTendered: number,
  paymentDate?: string,
): Promise<PaymentPreviewData> {
  const { data } = await useApi().post<PaymentPreviewData>(
    `/billing/soas/${soaId}/preview-payment`,
    {
      amount_tendered: amountTendered,
      payment_date: paymentDate,
    },
  )
  return data
}

export async function recordPaymentApi(
  soaId: string,
  payload: {
    payor_name?: string
    amount_tendered: number
    payment_method?: 'Cash' | 'Check'
    reference_no?: string
    remarks?: string
    payment_date?: string
  },
): Promise<PaymentData> {
  const { data } = await useApi().post<PaymentData>(`/billing/soas/${soaId}/pay`, payload)
  return data
}

export async function fetchReceiptDetail(paymentId: string): Promise<PaymentData> {
  const { data } = await useApi().get<PaymentData>(`/billing/receipts/${paymentId}`)
  return data
}

export async function requestPaymentCorrectionApi(
  paymentId: string,
  reason: string,
  type = 'Cancellation',
): Promise<PaymentCorrectionRequestData> {
  const { data } = await useApi().post<PaymentCorrectionRequestData>(
    `/billing/payments/${paymentId}/correct`,
    {
      reason,
      request_type: type,
    },
  )
  return data
}

export async function fetchCorrectionRequests(params?: {
  status?: string
}): Promise<{ data: PaymentCorrectionRequestData[]; total: number }> {
  const { data } = await useApi().get('/billing/corrections', { params })
  return data
}

export async function reviewCorrectionApi(
  requestId: string,
  approved: boolean,
  remarks?: string,
): Promise<PaymentCorrectionRequestData> {
  const { data } = await useApi().post<PaymentCorrectionRequestData>(
    `/billing/corrections/${requestId}/review`,
    {
      approved,
      remarks,
    },
  )
  return data
}

// Reports
export async function fetchDailyReport(date: string, barangay?: string): Promise<any> {
  const { data } = await useApi().get('/billing/reports/daily', { params: { date, barangay } })
  return data
}

export async function fetchMonthlyReport(
  year: number,
  month: number,
  barangay?: string,
): Promise<any> {
  const { data } = await useApi().get('/billing/reports/monthly', {
    params: { year, month, barangay },
  })
  return data
}

export async function fetchAnnualReport(year: number, barangay?: string): Promise<any> {
  const { data } = await useApi().get('/billing/reports/annual', { params: { year, barangay } })
  return data
}

export async function fetchBarangayReport(year: number): Promise<any[]> {
  const { data } = await useApi().get('/billing/reports/by-barangay', { params: { year } })
  return data
}

export async function fetchTaxYearReport(year: number): Promise<any[]> {
  const { data } = await useApi().get('/billing/reports/by-tax-year', { params: { year } })
  return data
}

export async function fetchDelinquentsReport(params?: {
  as_of_date?: string
  barangay?: string
  search?: string
}): Promise<any> {
  const { data } = await useApi().get('/billing/reports/delinquents', { params })
  return data
}

export async function fetchReceiptRegister(params?: {
  status?: string
  barangay?: string
  start_date?: string
  end_date?: string
}): Promise<any> {
  const { data } = await useApi().get('/billing/reports/receipt-register', { params })
  return data
}

// Settings
export async function fetchBillingSettings(): Promise<BillingSettingsData> {
  const { data } = await useApi().get<BillingSettingsData>('/billing/settings')
  return data
}

export async function updateBillingSettingsApi(
  payload: Partial<BillingSettingsData>,
): Promise<BillingSettingsData> {
  const { data } = await useApi().patch<BillingSettingsData>('/billing/settings', payload)
  return data
}

// Taxpayer Portal APIs
export async function fetchMyDues(): Promise<{
  taxpayer: any
  total_outstanding: number
  properties: any[]
}> {
  const { data } = await useApi().get('/portal/dues')
  return data
}

export async function fetchMyBills(): Promise<TaxBillData[]> {
  const { data } = await useApi().get<TaxBillData[]>('/portal/bills')
  return data
}

export async function fetchMySoas(): Promise<StatementOfAccountData[]> {
  const { data } = await useApi().get<StatementOfAccountData[]>('/portal/soas')
  return data
}

export async function fetchMyPayments(): Promise<PaymentData[]> {
  const { data } = await useApi().get<PaymentData[]>('/portal/payments')
  return data
}

export async function fetchMyReceipt(paymentId: string): Promise<PaymentData> {
  const { data } = await useApi().get<PaymentData>(`/portal/receipts/${paymentId}`)
  return data
}

export async function fetchMyNotifications(): Promise<any[]> {
  const { data } = await useApi().get('/portal/notifications')
  return data
}

export async function markNotificationReadApi(notificationId: string): Promise<any> {
  const { data } = await useApi().post(`/portal/notifications/${notificationId}/read`)
  return data
}
