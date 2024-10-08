// pages/api/checkStoryStatus.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { taskId } = req.query;
    
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${taskId}`, {
        headers: { 'apikey': apiKey }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`HTTP error! status: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      
      if (statusData.done) {
        res.status(200).json({ done: true, story: statusData.generations[0].text });
      } else {
        res.status(202).json({ done: false });
      }
    } catch (error) {
      console.error('Error checking story status:', error);
      res.status(500).json({ error: error.message || 'Error checking story status. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
