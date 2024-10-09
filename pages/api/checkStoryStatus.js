// pages/api/checkStoryStatus.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { taskId } = req.body; // Get taskId from request body

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Step 1: Check the status of the request
      const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status`, {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }), // Send the task ID
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.text();
        console.error(`Error checking story status: ${statusResponse.status}, ${errorData}`);
        return res.status(statusResponse.status).json({ error: errorData });
      }

      const statusData = await statusResponse.json();
      res.status(200).json(statusData); // Return the status data
    } catch (error) {
      console.error('Error checking story status:', error);
      res.status(500).json({ error: error.message || 'Error checking story status. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
