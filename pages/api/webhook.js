// pages/api/webhook.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { task_id, text } = req.body; // Adjust this based on the actual payload from AI Horde

    console.log(`Received webhook for task ID ${task_id}:`, text);

    // Here, you could store the generated story in your database or send a response back to the client

    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
