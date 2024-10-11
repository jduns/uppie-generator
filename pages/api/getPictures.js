// pages/api/getPictures.js
import NodeCache from 'node-cache';

const cache = new NodeCache();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    try {
      const images = cache.get(`images:${id}`) || [];
      res.status(200).json({ images });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
