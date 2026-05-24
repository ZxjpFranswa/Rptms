export interface PaymentRecord {
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

export interface DashboardStats {
  todayCollections: number;
  totalTaxpayers: number;
  pendingPayments: number;
  delinquentAccounts: number;
}

const API_BASE = "";

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const res = await fetch(`${API_BASE}/api/payments`);
  if (!res.ok) throw new Error("Failed to load payments");
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/api/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to load dashboard stats");
  return res.json();
}

export async function getRecentPayments(): Promise<PaymentRecord[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/recent-payments`);
  if (!res.ok) throw new Error("Failed to load recent payments");
  return res.json();
}

export async function getDailyCollections() {
  const res = await fetch(`${API_BASE}/api/collections/daily`);
  if (!res.ok) throw new Error("Failed to load collections");
  return res.json();
}

export async function getAuditLog() {
  const res = await fetch(`${API_BASE}/api/audit-log`);
  if (!res.ok) throw new Error("Failed to load audit log");
  return res.json();
}

export async function getTransactionsByDate(date: string) {
  const res = await fetch(`${API_BASE}/api/collections/daily/${encodeURIComponent(date)}/transactions`);
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}
