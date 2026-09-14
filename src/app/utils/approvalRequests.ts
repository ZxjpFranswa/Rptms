// Shared approval request management system (client-side)
// IMPORTANT: This file must NOT import sqlite/better-sqlite3.
// All persistence happens via the backend API.

export interface ApprovalRequest {
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

  // Persist the exact payable amount after Treasurer decision.
  // For Approved: equals proposedAmount
  // For Rejected: equals currentAmount
  finalizedAmount?: number;
}

type ApprovalUpdateListener = () => void;
const listeners: ApprovalUpdateListener[] = [];

export function subscribeToApprovalUpdates(listener: ApprovalUpdateListener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

const API_BASE = ""; // same-origin

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

export async function getAllApprovalRequests(): Promise<ApprovalRequest[]> {
  return apiFetch<ApprovalRequest[]>("/api/approval-requests");
}

export async function getApprovalRequestsByStatus(
  status: "Pending" | "Approved" | "Rejected"
): Promise<ApprovalRequest[]> {
  const all = await getAllApprovalRequests();
  return all.filter(r => r.status === status);
}

export async function getApprovalRequestById(
  id: string
): Promise<ApprovalRequest | undefined> {
  try {
    return await apiFetch<ApprovalRequest>(
      `/api/approval-requests/${encodeURIComponent(id)}`
    );
  } catch {
    return undefined;
  }
}

export async function getApprovalRequestsByPIN(pin: string): Promise<ApprovalRequest[]> {
  return apiFetch<ApprovalRequest[]>(
    `/api/approval-requests/pin/${encodeURIComponent(pin)}`
  );
}

export async function createApprovalRequest(
  pin: string,
  taxpayer: string,
  requestType: "Penalty Waiver" | "Tax Adjustment",
  currentAmount: number,
  proposedAmount: number,
  reason: string,
  requestedBy: string
): Promise<ApprovalRequest> {
  const newRequest: ApprovalRequest = {
    id: `REQ-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
    pin,
    taxpayer,
    requestType,
    currentAmount,
    proposedAmount,
    reason,
    requestedBy,
    requestDate: new Date().toISOString(),
    status: "Pending",
  };

  const created = await apiFetch<ApprovalRequest>("/api/approval-requests", {
    method: "POST",
    body: JSON.stringify(newRequest),
  });

  notifyListeners();
  return created;
}

export async function updateApprovalRequestStatus(
  id: string,
  status: "Approved" | "Rejected",
  treasurerNotes: string,
  finalizedAmount?: number
): Promise<ApprovalRequest | null> {
  const payload = {
    status,
    treasurerNotes,
    finalizedAmount,
  };

  try {
    const updated = await apiFetch<ApprovalRequest>(
      `/api/approval-requests/${encodeURIComponent(id)}/status`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    notifyListeners();
    return updated;
  } catch {
    return null;
  }
}

// Helps the clerk know if their request was approved/rejected
export async function getLatestApprovalForPIN(
  pin: string,
  proposedAmount: number
): Promise<ApprovalRequest | null> {
  const requests = (await getApprovalRequestsByPIN(pin))
    .filter(req => req.proposedAmount === proposedAmount)
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return requests.length > 0 ? requests[0] : null;
}

