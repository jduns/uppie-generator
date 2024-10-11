import NodeCache from 'node-cache';

const cache = new NodeCache();
const API_KEY = process.env.AI_HORDE_API_KEY || '0000000000';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Start the generation process
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
      
      // Store the generation ID in cache
      cache.set(`story:${uniqueId}`, { status: 'pending', generationId: data.id });

      // Start a background process to check the status
      checkStoryStatus(data.id, uniqueId);

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
    const response = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${generationId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const status = await response.json();
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
