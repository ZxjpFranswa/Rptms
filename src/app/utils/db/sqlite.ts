import Database from "better-sqlite3";

const DB_PATH = "c:/Users/Vince/Downloads/Web-based project for all devices/data/app.db";

let db: any | null = null;

// Fail fast if this file ever reaches a browser bundle.
if (typeof window !== "undefined") {
  throw new Error(
    "better-sqlite3/DB code was imported in the browser. " +
      "Move DB access to the backend and call it via /api endpoints."
  );
}

export function getDb() {
  if (db) return db;

  // Ensure directory exists.
  // NOTE: better-sqlite3 will create the DB file if it doesn't exist.
  db = new Database(DB_PATH);

  // Use foreign keys
  db.pragma("foreign_keys = ON");
  return db;
}

