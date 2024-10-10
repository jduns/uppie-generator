// pages/api/generatePictures.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body;
    
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          params: {
            n: numPictures,
            width: 512,
            height: 512,
          },
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(`Error initiating image generation: ${generateResponse.status} - ${JSON.stringify(errorData)}`);
      }

      const generateData = await generateResponse.json();
      console.log('Image generation response:', generateData);

      if (!generateData.id) {
        throw new Error('Task ID is undefined in the response.');
      }

      res.status(200).json({ taskId: generateData.id });
    } catch (error) {
      console.error('Error generating pictures:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
