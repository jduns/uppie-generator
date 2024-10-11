import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Store the initial status in MongoDB
      await collection.insertOne({
        uniqueId,
        storyStatus: 'initiating',
        imageStatus: 'pending'
      });

      // Respond to the client immediately
      res.status(202).json({ uniqueId, message: 'Story generation initiated' });

      // Start the generation process in the background
      generateStoryBackground(prompt, uniqueId, collection);
    } catch (error) {
      console.error('Error initiating story generation:', error);
      res.status(500).json({ error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

async function generateStoryBackground(prompt, uniqueId, collection) {
  try {
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

    // Start checking the status
    checkStoryStatus(data.id, uniqueId, collection);
  } catch (error) {
    console.error('Error in background story generation:', error);
    await collection.updateOne(
      { uniqueId },
      { $set: { storyStatus: 'error', error: error.message } }
    );
  }
}

async function checkStoryStatus(generationId, uniqueId) {
  try {
    await client.connect();
    const database = client.db('storybook');
    const collection = database.collection('generations');

    const response = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${generationId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const status = await response.json();
    console.log('Story generation status:', status);

    if (status.done) {
      const story = status.generations[0].text;
      await collection.updateOne(
        { uniqueId },
        { $set: { storyStatus: 'complete', story } }
      );
    } else {
      // Check again after 5 seconds
      setTimeout(() => checkStoryStatus(generationId, uniqueId), 5000);
    }
  } catch (error) {
    console.error('Error checking story status:', error);
    await collection.updateOne(
      { uniqueId },
      { $set: { storyStatus: 'error', error: error.message } }
    );
  } finally {
    await client.close();
  }
}
