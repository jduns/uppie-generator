import { MongoClient } from 'mongodb';
import { generateUniqueId } from '../utils';

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

      const uniqueId = generateUniqueId();
      const prompt = `Create ${numPictures} illustrations for a ${storyType} story featuring ${mainCharacter}, for a ${age}-year-old child.`;

      let retries = 3;
      let response;
      while (retries > 0) {
        try {
          response = await fetch('https://stablehorde.net/api/v2/generate/async', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': API_KEY
            },
            body: JSON.stringify({
              prompt,
              params: { n: numPictures, width: 512, height: 512 },
              webhook: `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/webhook?type=image&id=${uniqueId}`
            })
          });
          
          if (response.ok) break;
        } catch (error) {
          console.error(`Attempt ${4 - retries} failed:`, error);
        }
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to generate images after multiple attempts`);
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
