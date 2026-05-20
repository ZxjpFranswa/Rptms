// Shared approval request management system
// This simulates a shared database for approval requests between Revenue Clerk and Treasurer

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
}

// In-memory storage for approval requests (simulates a database)
let approvalRequests: ApprovalRequest[] = [
  {
    id: "REQ-2026-0012",
    pin: "001-2024-0089",
    taxpayer: "Pedro Reyes",
    requestType: "Penalty Waiver",
    currentAmount: 450,
    proposedAmount: 100,
    reason: "Taxpayer was hospitalized during payment period, requesting partial penalty waiver",
    requestedBy: "Ana Lopez (Revenue Clerk)",
    requestDate: "2026-05-11T09:15:00",
    status: "Approved",
    treasurerNotes: "Approved - Medical documentation provided and verified. Penalty reduced from 450 to 100.",
    reviewDate: "2026-05-12T14:30:00",
  },
  {
    id: "REQ-2026-0015",
    pin: "001-2024-0234",
    taxpayer: "Ana Garcia",
    requestType: "Tax Adjustment",
    currentAmount: 6750,
    proposedAmount: 6250,
    reason: "Requesting special senior citizen discount",
    requestedBy: "Ana Lopez (Revenue Clerk)",
    requestDate: "2026-05-12T10:00:00",
    status: "Rejected",
    treasurerNotes: "Rejected - Senior citizen exemption should be processed through Property Appraisal Module, not as SOA adjustment. Please coordinate with Assessor's Office.",
    reviewDate: "2026-05-12T15:45:00",
  },
  {
    id: "REQ-2026-0018",
    pin: "001-2024-0312",
    taxpayer: "Carlos Mendoza",
    requestType: "Penalty Waiver",
    currentAmount: 200,
    proposedAmount: 50,
    reason: "Natural disaster affected area, requesting penalty reduction per municipal ordinance",
    requestedBy: "Ana Lopez (Revenue Clerk)",
    requestDate: "2026-05-12T11:20:00",
    status: "Approved",
    treasurerNotes: "Approved - Property is within declared calamity zone. Penalty reduction granted as per Ordinance 2026-08.",
    reviewDate: "2026-05-12T16:10:00",
  },
];

// Event listeners for real-time updates
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

// Get all approval requests
export function getAllApprovalRequests(): ApprovalRequest[] {
  return [...approvalRequests];
}

// Get approval requests by status
export function getApprovalRequestsByStatus(status: "Pending" | "Approved" | "Rejected"): ApprovalRequest[] {
  return approvalRequests.filter(req => req.status === status);
}

// Get approval request by ID
export function getApprovalRequestById(id: string): ApprovalRequest | undefined {
  return approvalRequests.find(req => req.id === id);
}

// Get approval requests by PIN (for checking status of a specific taxpayer's SOA)
export function getApprovalRequestsByPIN(pin: string): ApprovalRequest[] {
  return approvalRequests.filter(req => req.pin === pin);
}

// Create a new approval request (used by Revenue Clerk)
export function createApprovalRequest(
  pin: string,
  taxpayer: string,
  requestType: "Penalty Waiver" | "Tax Adjustment",
  currentAmount: number,
  proposedAmount: number,
  reason: string,
  requestedBy: string
): ApprovalRequest {
  const newRequest: ApprovalRequest = {
    id: `REQ-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
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

  approvalRequests.push(newRequest);
  notifyListeners();
  return newRequest;
}

// Update approval request status (used by Treasurer)
export function updateApprovalRequestStatus(
  id: string,
  status: "Approved" | "Rejected",
  treasurerNotes: string
): ApprovalRequest | null {
  const request = approvalRequests.find(req => req.id === id);
  if (!request) {
    return null;
  }

  request.status = status;
  request.treasurerNotes = treasurerNotes;
  request.reviewDate = new Date().toISOString();

  notifyListeners();
  return request;
}

// Get the latest approval request for a specific PIN and amount
// This helps the clerk know if their request was approved/rejected
export function getLatestApprovalForPIN(pin: string, proposedAmount: number): ApprovalRequest | null {
  const requests = approvalRequests
    .filter(req => req.pin === pin && req.proposedAmount === proposedAmount)
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return requests.length > 0 ? requests[0] : null;
}
