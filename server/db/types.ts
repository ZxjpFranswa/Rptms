export interface TaxpayerRow {
  pin: string;
  taxpayerName: string;
  taxpayerEmail: string | null;
  propertyAddress: string | null;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  penaltyPercentage: number;
  penaltyReason: string;
  fiscalYear: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
}

export interface ApprovalRequestRow {
  id: string;
  pin: string;
  taxpayer: string;
  requestType: "Penalty Waiver" | "Tax Adjustment";
  currentAmount: number;
  proposedAmount: number;
  reason: string;
  requestedBy: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  treasurerNotes?: string;
  reviewDate?: string;
  finalizedAmount?: number;
}

export interface SOARow {
  id: string;
  pin: string;
  taxpayer: string;
  taxpayerEmail: string;
  propertyAddress: string;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  penalties: number;
  penaltyReason: string;
  discount: number;
  amountDueOriginal: number;
  balanceDue: number;
  amountPaidTotal: number;
  fiscalYear: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
  generatedBy: string;
  generatedDate: string;
  approvalRequestId?: string;
  sentToTaxpayer: boolean;
  sentDate?: string;
}

export interface PaymentRow {
  id: string;
  orNumber: string;
  soaId: string;
  pin: string;
  taxpayer: string;
  propertyAddress: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  fiscalYear: string;
  cashier: string;
  basicRPT: number;
  sef: number;
  penalties: number;
  discount: number;
}

export interface AuditLogRow {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string;
  reason: string;
  ipAddress: string;
}
