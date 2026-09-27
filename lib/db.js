import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool;
if (process.env.DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
}

let isPgConnected = false;
let initPromise = null;
const inMemoryScans = [];
let memoryIdCounter = 1;

export async function initDb() {
  if (!process.env.DATABASE_URL || !pool) {
    isPgConnected = false;
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const client = await pool.connect();
        await client.query(`
          CREATE TABLE IF NOT EXISTS scans (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            scanned_at TIMESTAMP DEFAULT NOW(),
            results JSONB NOT NULL
          );
        `);
        client.release();
        isPgConnected = true;
      } catch (err) {
        console.warn('[DB] PostgreSQL connection failed, using fallback store:', err.message);
        isPgConnected = false;
      }
    })();
  }

  await initPromise;
}

export async function saveScan(url, results) {
  await initDb();

  if (isPgConnected && pool) {
    try {
      const res = await pool.query(
        `INSERT INTO scans (url, results) VALUES ($1, $2) RETURNING id, url, scanned_at, results`,
        [url, JSON.stringify(results)]
      );
      return res.rows[0];
    } catch (err) {
      console.error('[DB] Failed to insert scan into Postgres:', err.message);
    }
  }

  // Fallback in-memory storage for local dev / testing
  const scanRecord = {
    id: memoryIdCounter++,
    url,
    scanned_at: new Date().toISOString(),
    results
  };
  inMemoryScans.push(scanRecord);
  return scanRecord;
}

export async function getScanById(id) {
  await initDb();

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return null;

  if (isPgConnected && pool) {
    try {
      const res = await pool.query(`SELECT id, url, scanned_at, results FROM scans WHERE id = $1`, [numericId]);
      if (res.rows.length > 0) {
        return res.rows[0];
      }
      return null;
    } catch (err) {
      console.error('[DB] Failed to query scan from Postgres:', err.message);
    }
  }

  return inMemoryScans.find(s => s.id === numericId) || null;
}
