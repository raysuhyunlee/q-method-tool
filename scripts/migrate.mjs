// Usage: POSTGRES_URL=... node scripts/migrate.mjs
// (or `vercel env pull .env.local` then `node --env-file=.env.local scripts/migrate.mjs`)
import { readFile } from 'node:fs/promises';
import { createPool } from '@vercel/postgres';

const sqlText = await readFile(new URL('./migrate.sql', import.meta.url), 'utf8');
const pool = createPool();
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(sqlText);
  await client.query('COMMIT');
  const { rows } = await client.query(
    'SELECT experiment_id, status, COUNT(*)::int AS count FROM q_method_results GROUP BY 1, 2 ORDER BY 1, 2'
  );
  console.log('Migration complete.');
  console.table(rows);
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Migration failed, rolled back:', error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
