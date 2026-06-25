/**
 * Adaptateur de base de données unifié.
 * 
 * - En développement : utilise SQLite (better-sqlite3) — synchrone, fichiers local
 * - En production (Vercel + DATABASE_URL définie) : utilise Neon PostgreSQL — asynchrone
 * 
 * Les pages doivent utiliser les fonctions async `dbAll()`, `dbGet()`, `dbRun()`.
 * Pour la rétrocompatibilité, l'objet `db` expose aussi `prepare().all()` etc.
 */

// Activer Neon si DATABASE_URL est définie (prod sur Vercel OU seed local)
const USE_NEON = !!process.env.DATABASE_URL;

// Type unifié pour les résultats de requêtes
type DbRow = Record<string, any>;

// ─── Client SQLite (développement local) ─────────────────────────────────
let sqliteDb: any = null;

if (!USE_NEON) {
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

// ─── Client Neon (production) ────────────────────────────────────────────
let neonQuery: ((sql: string, params?: any[]) => Promise<any[]>) | null = null;

if (USE_NEON) {
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!);
  neonQuery = async (sqlText: string, params: any[] = []) => {
    // Convertir ? → $1, $2, ... pour PostgreSQL
    let idx = 0;
    const pgSql = sqlText.replace(/\?/g, () => `$${++idx}`);
    const result = await sql.unsafe(pgSql, params);
    return Array.isArray(result) ? result : (result as any)?.rows || [];
  };
}

// ─── API publique unifiée ────────────────────────────────────────────────

/** Exécute une requête SELECT et retourne toutes les lignes */
export async function dbAll(sql: string, ...params: any[]): Promise<DbRow[]> {
  if (neonQuery) return neonQuery(sql, params);
  if (sqliteDb) return sqliteDb.prepare(sql).all(...params) as DbRow[];
  return [];
}

/** Exécute une requête SELECT et retourne la première ligne */
export async function dbGet(sql: string, ...params: any[]): Promise<DbRow | null> {
  if (neonQuery) {
    const rows = await neonQuery(sql, params);
    return rows[0] || null;
  }
  if (sqliteDb) return (sqliteDb.prepare(sql).get(...params) as DbRow) || null;
  return null;
}

/** Exécute une requête INSERT/UPDATE/DELETE */
export async function dbRun(sql: string, ...params: any[]): Promise<any> {
  if (neonQuery) {
    await neonQuery(sql, params);
    return { changes: 1 };
  }
  if (sqliteDb) return sqliteDb.prepare(sql).run(...params);
  return { changes: 0 };
}

/** Exécute du SQL brut (CREATE TABLE, etc.) */
export async function dbExec(sql: string): Promise<void> {
  if (sqliteDb) {
    sqliteDb.exec(sql);
  } else if (neonQuery) {
    // Split multiple statements for Neon
    const stmts = sql.split(';').filter(s => s.trim());
    for (const stmt of stmts) {
      await neonQuery(stmt.trim());
    }
  }
}

// ─── Rétrocompatibilité : objet `db` style better-sqlite3 ────────────────
// Permet au code existant (pages, seed) de continuer à fonctionner sans `await`
// Note : NE fonctionne QUE pour SQLite. Neon nécessite les fonctions async.

const db: any = {
  prepare: (sql: string) => ({
    all: (...params: any[]) => {
      if (sqliteDb) return sqliteDb.prepare(sql).all(...params);
      throw new Error('[db] prepare().all() nécessite SQLite. Utilise dbAll() pour Neon.');
    },
    get: (...params: any[]) => {
      if (sqliteDb) return sqliteDb.prepare(sql).get(...params);
      throw new Error('[db] prepare().get() nécessite SQLite. Utilise dbGet() pour Neon.');
    },
    run: (...params: any[]) => {
      if (sqliteDb) return sqliteDb.prepare(sql).run(...params);
      throw new Error('[db] prepare().run() nécessite SQLite. Utilise dbRun() pour Neon.');
    },
  }),
  exec: (sql: string) => {
    if (sqliteDb) return sqliteDb.exec(sql);
    throw new Error('[db] exec() nécessite SQLite. Utilise dbExec() pour Neon.');
  },
  transaction: (fn: Function) => {
    if (sqliteDb) return sqliteDb.transaction(fn);
    throw new Error('[db] transaction() nécessite SQLite.');
  },
};

export default db;
