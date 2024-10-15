import { MongoClient } from 'mongodb';
import NodeCache from 'node-cache';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const cache = new NodeCache();

const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      // Store the initial status in MongoDB
      await collection.insertOne({
        uniqueId,
        storyStatus: 'initiating',
        prompt
      });

      // Initiate the story generation process
      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify({
          prompt,
          params: {
            n: 1,
            max_context_length: 1024,
            max_length: 512,
          },
          webhook: `${process.env.VERCEL_URL}/api/webhook?type=text&id=${uniqueId}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Story generation started:', data);

      // Update MongoDB with the generation ID
      await collection.updateOne(
        { uniqueId },
        { $set: { storyStatus: 'pending', storyGenerationId: data.id } }
      );

      // Store the generation ID in the cache
      cache.set(`story:${uniqueId}`, { status: 'pending', generationId: data.id });

      // Respond to the client
      res.status(202).json({ uniqueId, message: 'Story generation initiated' });

    } catch (error) {
      console.error('Error initiating story generation:', error);
      // Update MongoDB with the error status
      await collection.updateOne(
        { uniqueId },
        { $set: { storyStatus: 'error', error: error.message } }
      );
      // Update cache with the error status
      cache.set(`story:${uniqueId}`, { status: 'error', error: error.message });
      res.status(500).json({ error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
