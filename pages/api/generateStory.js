// pages/api/generateStory.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Assuming you don't need to send those parameters to the API
    // Remove the parameters from requestBody
    const requestBody = {
      // Add only necessary parameters based on AI Horde documentation
    };

    console.log("Request Body:", JSON.stringify(requestBody, null, 2)); // Log the request body for verification

    try {
      const apiKey = process.env.AI_HORDE_API_KEY; // Ensure you've set this up in your environment variables
      
      // Check if API key is missing
      if (!apiKey) {
        console.error('API key is missing. Please check your environment variables.');
        return res.status(500).json({ error: 'API key is missing.' });
      }

      // Initiate the request to generate the story
      const response = await fetch('https://stablehorde.net/api/v2/generate/text/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody), // Send the modified requestBody
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetails = await response.text(); // Get the error details
        console.error('API error:', errorDetails); // Log detailed error information
        return res.status(response.status).json({ error: errorDetails || 'An error occurred' });
      }

      // If successful, return the job ID
      res.status(200).json({ jobId: data.jobId });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
