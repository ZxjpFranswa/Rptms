import { db } from "./connection.js";
import type {
  ApprovalRequestRow,
  AuditLogRow,
  PaymentRow,
  SOARow,
  TaxpayerRow,
} from "./types.js";

function mapTaxpayer(row: Record<string, unknown>): TaxpayerRow {
  return {
    pin: row.pin as string,
    taxpayerName: row.taxpayer_name as string,
    taxpayerEmail: (row.taxpayer_email as string) ?? null,
    propertyAddress: (row.property_address as string) ?? null,
    assessedValue: row.assessed_value as number,
    basicRPT: row.basic_rpt as number,
    sef: row.sef as number,
    penaltyPercentage: row.penalty_percentage as number,
    penaltyReason: row.penalty_reason as string,
    fiscalYear: row.fiscal_year as string,
    status: row.status as TaxpayerRow["status"],
  };
}

function mapApproval(row: Record<string, unknown>): ApprovalRequestRow {
  return {
    id: row.id as string,
    pin: row.pin as string,
    taxpayer: row.taxpayer as string,
    requestType: row.request_type as ApprovalRequestRow["requestType"],
    currentAmount: row.current_amount as number,
    proposedAmount: row.proposed_amount as number,
    reason: row.reason as string,
    requestedBy: row.requested_by as string,
    requestDate: row.request_date as string,
    status: row.status as ApprovalRequestRow["status"],
    treasurerNotes: (row.treasurer_notes as string) ?? undefined,
    reviewDate: (row.review_date as string) ?? undefined,
    finalizedAmount: (row.finalized_amount as number) ?? undefined,
  };
}

function mapSOA(row: Record<string, unknown>): SOARow {
  return {
    id: row.id as string,
    pin: row.pin as string,
    taxpayer: row.taxpayer as string,
    taxpayerEmail: row.taxpayer_email as string,
    propertyAddress: row.property_address as string,
    assessedValue: row.assessed_value as number,
    basicRPT: row.basic_rpt as number,
    sef: row.sef as number,
    penalties: row.penalties as number,
    penaltyReason: row.penalty_reason as string,
    discount: row.discount as number,
    amountDueOriginal: row.amount_due_original as number,
    balanceDue: row.balance_due as number,
    amountPaidTotal: row.amount_paid_total as number,
    fiscalYear: row.fiscal_year as string,
    status: row.status as SOARow["status"],
    generatedBy: row.generated_by as string,
    generatedDate: row.generated_date as string,
    approvalRequestId: (row.approval_request_id as string) ?? undefined,
    sentToTaxpayer: Boolean(row.sent_to_taxpayer),
    sentDate: (row.sent_date as string) ?? undefined,
  };
}

function mapPayment(row: Record<string, unknown>): PaymentRow {
  return {
    id: row.id as string,
    orNumber: row.or_number as string,
    soaId: row.soa_id as string,
    pin: row.pin as string,
    taxpayer: row.taxpayer as string,
    propertyAddress: row.property_address as string,
    amount: row.amount as number,
    paymentMethod: row.payment_method as string,
    paymentDate: row.payment_date as string,
    fiscalYear: row.fiscal_year as string,
    cashier: row.cashier as string,
    basicRPT: row.basic_rpt as number,
    sef: row.sef as number,
    penalties: row.penalties as number,
    discount: row.discount as number,
  };
}

function mapAudit(row: Record<string, unknown>): AuditLogRow {
  return {
    id: row.id as string,
    timestamp: row.timestamp as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: row.entity_id as string,
    changes: row.changes as string,
    reason: row.reason as string,
    ipAddress: row.ip_address as string,
  };
}

export function getAllTaxpayers(): TaxpayerRow[] {
  return db
    .prepare("SELECT * FROM taxpayers ORDER BY taxpayer_name")
    .all()
    .map(r => mapTaxpayer(r as Record<string, unknown>));
}

export function getTaxpayerByPin(pin: string): TaxpayerRow | undefined {
  const row = db.prepare("SELECT * FROM taxpayers WHERE pin = ?").get(pin);
  return row ? mapTaxpayer(row as Record<string, unknown>) : undefined;
}

export function getAllApprovals(): ApprovalRequestRow[] {
  return db
    .prepare("SELECT * FROM approval_requests ORDER BY request_date DESC")
    .all()
    .map(r => mapApproval(r as Record<string, unknown>));
}

export function getApprovalById(id: string): ApprovalRequestRow | undefined {
  const row = db.prepare("SELECT * FROM approval_requests WHERE id = ?").get(id);
  return row ? mapApproval(row as Record<string, unknown>) : undefined;
}

export function getApprovalsByPin(pin: string): ApprovalRequestRow[] {
  return db
    .prepare("SELECT * FROM approval_requests WHERE pin = ? ORDER BY request_date DESC")
    .all(pin)
    .map(r => mapApproval(r as Record<string, unknown>));
}

export function createApproval(req: ApprovalRequestRow): ApprovalRequestRow {
  db.prepare(`
    INSERT INTO approval_requests (
      id, pin, taxpayer, request_type, current_amount, proposed_amount,
      reason, requested_by, request_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.id, req.pin, req.taxpayer, req.requestType, req.currentAmount,
    req.proposedAmount, req.reason, req.requestedBy, req.requestDate, req.status
  );
  return req;
}

export function updateApprovalStatus(
  id: string,
  status: "Approved" | "Rejected",
  treasurerNotes: string,
  finalizedAmount: number
): ApprovalRequestRow | null {
  const reviewDate = new Date().toISOString();
  const result = db.prepare(`
    UPDATE approval_requests
    SET status = ?, treasurer_notes = ?, review_date = ?, finalized_amount = ?
    WHERE id = ?
  `).run(status, treasurerNotes, reviewDate, finalizedAmount, id);
  return result.changes ? getApprovalById(id) ?? null : null;
}

export function getAllSOAs(): SOARow[] {
  return db
    .prepare("SELECT * FROM soas ORDER BY generated_date DESC")
    .all()
    .map(r => mapSOA(r as Record<string, unknown>));
}

export function getSOAById(id: string): SOARow | undefined {
  const row = db.prepare("SELECT * FROM soas WHERE id = ?").get(id);
  return row ? mapSOA(row as Record<string, unknown>) : undefined;
}

export function getSOAsByPin(pin: string): SOARow[] {
  return db
    .prepare("SELECT * FROM soas WHERE pin = ? ORDER BY generated_date DESC")
    .all(pin)
    .map(r => mapSOA(r as Record<string, unknown>));
}

export function getLatestSOAForPin(pin: string): SOARow | null {
  const row = db
    .prepare("SELECT * FROM soas WHERE pin = ? ORDER BY generated_date DESC LIMIT 1")
    .get(pin);
  return row ? mapSOA(row as Record<string, unknown>) : null;
}

export function getSentSOAs(): SOARow[] {
  return db
    .prepare("SELECT * FROM soas WHERE sent_to_taxpayer = 1 ORDER BY generated_date DESC")
    .all()
    .map(r => mapSOA(r as Record<string, unknown>));
}

export function getSOAForPayment(pin: string): SOARow | null {
  const row = db.prepare(`
    SELECT * FROM soas
    WHERE pin = ? AND sent_to_taxpayer = 1 AND status != 'Paid' AND balance_due > 0
    ORDER BY generated_date DESC LIMIT 1
  `).get(pin);
  return row ? mapSOA(row as Record<string, unknown>) : null;
}

export function createSOA(soa: SOARow): SOARow {
  db.prepare(`
    INSERT INTO soas (
      id, pin, taxpayer, taxpayer_email, property_address, assessed_value,
      basic_rpt, sef, penalties, penalty_reason, discount, amount_due_original,
      balance_due, amount_paid_total, fiscal_year, status, generated_by,
      generated_date, approval_request_id, sent_to_taxpayer, sent_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    soa.id, soa.pin, soa.taxpayer, soa.taxpayerEmail, soa.propertyAddress,
    soa.assessedValue, soa.basicRPT, soa.sef, soa.penalties, soa.penaltyReason,
    soa.discount, soa.amountDueOriginal, soa.balanceDue, soa.amountPaidTotal,
    soa.fiscalYear, soa.status, soa.generatedBy, soa.generatedDate,
    soa.approvalRequestId ?? null, soa.sentToTaxpayer ? 1 : 0, soa.sentDate ?? null
  );
  return soa;
}

export function markSOAAsSent(id: string): SOARow | null {
  const sentDate = new Date().toISOString();
  const result = db.prepare(`
    UPDATE soas SET sent_to_taxpayer = 1, sent_date = ? WHERE id = ?
  `).run(sentDate, id);
  return result.changes ? getSOAById(id) ?? null : null;
}

function computeSOATotals(soa: SOARow) {
  const payable = Math.max(0, soa.basicRPT + soa.sef + soa.penalties - soa.discount);
  const balanceDue = Math.max(0, payable - soa.amountPaidTotal);
  let status: SOARow["status"] = soa.status;
  if (balanceDue === 0) status = "Paid";
  else if (soa.amountPaidTotal > 0) status = "Partial";
  else if (status !== "Delinquent") status = "Unpaid";
  return { balanceDue, status };
}

export function applyPaymentToSOA(
  soaId: string,
  amountPaid: number,
  discount?: number
): SOARow | null {
  const soa = getSOAById(soaId);
  if (!soa) return null;

  const newDiscount = discount !== undefined ? discount : soa.discount;
  const newPaidTotal = soa.amountPaidTotal + Math.max(0, amountPaid);
  const updated: SOARow = { ...soa, discount: newDiscount, amountPaidTotal: newPaidTotal };
  const { balanceDue, status } = computeSOATotals(updated);

  db.prepare(`
    UPDATE soas SET discount = ?, amount_paid_total = ?, balance_due = ?, status = ? WHERE id = ?
  `).run(newDiscount, newPaidTotal, balanceDue, status, soaId);

  if (status === "Paid") {
    db.prepare("UPDATE taxpayers SET status = 'Paid' WHERE pin = ?").run(soa.pin);
  } else if (status === "Partial") {
    db.prepare("UPDATE taxpayers SET status = 'Partial' WHERE pin = ?").run(soa.pin);
  }

  return getSOAById(soaId) ?? null;
}

export function getAllPayments(): PaymentRow[] {
  return db
    .prepare("SELECT * FROM payments ORDER BY payment_date DESC")
    .all()
    .map(r => mapPayment(r as Record<string, unknown>));
}

export function createPayment(payment: PaymentRow): PaymentRow {
  db.prepare(`
    INSERT INTO payments (
      id, or_number, soa_id, pin, taxpayer, property_address, amount,
      payment_method, payment_date, fiscal_year, cashier, basic_rpt, sef, penalties, discount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payment.id, payment.orNumber, payment.soaId, payment.pin, payment.taxpayer,
    payment.propertyAddress, payment.amount, payment.paymentMethod, payment.paymentDate,
    payment.fiscalYear, payment.cashier, payment.basicRPT, payment.sef,
    payment.penalties, payment.discount
  );
  return payment;
}

export function getAllAuditLogs(): AuditLogRow[] {
  return db
    .prepare("SELECT * FROM audit_log ORDER BY timestamp DESC")
    .all()
    .map(r => mapAudit(r as Record<string, unknown>));
}

export function createAuditLog(entry: AuditLogRow): AuditLogRow {
  db.prepare(`
    INSERT INTO audit_log (
      id, timestamp, user_id, user_name, action, entity_type, entity_id, changes, reason, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    entry.id, entry.timestamp, entry.userId, entry.userName, entry.action,
    entry.entityType, entry.entityId, entry.changes, entry.reason, entry.ipAddress
  );
  return entry;
}

export function getDashboardStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayCollections = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE date(payment_date) = date(?)
  `).get(today) as { total: number };

  const totalTaxpayers = db.prepare("SELECT COUNT(*) as count FROM taxpayers").get() as { count: number };
  const pendingPayments = db.prepare(`
    SELECT COALESCE(SUM(balance_due), 0) as total FROM soas WHERE status != 'Paid'
  `).get() as { total: number };
  const delinquentAccounts = db.prepare(`
    SELECT COUNT(*) as count FROM taxpayers WHERE status = 'Delinquent'
  `).get() as { count: number };

  return {
    todayCollections: todayCollections.total,
    totalTaxpayers: totalTaxpayers.count,
    pendingPayments: pendingPayments.total,
    delinquentAccounts: delinquentAccounts.count,
  };
}

export function getRecentPayments(limit = 5) {
  return getAllPayments().slice(0, limit);
}

export function getDailyCollections() {
  const rows = db.prepare(`
    SELECT date(payment_date) as date,
      SUM(basic_rpt) as basicRPT, SUM(sef) as sef, SUM(penalties) as penalties,
      SUM(discount) as discounts, SUM(amount) as totalNet, COUNT(*) as transactionCount
    FROM payments GROUP BY date(payment_date) ORDER BY date DESC
  `).all() as Array<Record<string, unknown>>;

  return rows.map(r => {
    const basicRPT = r.basicRPT as number;
    const sef = r.sef as number;
    const penalties = r.penalties as number;
    const discounts = r.discounts as number;
    const totalNet = r.totalNet as number;
    return {
      date: r.date as string,
      basicRPT, sef, penalties, discounts,
      totalGross: totalNet + discounts,
      totalNet,
      transactionCount: r.transactionCount as number,
      status: "Pending" as const,
    };
  });
}

export function getTransactionsByDate(date: string) {
  return db.prepare(`
    SELECT or_number as orNumber, pin, taxpayer, basic_rpt as basicRPT, sef,
      penalties, discount, amount as total, payment_date as time
    FROM payments WHERE date(payment_date) = date(?)
    ORDER BY payment_date DESC
  `).all(date);
}

function nextNumericId(table: string, prefix: string, pad: number): string {
  const row = db
    .prepare(
      `SELECT MAX(CAST(SUBSTR(id, ?) AS INTEGER)) as m
       FROM ${table}
       WHERE id GLOB ?`
    )
    .get(prefix.length + 1, `${prefix}[0-9]*`) as { m: number | null };
  const next = (row.m ?? 0) + 1;
  return `${prefix}${String(next).padStart(pad, "0")}`;
}

export function nextSOAId(): string {
  return nextNumericId("soas", "SOA-2026-", 4);
}

export function nextAuditId(): string {
  return nextNumericId("audit_log", "LOG-2026-", 6);
}

export function nextPaymentId(): string {
  return nextNumericId("payments", "PAY-", 6);
}
