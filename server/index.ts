import express from "express";
import cors from "cors";
import { runMigrations } from "./db/migrate.js";
import { seedDatabase } from "./db/seed.js";
import * as repo from "./db/repositories.js";
import type { ApprovalRequestRow, SOARow } from "./db/types.js";

runMigrations();
seedDatabase();
repo.dedupeSentSOAQueue();

const app = express();
const PORT = process.env.PORT ?? 3100;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Taxpayers
app.get("/api/taxpayers", (_req, res) => {
  res.json(repo.getAllTaxpayers());
});

app.get("/api/taxpayers/:pin", (req, res) => {
  const taxpayer = repo.getTaxpayerByPin(req.params.pin);
  if (!taxpayer) return res.status(404).json({ error: "Taxpayer not found" });
  res.json(taxpayer);
});

// Approval requests
app.get("/api/approval-requests", (_req, res) => {
  res.json(repo.getAllApprovals());
});

app.get("/api/approval-requests/pin/:pin", (req, res) => {
  res.json(repo.getApprovalsByPin(req.params.pin));
});

app.get("/api/approval-requests/:id", (req, res) => {
  const approval = repo.getApprovalById(req.params.id);
  if (!approval) return res.status(404).json({ error: "Not found" });
  res.json(approval);
});

app.post("/api/approval-requests", (req, res) => {
  const body = req.body as ApprovalRequestRow;
  const created = repo.createApproval(body);
  repo.createAuditLog({
    id: repo.nextAuditId(),
    timestamp: new Date().toISOString(),
    userId: "USER-003",
    userName: body.requestedBy,
    action: "Submitted Approval Request",
    entityType: body.requestType,
    entityId: body.id,
    changes: `Requested change from ₱${body.currentAmount} to ₱${body.proposedAmount}`,
    reason: body.reason,
    ipAddress: "127.0.0.1",
  });
  res.status(201).json(created);
});

app.post("/api/approval-requests/:id/status", (req, res) => {
  const { status, treasurerNotes, finalizedAmount } = req.body as {
    status: "Approved" | "Rejected";
    treasurerNotes: string;
    finalizedAmount?: number;
  };
  const existing = repo.getApprovalById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const amount = finalizedAmount ?? (status === "Approved" ? existing.proposedAmount : existing.currentAmount);
  const updated = repo.updateApprovalStatus(req.params.id, status, treasurerNotes, amount);
  if (!updated) return res.status(404).json({ error: "Not found" });

  repo.createAuditLog({
    id: repo.nextAuditId(),
    timestamp: new Date().toISOString(),
    userId: "USER-001",
    userName: "Maria Santos (Treasurer)",
    action: `${status} ${existing.requestType}`,
    entityType: existing.requestType,
    entityId: existing.id,
    changes: `Decision: ${status}. Final amount ₱${amount}`,
    reason: treasurerNotes,
    ipAddress: "127.0.0.1",
  });

  res.json(updated);
});

// SOAs
app.get("/api/soas", (_req, res) => {
  res.json(repo.getAllSOAs());
});

app.get("/api/soas/sent", (_req, res) => {
  res.json(repo.getSentSOAs());
});

app.get("/api/soas/payment", (req, res) => {
  const pin = req.query.pin as string;
  if (!pin) return res.status(400).json({ error: "pin required" });
  const soa = repo.getSOAForPayment(pin);
  res.json(soa);
});

app.get("/api/soas/pin/:pin/latest", (req, res) => {
  res.json(repo.getLatestSOAForPin(req.params.pin));
});

app.get("/api/soas/pin/:pin", (req, res) => {
  res.json(repo.getSOAsByPin(req.params.pin));
});

app.get("/api/soas/:id", (req, res) => {
  const soa = repo.getSOAById(req.params.id);
  if (!soa) return res.status(404).json({ error: "Not found" });
  res.json(soa);
});

app.post("/api/soas", (req, res) => {
  const body = req.body as SOARow;
  const soa = repo.createSOA({ ...body, id: repo.nextSOAId() });
  repo.createAuditLog({
    id: repo.nextAuditId(),
    timestamp: new Date().toISOString(),
    userId: "USER-003",
    userName: body.generatedBy,
    action: "Generated SOA",
    entityType: "Tax Bill",
    entityId: soa.id,
    changes: `SOA ${soa.id} for PIN ${soa.pin}, amount due ₱${soa.amountDueOriginal}`,
    reason: soa.penaltyReason || "Regular SOA generation",
    ipAddress: "127.0.0.1",
  });
  res.status(201).json(soa);
});

app.post("/api/soas/:id/send", (req, res) => {
  const soa = repo.markSOAAsSent(req.params.id);
  if (!soa) return res.status(404).json({ error: "Not found" });
  res.json(soa);
});

app.post("/api/soas/:id/pay", (req, res) => {
  const { amountPaid, discount, orNumber, paymentMethod, cashier } = req.body as {
    amountPaid: number;
    discount?: number;
    orNumber: string;
    paymentMethod?: string;
    cashier: string;
  };

  const soa = repo.getSOAById(req.params.id);
  if (!soa) return res.status(404).json({ error: "SOA not found" });

  const updated = repo.applyPaymentToSOA(req.params.id, amountPaid, discount);
  if (!updated) return res.status(404).json({ error: "Payment failed" });

  const payment = repo.createPayment({
    id: repo.nextPaymentId(),
    orNumber,
    soaId: soa.id,
    pin: soa.pin,
    taxpayer: soa.taxpayer,
    propertyAddress: soa.propertyAddress,
    amount: amountPaid,
    paymentMethod: paymentMethod ?? "Cash",
    paymentDate: new Date().toISOString(),
    fiscalYear: soa.fiscalYear,
    cashier,
    basicRPT: soa.basicRPT,
    sef: soa.sef,
    penalties: soa.penalties,
    discount: discount ?? 0,
  });

  repo.createAuditLog({
    id: repo.nextAuditId(),
    timestamp: new Date().toISOString(),
    userId: "USER-002",
    userName: cashier,
    action: "Processed Payment",
    entityType: "Payment",
    entityId: orNumber,
    changes: `Payment of ₱${amountPaid} for PIN ${soa.pin}`,
    reason: "Payment transaction",
    ipAddress: "127.0.0.1",
  });

  res.json({ soa: updated, payment });
});

// Payments
app.get("/api/payments", (_req, res) => {
  res.json(repo.getAllPayments());
});

// Audit log
app.get("/api/audit-log", (_req, res) => {
  res.json(repo.getAllAuditLogs());
});

// Dashboard & collections
app.get("/api/dashboard/stats", (_req, res) => {
  res.json(repo.getDashboardStats());
});

app.get("/api/dashboard/recent-payments", (_req, res) => {
  res.json(repo.getRecentPayments());
});

app.get("/api/collections/daily", (_req, res) => {
  res.json(repo.getDailyCollections());
});

app.get("/api/collections/daily/:date/transactions", (req, res) => {
  res.json(repo.getTransactionsByDate(req.params.date));
});

app.listen(PORT, () => {
  console.log(`RPTMS API running at http://localhost:${PORT}`);
});
