import { db } from "./connection.js";

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS taxpayers (
      pin TEXT PRIMARY KEY,
      taxpayer_name TEXT NOT NULL,
      taxpayer_email TEXT,
      property_address TEXT,
      assessed_value REAL NOT NULL,
      basic_rpt REAL NOT NULL,
      sef REAL NOT NULL,
      penalty_percentage REAL NOT NULL DEFAULT 0,
      penalty_reason TEXT NOT NULL DEFAULT '',
      fiscal_year TEXT NOT NULL DEFAULT '2026',
      status TEXT NOT NULL DEFAULT 'Unpaid',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS approval_requests (
      id TEXT PRIMARY KEY,
      pin TEXT NOT NULL REFERENCES taxpayers(pin),
      taxpayer TEXT NOT NULL,
      request_type TEXT NOT NULL,
      current_amount REAL NOT NULL,
      proposed_amount REAL NOT NULL,
      reason TEXT NOT NULL,
      requested_by TEXT NOT NULL,
      request_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      treasurer_notes TEXT,
      review_date TEXT,
      finalized_amount REAL
    );

    CREATE TABLE IF NOT EXISTS soas (
      id TEXT PRIMARY KEY,
      pin TEXT NOT NULL REFERENCES taxpayers(pin),
      taxpayer TEXT NOT NULL,
      taxpayer_email TEXT NOT NULL,
      property_address TEXT NOT NULL,
      assessed_value REAL NOT NULL,
      basic_rpt REAL NOT NULL,
      sef REAL NOT NULL,
      penalties REAL NOT NULL,
      penalty_reason TEXT NOT NULL DEFAULT '',
      discount REAL NOT NULL DEFAULT 0,
      amount_due_original REAL NOT NULL,
      balance_due REAL NOT NULL,
      amount_paid_total REAL NOT NULL DEFAULT 0,
      fiscal_year TEXT NOT NULL,
      status TEXT NOT NULL,
      generated_by TEXT NOT NULL,
      generated_date TEXT NOT NULL,
      approval_request_id TEXT REFERENCES approval_requests(id),
      sent_to_taxpayer INTEGER NOT NULL DEFAULT 0,
      sent_date TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      or_number TEXT NOT NULL UNIQUE,
      soa_id TEXT NOT NULL REFERENCES soas(id),
      pin TEXT NOT NULL REFERENCES taxpayers(pin),
      taxpayer TEXT NOT NULL,
      property_address TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      payment_date TEXT NOT NULL,
      fiscal_year TEXT NOT NULL,
      cashier TEXT NOT NULL,
      basic_rpt REAL NOT NULL,
      sef REAL NOT NULL,
      penalties REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      changes TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      ip_address TEXT NOT NULL DEFAULT '127.0.0.1'
    );

    CREATE INDEX IF NOT EXISTS idx_approval_pin ON approval_requests(pin);
    CREATE INDEX IF NOT EXISTS idx_soa_pin ON soas(pin);
    CREATE INDEX IF NOT EXISTS idx_payments_pin ON payments(pin);
    CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
  `);
}
