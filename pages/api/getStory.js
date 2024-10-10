import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      const story = await kv.get(`story:${id}`);
      res.status(200).json({ story });
    } catch (error) {
      console.error('Error fetching story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
