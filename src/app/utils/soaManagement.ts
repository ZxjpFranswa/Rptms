// SOA management — persisted via backend API (SQLite)

export interface SOARecord {
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

type SOAUpdateListener = () => void;
const listeners: SOAUpdateListener[] = [];

export function subscribeToSOAUpdates(listener: SOAUpdateListener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

const API_BASE = "";

async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${input}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${input} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function getAllSOAs(): Promise<SOARecord[]> {
  return apiFetch<SOARecord[]>("/api/soas");
}

export async function getSOAById(id: string): Promise<SOARecord | undefined> {
  try {
    return await apiFetch<SOARecord>(`/api/soas/${encodeURIComponent(id)}`);
  } catch {
    return undefined;
  }
}

export async function getSOAsByPIN(pin: string): Promise<SOARecord[]> {
  return apiFetch<SOARecord[]>(`/api/soas/pin/${encodeURIComponent(pin)}`);
}

export async function getLatestSOAForPIN(pin: string): Promise<SOARecord | null> {
  return apiFetch<SOARecord | null>(`/api/soas/pin/${encodeURIComponent(pin)}/latest`);
}

export async function getSOAsByStatus(
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent"
): Promise<SOARecord[]> {
  const all = await getAllSOAs();
  return all.filter(soa => soa.status === status);
}

/** One active cashier bill per PIN + fiscal year (newest SOA wins). */
export function dedupeSOAsForCashier(soas: SOARecord[]): SOARecord[] {
  const latestByPinYear = new Map<string, SOARecord>();
  for (const soa of soas) {
    const key = `${soa.pin}:${soa.fiscalYear}`;
    const existing = latestByPinYear.get(key);
    if (
      !existing ||
      new Date(soa.generatedDate).getTime() > new Date(existing.generatedDate).getTime()
    ) {
      latestByPinYear.set(key, soa);
    }
  }
  return Array.from(latestByPinYear.values()).sort(
    (a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
  );
}

export async function getSentSOAs(): Promise<SOARecord[]> {
  const soas = await apiFetch<SOARecord[]>("/api/soas/sent");
  return dedupeSOAsForCashier(
    soas.filter(soa => soa.status !== "Paid" && soa.balanceDue > 0 && soa.sentToTaxpayer)
  );
}

export async function createSOA(
  pin: string,
  taxpayer: string,
  taxpayerEmail: string,
  propertyAddress: string,
  assessedValue: number,
  basicRPT: number,
  sef: number,
  penalties: number,
  penaltyReason: string,
  fiscalYear: string,
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent",
  generatedBy: string,
  approvalRequestId?: string
): Promise<SOARecord> {
  const amountDueOriginal = basicRPT + sef + penalties;
  const payload: SOARecord = {
    id: "",
    pin,
    taxpayer,
    taxpayerEmail,
    propertyAddress,
    assessedValue,
    basicRPT,
    sef,
    penalties,
    penaltyReason,
    discount: 0,
    amountDueOriginal,
    balanceDue: amountDueOriginal,
    amountPaidTotal: 0,
    fiscalYear,
    status,
    generatedBy,
    generatedDate: new Date().toISOString(),
    approvalRequestId,
    sentToTaxpayer: false,
  };

  const created = await apiFetch<SOARecord>("/api/soas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  notifyListeners();
  return created;
}

export async function markSOAasSent(soaId: string): Promise<SOARecord | null> {
  try {
    const updated = await apiFetch<SOARecord>(`/api/soas/${encodeURIComponent(soaId)}/send`, {
      method: "POST",
    });
    notifyListeners();
    return updated;
  } catch {
    return null;
  }
}

export async function updateSOAStatus(
  soaId: string,
  amountPaid: number,
  discount?: number,
  options?: { orNumber: string; paymentMethod?: string; cashier: string }
): Promise<SOARecord | null> {
  if (!options) {
    throw new Error("Payment options (orNumber, cashier) required");
  }
  try {
    const result = await apiFetch<{ soa: SOARecord }>(`/api/soas/${encodeURIComponent(soaId)}/pay`, {
      method: "POST",
      body: JSON.stringify({
        amountPaid,
        discount,
        orNumber: options.orNumber,
        paymentMethod: options.paymentMethod ?? "Cash",
        cashier: options.cashier,
      }),
    });
    notifyListeners();
    return result.soa;
  } catch {
    return null;
  }
}

export async function getSOAForPayment(pin: string): Promise<SOARecord | null> {
  return apiFetch<SOARecord | null>(`/api/soas/payment?pin=${encodeURIComponent(pin)}`);
}
