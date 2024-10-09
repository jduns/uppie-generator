// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { length, storyType, age, numPictures } = req.body; // Ensure you have the necessary parameters

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      // Construct the prompt based on the input parameters
      const prompt = `Write a ${length} ${storyType} story for a ${age}-year-old child. The story should have ${numPictures} key scenes that could be illustrated.`;

      // Step 1: Initiate the story generation request
      const generateResponse = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }), // Send the prompt as the body of the request
      });

      if (!generateResponse.ok) {
        throw new Error(`HTTP error! status: ${generateResponse.status}`);
      }

      const { id: taskId } = await generateResponse.json(); // Get the task ID from the response

      // Step 2: Check the status of the request
      let statusResponse;
      let statusData;
      let isComplete = false;

      while (!isComplete) {
        // Wait for a short time before checking the status again
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second

        statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status`, {
          method: 'POST', // Use POST to check status
          headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_id: taskId }), // Send the task_id in the body
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.text();
          console.error(`Error checking story generation status: ${statusResponse.status}, ${errorData}`);
          return res.status(statusResponse.status).json({ error: errorData });
        }

        statusData = await statusResponse.json();
        isComplete = statusData.status === 'completed'; // Check if the task is complete
      }

      // Step 3: Retrieve the results
      const resultsResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status`, {
        method: 'POST', // Use POST to retrieve results
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }), // Send the task_id in the body
      });

      if (!resultsResponse.ok) {
        const errorData = await resultsResponse.text();
        console.error(`Error retrieving story results: ${resultsResponse.status}, ${errorData}`);
        return res.status(resultsResponse.status).json({ error: errorData });
      }

      const results = await resultsResponse.json();
      res.status(200).json({ story: results.text }); // Return the generated story text

    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
