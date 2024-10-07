// pages/api/generateStory.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;

    // Construct the request to AI Horde
    const requestBody = {
      // Adjust the request body as needed for AI Horde
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
          'Authorization': `Bearer YOUR_API_KEY_HERE`, // Replace with your actual API key
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message });
      }

      // Return the job ID or any other relevant information
      res.status(200).json({ jobId: data.jobId });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
