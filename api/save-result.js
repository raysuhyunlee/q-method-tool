
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userData, qSortResults, locale } = request.body;

    if (!userData || !qSortResults) {
      return response.status(400).json({ error: 'Missing required data' });
    }

    const { name, age, gender, kpopPreference } = userData;
    const resultsJson = JSON.stringify(qSortResults);

    // Ensure the table exists (idempotent, but good for first run reliability)
    // Note: In production, it's better to run migrations, but for this scale
    // having it here ensures it works out of the box.
    await sql`
      CREATE TABLE IF NOT EXISTS q_method_results (
        id SERIAL PRIMARY KEY,
        name TEXT,
        age TEXT,
        gender TEXT,
        kpop_preference TEXT,
        results JSONB,
        locale TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const result = await sql`
      INSERT INTO q_method_results (name, age, gender, kpop_preference, results, locale)
      VALUES (${name}, ${age}, ${gender}, ${kpopPreference}, ${resultsJson}, ${locale})
      RETURNING id;
    `;

    return response.status(200).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
