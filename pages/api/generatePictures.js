// pages/api/generatePictures.js

// Inline function to generate a unique ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body;
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      const webhookUrl = `${process.env.VERCEL_URL || 'https://uppie-generator.vercel.app/'}/api/webhook`;
      const uniqueId = generateUniqueId();

      const response = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          params: {
            n: numPictures,
            width: 512,
            height: 512,
          },
          webhook: `${webhookUrl}?type=image&id=${uniqueId}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Image generation initiated:', data);

      res.status(200).json({ taskId: data.id, uniqueId });
    } catch (error) {
      console.error('Error generating pictures:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
