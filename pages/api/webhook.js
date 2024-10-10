import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, id } = req.query;
    const data = req.body;

    console.log(`Received webhook for ${type}, ID: ${id}`);
    console.log('Webhook data:', data);

    try {
      if (type === 'text') {
        await kv.set(`story:${id}`, data.text);
      } else if (type === 'image') {
        const currentImages = await kv.get(`images:${id}`) || [];
        currentImages.push(data.img);
        await kv.set(`images:${id}`, currentImages);
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
