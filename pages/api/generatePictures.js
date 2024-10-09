// pages/api/generatePictures.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json(data); // Return the generated pictures or relevant data
    } catch (error) {
      console.error('Error generating pictures:', error);
      res.status(500).json({ error: error.message || 'Error generating pictures.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
