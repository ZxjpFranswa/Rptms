import { db } from "./connection.js";
import {
  createApproval,
  createAuditLog,
  createPayment,
  createSOA,
} from "./repositories.js";

const taxpayers = [
  ["001-2024-0045", "Juan Dela Cruz", "juan.delacruz@email.com", "Lot 5, Block 3, Magarao, Camarines Sur", 250000, 2500, 2500, 4, "Late payment - 2 months overdue (2% interest per month)", "2026", "Unpaid"],
  ["001-2024-0123", "Maria Santos", "maria.santos@email.com", "Lot 12, Barangay San Juan, Magarao", 180000, 1800, 1800, 0, "", "2026", "Unpaid"],
  ["001-2024-0089", "Pedro Reyes", "pedro.reyes@email.com", "Block 7, Poblacion, Magarao", 320000, 3200, 3200, 8, "Delinquent - 4 months overdue (2% interest per month)", "2026", "Delinquent"],
  ["001-2024-0234", "Ana Garcia", "ana.garcia@email.com", "Lot 23, Barangay Centro, Magarao", 320000, 3200, 3200, 4, "Late payment - 3 months overdue (2% interest per month)", "2026", "Unpaid"],
  ["001-2024-0156", "Roberto Cruz", "roberto.cruz@email.com", "Lot 8, Barangay San Pantaleon, Magarao", 210000, 2100, 2100, 0, "", "2026", "Unpaid"],
  ["001-2024-0267", "Linda Bautista", "linda.bautista@email.com", "Lot 15, Barangay San Miguel, Magarao", 195000, 1950, 1950, 0, "", "2026", "Partial"],
  ["001-2024-0312", "Carlos Mendoza", "carlos.mendoza@email.com", "Block 2, Barangay Norte, Magarao", 185000, 1850, 1850, 2, "Late payment - 1 month overdue", "2026", "Unpaid"],
];

export function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as c FROM taxpayers").get() as { c: number };
  if (count.c > 0) return;

  const insertTaxpayer = db.prepare(`
    INSERT INTO taxpayers (
      pin, taxpayer_name, taxpayer_email, property_address, assessed_value,
      basic_rpt, sef, penalty_percentage, penalty_reason, fiscal_year, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of taxpayers) {
    insertTaxpayer.run(...t);
  }

  createApproval({
    id: "REQ-2026-0012",
    pin: "001-2024-0089",
    taxpayer: "Pedro Reyes",
    requestType: "Penalty Waiver",
    currentAmount: 512,
    proposedAmount: 100,
    reason: "Medical documentation provided",
    requestedBy: "Ana Lopez (Revenue Clerk)",
    requestDate: "2026-05-11T09:00:00",
    status: "Approved",
    treasurerNotes: "Approved with documentation",
    reviewDate: "2026-05-11T14:00:00",
    finalizedAmount: 100,
  });

  createApproval({
    id: "REQ-2026-0018",
    pin: "001-2024-0312",
    taxpayer: "Carlos Mendoza",
    requestType: "Penalty Waiver",
    currentAmount: 74,
    proposedAmount: 50,
    reason: "Calamity zone discount per Ordinance 2026-08",
    requestedBy: "Ana Lopez (Revenue Clerk)",
    requestDate: "2026-05-12T10:00:00",
    status: "Approved",
    treasurerNotes: "Approved per ordinance",
    reviewDate: "2026-05-12T11:00:00",
    finalizedAmount: 50,
  });

  createApproval({
    id: "REQ-2026-0020",
    pin: "001-2024-0234",
    taxpayer: "Ana Garcia",
    requestType: "Penalty Waiver",
    currentAmount: 256,
    proposedAmount: 150,
    reason: "First-time delinquency, good payment history",
    requestedBy: "Ana Lopez (Revenue Clerk)",
    requestDate: "2026-05-13T08:00:00",
    status: "Pending",
  });

  const soas = [
    { id: "SOA-2026-0001", pin: "001-2024-0045", penalties: 200, sent: true, status: "Unpaid" as const },
    { id: "SOA-2026-0002", pin: "001-2024-0123", penalties: 0, sent: true, status: "Unpaid" as const },
    { id: "SOA-2026-0003", pin: "001-2024-0089", penalties: 100, sent: true, status: "Delinquent" as const, approvalId: "REQ-2026-0012" },
    { id: "SOA-2026-0004", pin: "001-2024-0156", penalties: 0, sent: true, status: "Unpaid" as const },
  ];

  for (const s of soas) {
    const tp = db.prepare("SELECT * FROM taxpayers WHERE pin = ?").get(s.pin) as Record<string, unknown>;
    const basic = tp.basic_rpt as number;
    const sef = tp.sef as number;
    const amountDue = basic + sef + s.penalties;

    createSOA({
      id: s.id,
      pin: s.pin,
      taxpayer: tp.taxpayer_name as string,
      taxpayerEmail: (tp.taxpayer_email as string) ?? "",
      propertyAddress: (tp.property_address as string) ?? "",
      assessedValue: tp.assessed_value as number,
      basicRPT: basic,
      sef,
      penalties: s.penalties,
      penaltyReason: s.penalties > 0 ? (tp.penalty_reason as string) : "",
      discount: 0,
      amountDueOriginal: amountDue,
      balanceDue: amountDue,
      amountPaidTotal: 0,
      fiscalYear: "2026",
      status: s.status,
      generatedBy: "Ana Lopez (Revenue Clerk)",
      generatedDate: "2026-05-10T10:00:00",
      approvalRequestId: s.approvalId,
      sentToTaxpayer: s.sent,
      sentDate: s.sent ? "2026-05-10T10:05:00" : undefined,
    });
  }

  createPayment({
    id: "PAY-000001",
    orNumber: "OR-2026-001231",
    soaId: "SOA-2026-0001",
    pin: "001-2024-0267",
    taxpayer: "Linda Bautista",
    propertyAddress: "Lot 15, Barangay San Miguel, Magarao",
    amount: 3510,
    paymentMethod: "Cash",
    paymentDate: "2026-05-11T14:45:00",
    fiscalYear: "2026",
    cashier: "Maria Santos (Cashier)",
    basicRPT: 1950,
    sef: 1950,
    penalties: 0,
    discount: 390,
  });

  createAuditLog({
    id: "LOG-2026-000001",
    timestamp: "2026-05-12T13:45:22",
    userId: "USER-002",
    userName: "Maria Santos (Cashier)",
    action: "Processed Payment",
    entityType: "Payment",
    entityId: "OR-2026-001231",
    changes: "Payment of ₱3,510.00 received for PIN 001-2024-0267",
    reason: "Early payment discount applied",
    ipAddress: "127.0.0.1",
  });

  createAuditLog({
    id: "LOG-2026-000002",
    timestamp: "2026-05-12T11:20:08",
    userId: "USER-003",
    userName: "Ana Lopez (Revenue Clerk)",
    action: "Generated SOA",
    entityType: "Tax Bill",
    entityId: "SOA-2026-0003",
    changes: "SOA generated with approved penalty reduction",
    reason: "Treasurer approved penalty waiver REQ-2026-0012",
    ipAddress: "127.0.0.1",
  });
}
