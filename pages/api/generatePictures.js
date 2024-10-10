export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body;
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      console.log(`Initiating image generation for prompt: "${prompt}", numPictures: ${numPictures}`);

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

      const responseText = await generateResponse.text();
      console.log('Raw API response:', responseText);

      if (!generateResponse.ok) {
        throw new Error(`Error initiating image generation: ${generateResponse.status} - ${responseText}`);
      }

      const generateData = JSON.parse(responseText);
      console.log('Parsed image generation response:', generateData);

      if (!generateData.id) {
        throw new Error('Task ID is undefined in the response.');
      }

      res.status(200).json({ taskId: generateData.id });
    } catch (error) {
      console.error('Error in generatePictures:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
