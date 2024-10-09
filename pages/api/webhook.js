// pages/api/webhook.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, ...data } = req.body; // Capture the incoming data and determine the type

    // Check the type of generation and process accordingly
    if (type === 'image') {
      const { img, seed, worker_id, worker_name, model, id, gen_metadata, request, kudos } = data;

      console.log(`Received image webhook for job ID ${id}:`, {
        img,
        seed,
        worker_id,
        worker_name,
        model,
        gen_metadata,
        request,
        kudos,
      });

      // Here, you can store the image data in your database or send it to the frontend
      // For example, you might want to send a notification to the user about the generated image

    } else if (type === 'text') {
      const { text, seed, worker_id, worker_name, model, id, gen_metadata, request, kudos } = data;

      console.log(`Received text webhook for job ID ${id}:`, {
        text,
        seed,
        worker_id,
        worker_name,
        model,
        gen_metadata,
        request,
        kudos,
      });

      // Process the text data here

    } else if (type === 'alchemy') {
      const { form, state, result, worker_id, worker_name, id, request, kudos } = data;

      console.log(`Received alchemy webhook for job ID ${id}:`, {
        form,
        state,
        result,
        worker_id,
        worker_name,
        kudos,
      });

      // Process the alchemy data here

    } else {
      console.error('Unknown generation type:', type);
      return res.status(400).json({ error: 'Unknown generation type' });
    }

    // Send a response back to acknowledge receipt of the webhook
    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
