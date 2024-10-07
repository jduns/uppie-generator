// pages/api/generateStory.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;
    const apiKey = process.env.AI_HORDE_API_KEY; // Ensure this is set in your .env.local

    // Construct the request to AI Horde
    const requestBody = {
      age,
      storyType,
      length,
      numPictures,
    };

    try {
      // Initiate the request to generate the story
      const response = await fetch('https://api.aihorde.net/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, // Use the API key from environment variables
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || 'Failed to generate story' });
      }

      const jobId = data.jobId; // Get the job ID for the generated story

      // Now check the status of the request
      const storyResponse = await checkJobStatus(jobId, apiKey);
      res.status(200).json({ story: storyResponse.story }); // Return the generated story
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Function to check the status of the job
const checkJobStatus = async (jobId, api
