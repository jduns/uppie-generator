import { MongoClient } from 'mongodb';
import { generateUniqueId } from '/utils';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { length, storyType, age, numPictures, mainCharacter } = req.body;
    const webhookUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/webhook?type=text`;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const uniqueId = generateUniqueId();
      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The main character's name is ${mainCharacter}. The story should have ${numPictures} key scenes that could be illustrated.`;

      await collection.insertOne({ uniqueId, storyStatus: 'initiating', prompt });

      let retries = 3;
      let response;
      while (retries > 0) {
        try {
          response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
            method: 'POST',
            headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt, 
              params: {
                max_length: length === 'short' ? 500 : length === 'medium' ? 1000 : 1500,
                max_context_length: 2048,
                temperature: 0.7,
              },
              webhook: `${webhookUrl}&id=${uniqueId}`
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
        throw new Error(`Failed to generate story after multiple attempts`);
      }

      const data = await response.json();

      await collection.updateOne({ uniqueId }, { $set: { storyStatus: 'pending', storyGenerationId: data.id } });

      res.status(200).json({ uniqueId });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
