import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync } from "fs";

const DB_PATH = process.env.DB_PATH || "./study_guide.db";
let db;

export async function initDb() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    db = new SQL.Database(readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  persist();
  return db;
}

function persist() {
  writeFileSync(DB_PATH, Buffer.from(db.export()));
}

export function dbGet(key) {
  const row = db.exec("SELECT value FROM kv WHERE key = ?", [key]);
  if (!row.length || !row[0].values.length) return null;
  try { return JSON.parse(row[0].values[0][0]); } catch { return row[0].values[0][0]; }
}

export function dbSet(key, value) {
  const json = JSON.stringify(value);
  db.run(
    "INSERT INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
    [key, json, json]
  );
  persist();
}

export function dbDelete(key) {
  db.run("DELETE FROM kv WHERE key = ?", [key]);
  persist();
}

export function dbGetAll() {
  const rows = db.exec("SELECT key, value FROM kv");
  if (!rows.length) return {};
  const result = {};
  for (const [k, v] of rows[0].values) {
    try { result[k] = JSON.parse(v); } catch { result[k] = v; }
  }
  return result;
}
