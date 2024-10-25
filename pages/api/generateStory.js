import { MongoClient } from 'mongodb';
import { generateUniqueId } from '/utils';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { length, storyType, age, numPictures, mainCharacter } = req.body;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const uniqueId = generateUniqueId();
      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The main character's name is ${mainCharacter}. The story should have ${numPictures} key scenes that could be illustrated.`;

      await collection.insertOne({ uniqueId, storyStatus: 'initiating', prompt });

      let response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          params: {
            max_length: length === 'short' ? 500 : length === 'medium' ? 1000 : 1500,
            max_context_length: 2048,
            temperature: 0.7,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const storyGenerationId = data.id;

      await collection.updateOne({ uniqueId }, { $set: { storyStatus: 'pending', storyGenerationId } });

      // Poll for status
      let statusResponse;
      let statusData;
      let retries = 10; // Number of retries
      const delay = 5000; // Delay between retries in milliseconds

      while (retries > 0) {
        statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${storyGenerationId}`, {
          headers: { 'apikey': API_KEY }
        });

        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }

        statusData = await statusResponse.json();

        if (statusData.done) {
          const story = statusData.generations[0].text;
          await collection.updateOne({ uniqueId }, { $set: { storyStatus: 'complete', story } });
          return res.status(200).json({ uniqueId, status: 'complete', story });
        }

        retries--;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      throw new Error('Story generation timed out');

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
