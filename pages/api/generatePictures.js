// pages/api/generatePictures.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { storyType, age, mainCharacter, numPictures } = req.body;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);

      const prompt = `Create ${numPictures} illustrations for a ${storyType} story featuring ${mainCharacter}, for a ${age}-year-old child.`;

      const response = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify({
          prompt,
          params: { n: numPictures, width: 512, height: 512 }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      await collection.insertOne({
        uniqueId,
        imageStatus: 'pending',
        imageGenerationId: data.id,
        numPictures
      });

      res.status(200).json({ uniqueId });
    } catch (error) {
      console.error('Error generating images:', error);
      res.status(500).json({ error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
