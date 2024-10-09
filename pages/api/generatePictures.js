// pages/api/generatePictures.js

export default async function handler(req, res) {
  try {
    const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
    const { prompt, numPictures, webhookUrl } = req.body; // Added webhookUrl parameter

    // Step 1: Initiate the image generation request
    const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, num_images: numPictures, webhook: webhookUrl }), // Include webhook URL
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.text();
      console.error(`Error initiating image generation: ${generateResponse.status}, ${errorData}`);
      return res.status(generateResponse.status).json({ error: errorData });
    }

    const { task_id } = await generateResponse.json();

    // Respond with the task ID
    res.status(200).json({ taskId: task_id });

  } catch (error) {
    console.error('Error generating pictures:', error);
    res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
  }
}
