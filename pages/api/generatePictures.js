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

            if (!generateData.task_id) {
                console.error('Task ID is undefined in response:', generateData);
                return res.status(400).json({ error: 'Task ID is undefined.' });
            }

            const taskId = generateData.task_id;
            // Call the status check function here
            const statusData = await checkImageGenerationStatus(taskId);
            res.status(200).json({ taskId, status: statusData });
            
        } catch (error) {
            console.error('Error generating pictures:', error);
            res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Function to check the status of the image generation
async function checkImageGenerationStatus(taskId) {
    const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

    const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/check/${taskId}`, {
        method: 'GET',
        headers: { 'apikey': apiKey },
    });

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
        console.error(`Error checking generation status: ${statusResponse.status}`, statusData);
        throw new Error(statusData.error || 'Unknown error occurred while checking status');
    }

    return statusData;
}
