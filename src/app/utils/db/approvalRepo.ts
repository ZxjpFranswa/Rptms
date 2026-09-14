import { getDb } from "./sqlite";
import type { ApprovalRequest } from "../approvalRequests";

function mapRow(row: any): ApprovalRequest {
  return {
    id: row.id,
    pin: row.pin,
    taxpayer: row.taxpayer,
    requestType: row.requestType,
    currentAmount: Number(row.currentAmount),
    proposedAmount: Number(row.proposedAmount),
    reason: row.reason,
    requestedBy: row.requestedBy,
    requestDate: row.requestDate,
    status: row.status,
    treasurerNotes: row.treasurerNotes ?? undefined,
    reviewDate: row.reviewDate ?? undefined,
    finalizedAmount: row.finalizedAmount ?? undefined,
  };
}

export function getAllApprovalRequests(): ApprovalRequest[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM approval_requests ORDER BY requestDate DESC`).all();
  return rows.map(mapRow);
}

export function getApprovalRequestsByStatus(status: ApprovalRequest["status"]): ApprovalRequest[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM approval_requests WHERE status = ? ORDER BY requestDate DESC`).all(status);
  return rows.map(mapRow);
}

export function getApprovalRequestById(id: string): ApprovalRequest | undefined {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM approval_requests WHERE id = ?`).get(id) as any | undefined;
  return row ? mapRow(row) : undefined;
}

export function getApprovalRequestsByPIN(pin: string): ApprovalRequest[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM approval_requests WHERE pin = ? ORDER BY requestDate DESC`).all(pin);
  return rows.map(mapRow);
}

export function createApprovalRequest(newRequest: ApprovalRequest) {
  const db = getDb();
  db.prepare(
    `INSERT INTO approval_requests (
      id, pin, taxpayer, requestType, currentAmount, proposedAmount, reason,
      requestedBy, requestDate, status, treasurerNotes, reviewDate, finalizedAmount
    ) VALUES (
      @id, @pin, @taxpayer, @requestType, @currentAmount, @proposedAmount, @reason,
      @requestedBy, @requestDate, @status, @treasurerNotes, @reviewDate, @finalizedAmount
    )`
  ).run(newRequest);
}

export function updateApprovalRequestStatus(
  id: string,
  status: "Approved" | "Rejected",
  treasurerNotes: string,
  finalizedAmount?: number
): ApprovalRequest | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM approval_requests WHERE id = ?`).get(id) as any | undefined;
  if (!row) return null;

  db.prepare(
    `UPDATE approval_requests SET status = ?, treasurerNotes = ?, reviewDate = ?, finalizedAmount = ? WHERE id = ?`
  ).run(status, treasurerNotes, new Date().toISOString(), finalizedAmount ?? null, id);

  const updated = db.prepare(`SELECT * FROM approval_requests WHERE id = ?`).get(id) as any;
  return mapRow(updated);
}

