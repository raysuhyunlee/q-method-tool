import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await sql`
      SELECT id, name, age, gender, kpop_preference, results, locale, created_at
      FROM q_method_results
      ORDER BY created_at DESC;
    `;

    return response.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
