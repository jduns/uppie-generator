// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;
    
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      // Construct the prompt based on the input parameters
      const prompt = Write a ${length} ${storyType} story for a ${age}-year-old child. The story should have ${numPictures} key scenes that could be illustrated.;

      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
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
            repetition_penalty: 1.2
          }
        })
      });

      if (!response.ok) {
        throw new Error(HTTP error! status: ${response.status});
      }

      const data = await response.json();
      
      // Return the task ID immediately
      res.status(202).json({ taskId: data.id });
    } catch (error) {
      console.error('Error initiating story generation:', error);
      res.status(500).json({ error: error.message || 'Error initiating story generation. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(Method ${req.method} Not Allowed);
  }
}
