import { Pool } from 'pg';
import { assertEnv, env } from './env';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    assertEnv();
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
}