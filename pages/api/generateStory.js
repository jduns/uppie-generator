// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Construct the prompt based on the input parameters
      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The story should have ${numPictures} key scenes that could be illustrated.`;

      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        body: JSON.stringify({
          prompt: prompt,
          params: {
            n: 1,
            max_context_length: 2048,
            max_length: 512,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repetition_penalty: 1.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const taskId = data.id;

      // Poll for completion
      let generatedStory = null;
      let workerName = null;
      let modelName = null;

      while (!generatedStory) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${taskId}`, {
          headers: {
            'apikey': apiKey,
          },
        });
        const statusData = await statusResponse.json();

        if (statusData.done) {
          generatedStory = statusData.generations[0].text;
          workerName = statusData.worker_name;
          modelName = statusData.model;
        }
      }

      res.status(200).json({
        story: generatedStory,
        worker: workerName,
        model: modelName,
      });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
