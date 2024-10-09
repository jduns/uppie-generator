// pages/api/checkPictureStatus.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { taskId } = req.body; // The task ID to check

        try {
            const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

            // Step 1: Check the status of the picture generation request
            const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/check`, {
                method: 'POST',
                headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId }), // Send the task ID
            });

            // Log the status response for debugging
            const statusData = await statusResponse.json();
            console.log('Status Response:', statusData); // Log status response for clarity

            if (!statusResponse.ok) {
                console.error(`Error checking picture status: ${statusResponse.status}, ${statusData.error}`);
                return res.status(statusResponse.status).json({ error: statusData.error });
            }

            // Return the status data, including images if available
            res.status(200).json(statusData);
        } catch (error) {
            console.error('Error checking picture status:', error);
            res.status(500).json({ error: error.message || 'Error checking picture status. Please try again later.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
