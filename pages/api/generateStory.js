// pages/api/generateStory.js

import { aiHorde } from '@zeldafan0225/ai_horde'; // Import the SDK here

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { age, storyType, length, numPictures } = req.body;

    const requestBody = {
      age,
      storyType,
      length,
      numPictures,
    };

    try {
      const apiKey = process.env.AI_HORDE_API_KEY;

      if (!apiKey || apiKey === '0000000000') {
        console.error('Invalid API key. Please check your environment variables.');
        return res.status(400).json({ error: 'Invalid API key.' });
      }

      // Use the SDK to generate the story
      const response = await aiHorde.generateStory(requestBody, apiKey); // Adjust as per SDK's method

      if (!response.ok) {
        throw new Error(response.error);
      }

      res.status(200).json({ story: response.story }); // Adjust the response structure as needed
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
