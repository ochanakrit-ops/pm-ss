import { Pool } from 'pg';
import { assertEnv, env } from './env';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    assertEnv();
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      // Supabase pooler works with SSL; keep rejectUnauthorized false for managed cert chain issues.
      ssl: env.DATABASE_URL.includes('sslmode') ? undefined : { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

export async function q<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getPool();
  const res = await p.query(text, params);
  return res.rows as T[];
}
