// pages/api/getStory.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    try {
      if (typeof window !== 'undefined') {
        const story = localStorage.getItem(`story:${id}`);
        res.status(200).json({ story });
      } else {
        res.status(200).json({ story: null });
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
