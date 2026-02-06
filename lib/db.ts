import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Database');

const DB_PATH = process.env.STORYSCAN_DB_PATH || path.join(process.cwd(), 'data', 'storyscan.db');

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (db) return db;

  // Ensure the data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created data directory: ${dir}`);
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initializeSchema(db);
  logger.info(`Database initialized at: ${DB_PATH}`);

  return db;
}

function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tracked_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      directory_config_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS history_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracked_path_id INTEGER NOT NULL REFERENCES tracked_paths(id) ON DELETE CASCADE,
      size_bytes INTEGER NOT NULL,
      file_count INTEGER DEFAULT 0,
      folder_count INTEGER DEFAULT 0,
      recorded_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_tracked_path
      ON history_snapshots(tracked_path_id);

    CREATE INDEX IF NOT EXISTS idx_snapshots_recorded_at
      ON history_snapshots(recorded_at);
  `);
}

// --- Tracked Paths ---

interface TrackedPathRow {
  id: number;
  path: string;
  label: string;
  directoryConfigId: string | null;
  createdAt: string;
  isActive: number;
}

export function getAllTrackedPaths() {
  const database = getDatabase();
  const rows = database
    .prepare(
      `SELECT id, path, label, directory_config_id as directoryConfigId,
              created_at as createdAt, is_active as isActive
       FROM tracked_paths ORDER BY created_at DESC`
    )
    .all() as TrackedPathRow[];
  return rows.map((row) => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

export function addTrackedPath(pathStr: string, label: string, directoryConfigId?: string) {
  const database = getDatabase();
  const stmt = database.prepare(
    `INSERT INTO tracked_paths (path, label, directory_config_id) VALUES (?, ?, ?)`
  );
  const result = stmt.run(pathStr, label, directoryConfigId || null);
  return {
    id: result.lastInsertRowid as number,
    path: pathStr,
    label,
    directoryConfigId,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
}

export function updateTrackedPath(id: number, updates: { label?: string; isActive?: boolean }) {
  const database = getDatabase();
  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (updates.label !== undefined) {
    setClauses.push('label = ?');
    params.push(updates.label);
  }
  if (updates.isActive !== undefined) {
    setClauses.push('is_active = ?');
    params.push(updates.isActive ? 1 : 0);
  }

  if (setClauses.length === 0) return;

  params.push(id);
  database.prepare(`UPDATE tracked_paths SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
}

export function deleteTrackedPath(id: number) {
  const database = getDatabase();
  database.prepare('DELETE FROM tracked_paths WHERE id = ?').run(id);
}

// --- History Snapshots ---

export function recordSnapshot(
  trackedPathId: number,
  sizeBytes: number,
  fileCount: number,
  folderCount: number
) {
  const database = getDatabase();
  database
    .prepare(
      `INSERT INTO history_snapshots (tracked_path_id, size_bytes, file_count, folder_count)
       VALUES (?, ?, ?, ?)`
    )
    .run(trackedPathId, sizeBytes, fileCount, folderCount);
}

export function getSnapshots(pathIds: number[], range: string): Record<string, unknown>[] {
  const database = getDatabase();

  let dateFilter = '';
  switch (range) {
    case '1W':
      dateFilter = "AND recorded_at >= datetime('now', '-7 days')";
      break;
    case '1M':
      dateFilter = "AND recorded_at >= datetime('now', '-1 month')";
      break;
    case '3M':
      dateFilter = "AND recorded_at >= datetime('now', '-3 months')";
      break;
    case '6M':
      dateFilter = "AND recorded_at >= datetime('now', '-6 months')";
      break;
    case '1Y':
      dateFilter = "AND recorded_at >= datetime('now', '-1 year')";
      break;
    case 'ALL':
    default:
      dateFilter = '';
      break;
  }

  const placeholders = pathIds.map(() => '?').join(',');
  return database
    .prepare(
      `SELECT id, tracked_path_id as trackedPathId, size_bytes as sizeBytes,
              file_count as fileCount, folder_count as folderCount,
              recorded_at as recordedAt
       FROM history_snapshots
       WHERE tracked_path_id IN (${placeholders}) ${dateFilter}
       ORDER BY recorded_at ASC`
    )
    .all(...pathIds) as Record<string, unknown>[];
}

// --- Helpers ---

export function getActiveTrackedPaths() {
  const database = getDatabase();
  const rows = database
    .prepare(
      `SELECT id, path, label, directory_config_id as directoryConfigId,
              created_at as createdAt, is_active as isActive
       FROM tracked_paths WHERE is_active = 1 ORDER BY created_at DESC`
    )
    .all() as TrackedPathRow[];
  return rows.map((row) => ({
    ...row,
    isActive: Boolean(row.isActive),
  }));
}

export function closeDatabaseConnection() {
  if (db) {
    db.close();
    db = null;
  }
}
