import { MongoClient } from 'mongodb';
import NodeCache from 'node-cache';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const cache = new NodeCache();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { uniqueId } = req.query;

    try {
      // Check cache first
      const cachedStatus = cache.get(`story:${uniqueId}`);

      if (cachedStatus) {
        if (cachedStatus.status === 'complete') {
          return res.status(200).json({ status: 'complete', story: cachedStatus.story });
        } else if (cachedStatus.status === 'error') {
          return res.status(500).json({ status: 'error', error: cachedStatus.error });
        }
      }

      // If not in cache, check MongoDB
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const generation = await collection.findOne({ uniqueId });

      if (!generation) {
        return res.status(404).json({ error: 'Generation not found' });
      }

      if (generation.storyStatus === 'complete') {
        cache.set(`story:${uniqueId}`, { status: 'complete', story: generation.story });
        return res.status(200).json({ status: 'complete', story: generation.story });
      }

      if (generation.storyStatus === 'error') {
        cache.set(`story:${uniqueId}`, { status: 'error', error: generation.error });
        return res.status(500).json({ status: 'error', error: generation.error });
      }

      // If still pending, return pending status
      return res.status(202).json({ status: 'pending' });
    } catch (error) {
      console.error('Error checking story status:', error);
      res.status(500).json({ error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
