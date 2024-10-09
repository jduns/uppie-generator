// pages/api/generatePictures.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, numPictures } = req.body; // Get prompt and number of pictures from the request body

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Construct the request body according to the API's requirements
      const requestBody = {
        prompt: prompt,
        n: numPictures, // Make sure this aligns with the API's expected parameter
        // You may need to include other parameters based on the API documentation
      };

      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorDetails = await response.json(); // Capture error details
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(errorDetails)}`);
      }

      const data = await response.json();
      res.status(200).json(data); // Respond with the API data
    } catch (error) {
      console.error('Error generating pictures:', error);
      res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
