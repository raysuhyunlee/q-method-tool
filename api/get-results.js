import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { experiment } = request.query;
  if (!experiment) {
    return response.status(400).json({ error: 'Missing experiment' });
  }

  try {
    const result = await sql`
      SELECT id, name, age, gender, preference, results, locale, status, created_at, updated_at
      FROM q_method_results
      WHERE experiment_id = ${experiment}
      ORDER BY created_at DESC;
    `;

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
