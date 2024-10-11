import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body;
    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Start the generation process
      const response = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify({
          prompt,
          params: {
            n: numPictures,
            width: 512,
            height: 512,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Image generation started:', data);

      // Store the generation ID in MongoDB
      await collection.insertOne({
        uniqueId,
        imageStatus: 'pending',
        imageGenerationId: data.id,
        numPictures
      });

      // Start a background process to check the status
      checkImageStatus(data.id, uniqueId);

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

async function checkImageStatus(generationId, uniqueId) {
  try {
    await client.connect();
    const database = client.db('storybook');
    const collection = database.collection('generations');

    const response = await fetch(`https://stablehorde.net/api/v2/generate/status/${generationId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const status = await response.json();
    console.log('Image generation status:', status);

    if (status.done) {
      const images = status.generations.map(gen => gen.img);
      await collection.updateOne(
        { uniqueId },
        { $set: { imageStatus: 'complete', images } }
      );
    } else {
      // Check again after 5 seconds
      setTimeout(() => checkImageStatus(generationId, uniqueId), 5000);
    }
  } catch (error) {
    console.error('Error checking image status:', error);
    await collection.updateOne(
      { uniqueId },
      { $set: { imageStatus: 'error', error: error.message } }
    );
  } finally {
    await client.close();
  }
}
