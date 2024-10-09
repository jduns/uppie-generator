export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { prompt, numPictures, webhookUrl } = req.body;

        if (!prompt || prompt.length < 5) {
            return res.status(400).json({ error: 'Prompt is too short. It must be at least 5 characters long.' });
        }

        try {
            const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

            const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/async', {
                method: 'POST',
                headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, num_images: numPictures, webhook: webhookUrl }),
            });

            const generateData = await generateResponse.json();
            console.log('Full API Response:', generateData);

            if (!generateResponse.ok) {
                console.error(`Error initiating image generation: ${generateResponse.status}`, generateData);
                return res.status(generateResponse.status).json({ error: generateData.error || 'Unknown error occurred' });
            }

            if (!generateData.task_id) {  // Changed from 'request' to 'task_id'
                console.error('Task ID is undefined in response:', generateData);
                return res.status(400).json({ error: 'Task ID is undefined.' });
            }

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
