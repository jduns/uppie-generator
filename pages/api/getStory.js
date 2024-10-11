// pages/api/getStory.js
import NodeCache from 'node-cache';

const cache = new NodeCache();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    try {
      const story = cache.get(`story:${id}`);
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
