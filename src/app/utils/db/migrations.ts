import { getDb } from "./sqlite";

export function migrate() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS taxpayers (
      pin TEXT PRIMARY KEY,
      taxpayerName TEXT NOT NULL,
      taxpayerEmail TEXT,
      propertyAddress TEXT,
      assessedValue REAL DEFAULT 0,
      basicRPT REAL DEFAULT 0,
      sef REAL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approval_requests (
      id TEXT PRIMARY KEY,
      pin TEXT NOT NULL,
      taxpayer TEXT NOT NULL,
      requestType TEXT NOT NULL,
      currentAmount REAL NOT NULL,
      proposedAmount REAL NOT NULL,
      reason TEXT NOT NULL,
      requestedBy TEXT NOT NULL,
      requestDate TEXT NOT NULL,
      status TEXT NOT NULL,
      treasurerNotes TEXT,
      reviewDate TEXT,
      finalizedAmount REAL,
      FOREIGN KEY(pin) REFERENCES taxpayers(pin)
    );

    CREATE TABLE IF NOT EXISTS soas (
      id TEXT PRIMARY KEY,
      pin TEXT NOT NULL,
      taxpayer TEXT NOT NULL,
      taxpayerEmail TEXT,
      propertyAddress TEXT,
      assessedValue REAL DEFAULT 0,
      basicRPT REAL DEFAULT 0,
      sef REAL DEFAULT 0,
      penalties REAL DEFAULT 0,
      penaltyReason TEXT,
      discount REAL DEFAULT 0,
      amountDueOriginal REAL DEFAULT 0,
      balanceDue REAL DEFAULT 0,
      amountPaidTotal REAL DEFAULT 0,
      fiscalYear TEXT,
      status TEXT NOT NULL,
      generatedBy TEXT,
      generatedDate TEXT,
      approvalRequestId TEXT,
      sentToTaxpayer INTEGER NOT NULL DEFAULT 0,
      sentDate TEXT,
      FOREIGN KEY(pin) REFERENCES taxpayers(pin)
    );
  `);
}

