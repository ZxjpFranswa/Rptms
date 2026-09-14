export interface Taxpayer {
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

const API_BASE = "";

export async function getAllTaxpayers(): Promise<Taxpayer[]> {
  const res = await fetch(`${API_BASE}/api/taxpayers`);
  if (!res.ok) throw new Error("Failed to load taxpayers");
  return res.json();
}

export async function getTaxpayerByPin(pin: string): Promise<Taxpayer | undefined> {
  const res = await fetch(`${API_BASE}/api/taxpayers/${encodeURIComponent(pin)}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Failed to load taxpayer");
  return res.json();
}

export function taxpayerTotalDue(t: Taxpayer): number {
  const base = t.basicRPT + t.sef;
  const penalty = base * (t.penaltyPercentage / 100);
  return base + penalty;
}
