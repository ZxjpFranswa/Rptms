import { getDb } from "./sqlite";

export type TaxpayerRow = {
  pin: string;
  taxpayerName: string;
  taxpayerEmail: string | null;
  propertyAddress: string | null;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  createdAt: string;
};

export function getAllTaxpayers(): TaxpayerRow[] {
  const db = getDb();
  return db
    .prepare(`SELECT pin, taxpayerName, taxpayerEmail, propertyAddress, assessedValue, basicRPT, sef, createdAt FROM taxpayers ORDER BY taxpayerName ASC`)
    .all() as TaxpayerRow[];
}

export function getTaxpayerByPIN(pin: string): TaxpayerRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT pin, taxpayerName, taxpayerEmail, propertyAddress, assessedValue, basicRPT, sef, createdAt FROM taxpayers WHERE pin = ?`
    )
    .get(pin) as TaxpayerRow | undefined;

  return row ?? null;
}

