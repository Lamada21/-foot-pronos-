/**
 * Adaptateur de base de données unifié.
 * 
 * - En développement : utilise SQLite (better-sqlite3) — synchrone, fichiers local
 * - En production (Vercel + DATABASE_URL définie) : utilise PostgreSQL via pg (node-postgres) — asynchrone
 * 
 * Les pages doivent utiliser les fonctions async `dbAll()`, `dbGet()`, `dbRun()`.
 * Pour la rétrocompatibilité, l'objet `db` expose aussi `prepare().all()` etc.
 */

// Activer PostgreSQL si DATABASE_URL est définie (prod sur Vercel OU seed local)
const USE_PG = !!process.env.DATABASE_URL;

// Type unifié pour les résultats de requêtes
type DbRow = Record<string, any>;

// ─── Client SQLite (développement local) ─────────────────────────────────
let sqliteDb: any = null;

if (!USE_PG) {
  // Import dynamique pour éviter l'erreur sur Vercel (better-sqlite3 pas dispo)
  try {
    const Database = require('better-sqlite3');
    const path = require('path');
    sqliteDb = new Database(path.join(process.cwd(), 'football.db'));
    sqliteDb.pragma('journal_mode = WAL');
  } catch (e) {
    console.warn('[db] SQLite non disponible, vérifie que better-sqlite3 est installé');
  }
}

// ─── Client PostgreSQL (production Vercel / seed local) ──────────────────
let pgQuery: ((sql: string, params?: any[]) => Promise<any[]>) | null = null;
let pgPool: any = null;

if (USE_PG) {
  const { Pool } = require('pg');
  
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5, // Pool léger pour serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  pgQuery = async (queryText: string, params: any[] = []) => {
    const client = await pgPool.connect();
    try {
      const result = await client.query(queryText, params);
      return result.rows;
    } finally {
      client.release();
    }
  };
}

// ─── API publique unifiée ────────────────────────────────────────────────

/** Exécute une requête SELECT et retourne toutes les lignes */
export async function dbAll(sql: string, ...params: any[]): Promise<DbRow[]> {
  if (pgQuery) return pgQuery(sql, params);
  if (sqliteDb) return sqliteDb.prepare(sql).all(...params) as DbRow[];
  return [];
}

/** Exécute une requête SELECT et retourne la première ligne */
export async function dbGet(sql: string, ...params: any[]): Promise<DbRow | null> {
  if (pgQuery) {
    const rows = await pgQuery(sql, params);
    return rows[0] || null;
  }
  if (sqliteDb) return (sqliteDb.prepare(sql).get(...params) as DbRow) || null;
  return null;
}

/** Exécute une requête INSERT/UPDATE/DELETE */
export async function dbRun(sql: string, ...params: any[]): Promise<any> {
  if (pgQuery) {
    await pgQuery(sql, params);
    return { changes: 1 };
  }
  if (sqliteDb) return sqliteDb.prepare(sql).run(...params);
  return { changes: 0 };
}

/** Exécute du SQL brut (CREATE TABLE, etc.) — split multi-statements pour PG */
export async function dbExec(sql: string): Promise<void> {
  if (sqliteDb) {
    sqliteDb.exec(sql);
  } else if (pgQuery) {
    const stmts = sql.split(';').filter(s => s.trim());
    for (const stmt of stmts) {
      await pgQuery(stmt.trim());
    }
  }
}

/**
 * Ferme proprement le pool PostgreSQL (à appeler en fin de vie).
 * Utile pour les scripts CLI (seed, scrape) pour éviter les processus pendants.
 */
export async function closePgPool(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    pgQuery = null;
  }
}

// ─── Rétrocompatibilité : objet `db` style better-sqlite3 ────────────────
// Permet au code existant (pages, seed) de continuer à fonctionner sans `await`
// Note : NE fonctionne QUE pour SQLite. PostgreSQL nécessite les fonctions async.

const db: any = {
  prepare: (sql: string) => ({
    all: (...params: any[]) => {
      if (sqliteDb) return sqliteDb.prepare(sql).all(...params);
      throw new Error('[db] prepare().all() nécessite SQLite. Utilise dbAll() pour PostgreSQL.');
    },
    get: (...params: any[]) => {
      if (sqliteDb) return sqliteDb.prepare(sql).get(...params);
      throw new Error('[db] prepare().get() nécessite SQLite. Utilise dbGet() pour PostgreSQL.');
    },
    run: (...params: any[]) => {
      if (sqliteDb) return sqliteDb.prepare(sql).run(...params);
      throw new Error('[db] prepare().run() nécessite SQLite. Utilise dbRun() pour PostgreSQL.');
    },
  }),
  exec: (sql: string) => {
    if (sqliteDb) return sqliteDb.exec(sql);
    throw new Error('[db] exec() nécessite SQLite. Utilise dbExec() pour PostgreSQL.');
  },
  transaction: (fn: Function) => {
    if (sqliteDb) return sqliteDb.transaction(fn);
    throw new Error('[db] transaction() nécessite SQLite.');
  },
};

export default db;
