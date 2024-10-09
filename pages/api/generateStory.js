// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { length, storyType, age, numPictures } = req.body; // Ensure you have the necessary parameters

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Construct the prompt based on the input parameters
      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The story should have ${numPictures} key scenes that could be illustrated.`;

      // Step 1: Initiate the story generation request
      const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, webhook: 'https://yourdomain.com/api/webhook' }), // Add your webhook URL here
      });

      if (!generateResponse.ok) {
        throw new Error(`HTTP error! status: ${generateResponse.status}`);
      }

      const { id: taskId } = await generateResponse.json(); // Get the task ID from the response
      res.status(200).json({ taskId }); // Return the task ID to the client for tracking if needed

    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
