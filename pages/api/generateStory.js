// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { length, storyType, age, numPictures, webhookUrl } = req.body; // Ensure you have the necessary parameters

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Construct the prompt based on the input parameters
      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The story should have ${numPictures} key scenes that could be illustrated.`;

      // Step 1: Initiate the text generation request
      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, webhook: webhookUrl }) // Include the webhook URL in the request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data); // Log the raw response for debugging
      res.status(200).json({ taskId: data.id }); // Return the task ID
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
