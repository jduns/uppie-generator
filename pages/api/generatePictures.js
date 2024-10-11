// pages/api/generatePictures.js
import { AIHorde } from '@zeldafan0225/ai_horde';
import NodeCache from 'node-cache';

const cache = new NodeCache();
const horde = new AIHorde({ apiKey: process.env.AI_HORDE_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body;
    try {
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Start the generation process
      const generation = await horde.postImageGenerationAsync({
        prompt,
        params: {
          n: numPictures,
          width: 512,
          height: 512,
        },
      });

      console.log('Image generation started:', generation);
      
      // Store the generation ID in cache
      cache.set(`images:${uniqueId}`, { status: 'pending', generationId: generation.id });

      // Start a background process to check the status
      checkImageStatus(generation.id, uniqueId);

      res.status(200).json({ uniqueId });
    } catch (error) {
      console.error('Error generating images:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function checkImageStatus(generationId, uniqueId) {
  try {
    const status = await horde.getImageGenerationStatus(generationId);
    console.log('Image generation status:', status);

    if (status.done) {
      const images = status.generations.map(gen => gen.img);
      cache.set(`images:${uniqueId}`, { status: 'complete', images });
    } else {
      // Check again after 5 seconds
      setTimeout(() => checkImageStatus(generationId, uniqueId), 5000);
    }
  } catch (error) {
    console.error('Error checking image status:', error);
    cache.set(`images:${uniqueId}`, { status: 'error', error: error.message });
  }
}
