// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;

    // Construct the request payload
    const requestBody = {
      age,
      storyType,
      length,
      numPictures,
    };

    try {
      // Use your AI Horde API key here
      const apiKey = process.env.AI_HORDE_API_KEY; // Ensure you've set this up in your environment variables

      // Initiate the request to generate the story
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

      // If successful, return the job ID
      res.status(200).json({ jobId: data.jobId });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
