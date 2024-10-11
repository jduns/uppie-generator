import { AIHorde } from '@zeldafan0225/ai_horde';
import NodeCache from 'node-cache';

const cache = new NodeCache();
const horde = new AIHorde({ apiKey: process.env.AI_HORDE_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Start the generation process
      const generation = await horde.postTextGeneration({
        prompt,
        params: {
          n: 1,
          max_context_length: 1024,
          max_length: 512,
        },
      });

      console.log('Story generation started:', generation);
      
      // Store the generation ID in cache
      cache.set(`story:${uniqueId}`, { status: 'pending', generationId: generation.id });

      // Start a background process to check the status
      checkStoryStatus(generation.id, uniqueId);

      res.status(200).json({ uniqueId });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function checkStoryStatus(generationId, uniqueId) {
  try {
    const status = await horde.getTextGenerationStatus(generationId);
    console.log('Story generation status:', status);

    if (status.done) {
      const story = status.generations[0].text;
      cache.set(`story:${uniqueId}`, { status: 'complete', story });
    } else {
      // Check again after 5 seconds
      setTimeout(() => checkStoryStatus(generationId, uniqueId), 5000);
    }
  } catch (error) {
    console.error('Error checking story status:', error);
    cache.set(`story:${uniqueId}`, { status: 'error', error: error.message });
  }
}
