// pages/api/generatePictures.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body; // Ensure you have the necessary parameters

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Make sure to construct the request body correctly
      const body = {
        prompt,
        num_images: numPictures, // Adjust as per the API requirements
      };

      const response = await fetch('https://stablehorde.net/api/v2/generate/image/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body) // Send the body as JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json(data); // Return the image generation data
    } catch (error) {
      console.error('Error generating pictures:', error);
      res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
