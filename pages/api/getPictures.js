// pages/api/getPictures.js
import NodeCache from 'node-cache';

const cache = new NodeCache();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    console.log(`Fetching images for ID: ${id}`);
    try {
      const imageData = cache.get(`images:${id}`);
      console.log('Image data:', imageData);
      res.status(200).json(imageData || { status: 'pending' });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
