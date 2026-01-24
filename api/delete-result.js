import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { id } = request.query;

    if (!id) {
      return response.status(400).json({ error: 'Missing record ID' });
    }

    const result = await sql`
      DELETE FROM q_method_results
      WHERE id = ${id}
      RETURNING id;
    `;

    if (result.rowCount === 0) {
      return response.status(404).json({ error: 'Record not found' });
    }

    return response.status(200).json({ success: true, deletedId: result.rows[0].id });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
