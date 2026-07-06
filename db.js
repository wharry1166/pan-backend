const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'pan.db');
let db = null;

function toArray(v) {
  if (v === null || v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function wrap(raw) {
  function prepare(sql) {
    const stmt = raw.prepare(sql);
    return {
      all(params) {
        try {
          if (params) stmt.bind(toArray(params));
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          return rows;
        } finally {
          stmt.free();
        }
      },
      get(params) {
        try {
          if (params) stmt.bind(toArray(params));
          const row = stmt.step() ? stmt.getAsObject() : undefined;
          return row;
        } finally {
          stmt.free();
        }
      },
      run(params) {
        try {
          if (params) stmt.bind(toArray(params));
          stmt.step();
        } finally {
          stmt.free();
        }
        const info = raw.exec('SELECT last_insert_rowid() AS id, changes() AS changes');
        const vals = info[0].values[0];
        persist();
        return { lastInsertRowid: vals[0], changes: vals[1] };
      }
    };
  }

  // Run multiple SQL statements (for schema init)
  function exec(sql) {
    raw.exec(sql);
    persist();
  }

  // Run a single statement with params (for simple queries)
  function run(sql, params) {
    const s = raw.prepare(sql);
    try {
      if (params) s.bind(toArray(params));
      s.step();
    } finally {
      s.free();
    }
    persist();
  }

  return { prepare, exec, run };
}

function persist() {
  try {
    const data = db._raw.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.error('Failed to save database:', err.message);
  }
}

async function getDb() {
  if (!db) {
    const SQL = await initSqlJs();

    let raw;
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      raw = new SQL.Database(buffer);
    } else {
      raw = new SQL.Database();
    }

    db = wrap(raw);
    db._raw = raw;

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        created_at  TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        year        INTEGER NOT NULL,
        number      INTEGER NOT NULL,
        name        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        content     TEXT NOT NULL DEFAULT '',
        author      TEXT NOT NULL DEFAULT '',
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now')),
        UNIQUE(year, number)
      );
      CREATE TABLE IF NOT EXISTS media (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        file_path     TEXT NOT NULL,
        file_type     TEXT NOT NULL,
        is_video      INTEGER DEFAULT 0,
        is_default    INTEGER DEFAULT 0,
        sort_order    INTEGER DEFAULT 0,
        created_at    TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_events_year_number ON events(year, number);
      CREATE INDEX IF NOT EXISTS idx_media_event_id ON media(event_id);
      CREATE TABLE IF NOT EXISTS sleep_photos (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path   TEXT NOT NULL,
        uploaded_by TEXT NOT NULL DEFAULT '',
        created_at  TEXT DEFAULT (datetime('now'))
      );
    `);

    // Migration: add author column for existing databases
    try { raw.run("ALTER TABLE events ADD COLUMN author TEXT NOT NULL DEFAULT ''"); } catch {}
    // Migration: sleep_photos table
    try { raw.run("CREATE TABLE IF NOT EXISTS sleep_photos (id INTEGER PRIMARY KEY AUTOINCREMENT, file_path TEXT NOT NULL, uploaded_by TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT (datetime('now')))"); } catch {}
  }
  return db;
}

module.exports = { getDb };
