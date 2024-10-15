// pages/api/webhook.js
import NodeCache from 'node-cache';
import { MongoClient } from 'mongodb';

const cache = new NodeCache();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, id } = req.query;
    const data = req.body;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      if (type === 'text') {
        const story = data.generations[0].text;
        cache.set(`story:${id}`, { status: 'complete', story });
        await collection.updateOne(
          { uniqueId: id },
          { $set: { storyStatus: 'complete', story } }
        );
      } else if (type === 'image') {
        const currentImages = cache.get(`images:${id}`) || [];
        currentImages.push(data.generations[0].img);
        cache.set(`images:${id}`, currentImages);
        await collection.updateOne(
          { uniqueId: id },
          { $set: { imageStatus: 'complete', images: currentImages } }
        );
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
