import { sql } from '@vercel/postgres';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPERIMENT_RE = /^[a-z0-9-]{1,64}$/;

// Upserts one participant session. Called on every sort action (status `in_progress`)
// and once on submission (status `completed`). Completed rows are never overwritten.
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { sessionId, experimentId, userData, qSortResults, locale, completed } = request.body ?? {};

    if (!UUID_RE.test(sessionId ?? '') || !EXPERIMENT_RE.test(experimentId ?? '') || !userData) {
      return response.status(400).json({ error: 'Missing required data' });
    }

    const { name, age, gender, preference } = userData;
    const resultsJson = JSON.stringify(qSortResults ?? {});
    const status = completed ? 'completed' : 'in_progress';

    const result = await sql`
      INSERT INTO q_method_results
        (session_id, experiment_id, name, age, gender, preference, results, locale, status)
      VALUES
        (${sessionId}, ${experimentId}, ${name}, ${age}, ${gender}, ${preference}, ${resultsJson}, ${locale}, ${status})
      ON CONFLICT (session_id) DO UPDATE SET
        name = EXCLUDED.name,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        preference = EXCLUDED.preference,
        results = EXCLUDED.results,
        locale = EXCLUDED.locale,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      WHERE q_method_results.status <> 'completed'
        AND q_method_results.experiment_id = EXCLUDED.experiment_id
      RETURNING id;
    `;

    return response.status(200).json({ success: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
