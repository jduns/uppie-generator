// pages/api/checkStoryStatus.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { uniqueId } = req.query;
    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');
      const generation = await collection.findOne({ uniqueId });
      if (!generation) {
        return res.status(404).json({ error: 'Generation not found' });
      }
      if (generation.storyStatus === 'complete') {
        return res.status(200).json({ status: 'complete', story: generation.story });
      }
      if (generation.storyStatus === 'error') {
        return res.status(500).json({ status: 'error', error: generation.error });
      }
      const response = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${generation.storyGenerationId}`, {
        headers: { 'apikey': API_KEY }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.done) {
        const story = data.generations.text;
        await collection.updateOne({ uniqueId }, { $set: { storyStatus: 'complete', story } });
        return res.status(200).json({ status: 'complete', story });
      } else {
        return res.status(202).json({ status: 'pending' });
      }
    } catch (error) {
      console.error('Error checking story status:', error);
      res.status(500).json({ error: error.message || 'Error checking story status. Please try again later.' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
