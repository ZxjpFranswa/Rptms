import { getDb } from "./sqlite";
import type { SOARecord } from "../soaManagement";

function mapRow(row: any): SOARecord {
  return {
    id: row.id,
    pin: row.pin,
    taxpayer: row.taxpayer,
    taxpayerEmail: row.taxpayerEmail,
    propertyAddress: row.propertyAddress,
    assessedValue: Number(row.assessedValue),
    basicRPT: Number(row.basicRPT),
    sef: Number(row.sef),
    penalties: Number(row.penalties),
    penaltyReason: row.penaltyReason ?? "",
    discount: Number(row.discount ?? 0),
    amountDueOriginal: Number(row.amountDueOriginal),
    balanceDue: Number(row.balanceDue),
    amountPaidTotal: Number(row.amountPaidTotal ?? 0),
    fiscalYear: row.fiscalYear,
    status: row.status,
    generatedBy: row.generatedBy,
    generatedDate: row.generatedDate,
    approvalRequestId: row.approvalRequestId ?? undefined,
    sentToTaxpayer: row.sentToTaxpayer === 1,
    sentDate: row.sentDate ?? undefined,
  };
}

export function getAllSOAs(): SOARecord[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM soas ORDER BY generatedDate DESC`).all();
  return rows.map(mapRow);
}

export function getSOAsByPIN(pin: string): SOARecord[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM soas WHERE pin = ? ORDER BY generatedDate DESC`).all(pin);
  return rows.map(mapRow);
}

export function getLatestSOAForPIN(pin: string): SOARecord | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM soas WHERE pin = ? ORDER BY generatedDate DESC LIMIT 1`)
    .get(pin) as any | undefined;
  return row ? mapRow(row) : null;
}

export function getSentSOAs(): SOARecord[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM soas WHERE sentToTaxpayer = 1 ORDER BY generatedDate DESC`).all();
  return rows.map(mapRow);
}

export function getSOAForPayment(pin: string): SOARecord | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT * FROM soas WHERE pin = ? AND sentToTaxpayer = 1 AND status != 'Paid' AND balanceDue > 0 ORDER BY generatedDate DESC LIMIT 1`
    )
    .get(pin) as any | undefined;
  return row ? mapRow(row) : null;
}

export function getSOAById(id: string): SOARecord | undefined {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM soas WHERE id = ?`).get(id) as any | undefined;
  return row ? mapRow(row) : undefined;
}

export function createSOA(record: Omit<SOARecord, "id"> & { id: string }) {
  const db = getDb();

  db.prepare(
    `INSERT INTO soas (
      id, pin, taxpayer, taxpayerEmail, propertyAddress, assessedValue, basicRPT, sef,
      penalties, penaltyReason, discount, amountDueOriginal, balanceDue, amountPaidTotal,
      fiscalYear, status, generatedBy, generatedDate, approvalRequestId,
      sentToTaxpayer, sentDate
    ) VALUES (
      @id, @pin, @taxpayer, @taxpayerEmail, @propertyAddress, @assessedValue, @basicRPT, @sef,
      @penalties, @penaltyReason, @discount, @amountDueOriginal, @balanceDue, @amountPaidTotal,
      @fiscalYear, @status, @generatedBy, @generatedDate, @approvalRequestId,
      @sentToTaxpayer, @sentDate
    )`
  ).run({
    ...record,
    sentToTaxpayer: record.sentToTaxpayer ? 1 : 0,
  });
}

export function updateSOA(record: SOARecord) {
  const db = getDb();
  db.prepare(
    `UPDATE soas SET
      pin=@pin,
      taxpayer=@taxpayer,
      taxpayerEmail=@taxpayerEmail,
      propertyAddress=@propertyAddress,
      assessedValue=@assessedValue,
      basicRPT=@basicRPT,
      sef=@sef,
      penalties=@penalties,
      penaltyReason=@penaltyReason,
      discount=@discount,
      amountDueOriginal=@amountDueOriginal,
      balanceDue=@balanceDue,
      amountPaidTotal=@amountPaidTotal,
      fiscalYear=@fiscalYear,
      status=@status,
      generatedBy=@generatedBy,
      generatedDate=@generatedDate,
      approvalRequestId=@approvalRequestId,
      sentToTaxpayer=@sentToTaxpayer,
      sentDate=@sentDate
     WHERE id=@id`
  ).run({
    ...record,
    sentToTaxpayer: record.sentToTaxpayer ? 1 : 0,
  });
}

