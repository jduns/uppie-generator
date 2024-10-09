// pages/api/generatePictures.js

export default async function handler(req, res) {
  try {
    const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
    const { prompt, numPictures } = req.body;

    // Step 1: Initiate the image generation request
    const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, num_images: numPictures }),
    });

    if (!generateResponse.ok) {
      const errorData = await generateResponse.text();
      console.error(`Error initiating image generation: ${generateResponse.status}, ${errorData}`);
      return res.status(generateResponse.status).json({ error: errorData });
    }

    const { task_id } = await generateResponse.json();

    // Step 2: Check the status of the request
    let statusResponse;
    let statusData;
    let isComplete = false;

    while (!isComplete) {
      // Wait for a short time before checking the status again
      await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
      
      statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/check?task_id=${task_id}`, {
        method: 'GET',
        headers: { 'apikey': apiKey },
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.text();
        console.error(`Error checking image generation status: ${statusResponse.status}, ${errorData}`);
        return res.status(statusResponse.status).json({ error: errorData });
      }

      statusData = await statusResponse.json();
      isComplete = statusData.status === 'completed'; // Check if the task is complete
    }

    // Step 3: Retrieve the results
    const resultsResponse = await fetch(`https://stablehorde.net/api/v2/generate/status?task_id=${task_id}`, {
      method: 'GET',
      headers: { 'apikey': apiKey },
    });

    if (!resultsResponse.ok) {
      const errorData = await resultsResponse.text();
      console.error(`Error retrieving results: ${resultsResponse.status}, ${errorData}`);
      return res.status(resultsResponse.status).json({ error: errorData });
    }

    const results = await resultsResponse.json();
    res.status(200).json(results);
    
  } catch (error) {
    console.error('Error generating pictures:', error);
    res.status(500).json({ error: error.message || 'Error generating pictures. Please try again later.' });
  }
}
