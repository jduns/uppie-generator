import NodeCache from 'node-cache';

const cache = new NodeCache();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, id } = req.query;
    const data = req.body;
    console.log(`Received webhook for ${type}, ID: ${id}`);
    console.log('Webhook data:', data);

    try {
      if (type === 'text') {
  cache.set(`story:${id}`, data.text);
  cache.set(`generation:${id}`, 'complete');
} else if (type === 'image') {
  const currentImages = cache.get(`images:${id}`) || [];
  currentImages.push(data.img);
  cache.set(`images:${id}`, currentImages);
  if (currentImages.length === expectedNumberOfImages) {
    cache.set(`generation:${id}`, 'complete');
  }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
