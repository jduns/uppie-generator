// pages/api/generatePictures.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { storyType, numPictures } = req.body;

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Construct the prompt based on the story type and number of pictures
      const prompt = `Create ${numPictures} illustrations for a ${storyType} story. The illustrations should depict key scenes that could be illustrated from the story.`;

      const response = await fetch('https://stablehorde.net/api/v2/generate/image/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          prompt: prompt,
          params: {
            n: numPictures, // number of images to generate
            size: '512x512', // specify image size if needed
            // Add any other relevant parameters for your image generation
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Return the task ID immediately
      res.status(202).json({ taskId: data.id });
    } catch (error) {
      console.error('Error initiating picture generation:', error);
      res.status(500).json({ error: error.message || 'Error initiating picture generation. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.sta
