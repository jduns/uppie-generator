// pages/api/generateStory.js

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      const webhookUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/webhook`;
      const uniqueId = generateUniqueId();

      const requestBody = {
        prompt,
        params: {
          max_length: 512,
          max_context_length: 1024,
        },
        webhook: `${webhookUrl}?type=text&id=${uniqueId}`,
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Story generation initiated:', data);

      res.status(200).json({ taskId: data.id, uniqueId });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
