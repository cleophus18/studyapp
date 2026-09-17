import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "../config.js";
import { SCHEMA_SQL } from "./schema.js";

let db;

/**
 * Returns the shared SQLite connection (created lazily).
 * Uses Node's built-in `node:sqlite` module – no native compilation required.
 */
export function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  db = new DatabaseSync(config.databasePath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA_SQL);
  return db;
}

/** Run `fn` inside a transaction. Rolls back on error. */
export function transaction(fn) {
  const database = getDb();
  database.exec("BEGIN");
  try {
    const result = fn(database);
    database.exec("COMMIT");
    return result;
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}

// Small query helpers to keep route code compact.
export const q = {
  get(sql, ...params) {
    return getDb()
      .prepare(sql)
      .get(...params);
  },
  all(sql, ...params) {
    return getDb()
      .prepare(sql)
      .all(...params);
  },
  run(sql, ...params) {
    return getDb()
      .prepare(sql)
      .run(...params);
  },
};

export function nowIso() {
  return new Date().toISOString();
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
