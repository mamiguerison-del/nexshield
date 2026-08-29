import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { config } from "./config.js";

const databasePath = path.resolve(config.databaseFile);
const databaseDirectory = path.dirname(databasePath);

fs.mkdirSync(databaseDirectory, {
  recursive: true
});

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new'
        CHECK(status IN ('new', 'read', 'closed')),
    created_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at
ON contacts(created_at);

CREATE INDEX IF NOT EXISTS idx_contacts_status
ON contacts(status);

CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);
`);

export function closeDatabase() {
  if (db.open) {
    db.close();
  }
}
