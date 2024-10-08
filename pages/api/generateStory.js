import { AIHorde } from "@zeldafan0225/ai_horde";

const aiHorde = new AIHorde();

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

      if (!apiKey) {
        return res.status(400).json({ error: 'Invalid API key.' });
      }

      const generationResponse = await aiHorde.postAsyncTextGenerate({
        prompt: `Generate a ${storyType} story for age ${age} with ${length} words and ${numPictures} pictures.`
      });

      if (!generationResponse.ok) {
        return res.status(generationResponse.status).json({ error: generationResponse.error });
      }

      res.status(200).json({ jobId: generationResponse.data.jobId });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while generating the story.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
