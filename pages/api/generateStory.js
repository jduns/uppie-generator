import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology:   
 true });
const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { length, storyType, age, numPictures, mainCharacter, webhookUrl } = req.body;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      // Cache the prompt for potential reuse
      const cachedData = await cache.get(prompt);
      if (cachedData) {
        // If data is cached, return it immediately
        return res.status(200).json({ uniqueId: cachedData.uniqueId });
      }

      const uniqueId = generateUniqueId();

      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The main character's name is ${mainCharacter}. The story should have ${numPictures} key scenes that could be illustrated.`;

      await collection.insertOne({ uniqueId, storyStatus: 'initiating', prompt });

      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, webhook: webhookUrl })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      await collection.updateOne({ uniqueId }, { $set: { storyStatus: 'pending', storyGenerationId: data.id } });

      // Cache the generated story and unique ID for future use
      await cache.set(prompt, { story: story, uniqueId });

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
