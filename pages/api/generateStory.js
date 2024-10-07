// pages/api/generateStory.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;

    // Construct the request to AI Horde
    const requestBody = {
      age,
      storyType,
      length,
      numPictures,
    };

    try {
      // Initiate the request to generate the story
      const apiKey = process.env.AI_HORDE_API_KEY;
      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data); // Log detailed error information from API response
        return res.status(response.status).json({ error: data.message || 'An error occurred' });
      }

      // Return the job ID or any other relevant information
      res.status(200).json({ jobId: data.jobId });
    } catch (error) {
      console.error('Error generating story:', error); // Log the actual error object
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
