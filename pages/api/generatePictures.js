// pages/api/generatePictures.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { prompt, numPictures, webhookUrl } = req.body; // Added webhookUrl parameter

        try {
            const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

            // Step 1: Initiate the image generation request
            const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/async', {
                method: 'POST',
                headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, num_images: numPictures, webhook: webhookUrl }), // Include webhook URL
            });

            const generateData = await generateResponse.json(); // Capture the full response
            console.log('Image Generation Response:', generateData); // Log the response data

            if (!generateResponse.ok) {
                console.error(`Error initiating image generation: ${generateResponse.status}, ${generateData.error}`);
                return res.status(generateResponse.status).json({ error: generateData.error });
            }

            // Respond with the task ID
            res.status(200).json({ taskId: generateData.task_id });
            
        } catch (error) {
            console.error('Error generating pictures:', error);
            res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
