// pages/api/generatePictures.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body;

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      const response = await fetch('https://your.image.api/generate', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, numPictures }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json({ images: data.images });
    } catch (error) {
      console.error('Error generating pictures:', error);
      res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
