// pages/api/webhook.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, id } = req.query;
    const data = req.body;
    console.log(`Received webhook for ${type}, ID: ${id}`);
    console.log('Webhook data:', data);

    try {
      if (typeof window !== 'undefined') {
        if (type === 'text') {
          localStorage.setItem(`story:${id}`, data.text);
        } else if (type === 'image') {
          const currentImages = JSON.parse(localStorage.getItem(`images:${id}`)) || [];
          currentImages.push(data.img);
          localStorage.setItem(`images:${id}`, JSON.stringify(currentImages));
        }
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
