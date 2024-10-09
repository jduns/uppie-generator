// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length } = req.body;

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      // Replace this with your actual API call
      const response = await fetch('https://stablehorde.net/api/v2/generate/text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': apiKey 
        },
        body: JSON.stringify({ age, storyType, length })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure that the API response contains a taskId
      if (!data.taskId) {
        throw new Error('No taskId returned from the story generation API');
      }

      res.status(200).json({ taskId: data.taskId }); // Return the taskId
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
