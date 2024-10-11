import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { uniqueId } = req.query;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const generation = await collection.findOne({ uniqueId });

      if (!generation) {
        return res.status(404).json({ error: 'Generation not found' });
      }

      if (generation.storyStatus === 'complete') {
        return res.status(200).json({ status: 'complete', story: generation.story });
      }

      if (generation.storyStatus === 'error') {
        return res.status(500).json({ status: 'error', error: generation.error });
      }

      // If still pending, check the status from AI Horde
      const response = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${generation.storyGenerationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const status = await response.json();

      if (status.done) {
        const story = status.generations[0].text;
        await collection.updateOne(
          { uniqueId },
          { $set: { storyStatus: 'complete', story } }
        );
        return res.status(200).json({ status: 'complete', story });
      } else {
        return res.status(202).json({ status: 'pending' });
      }

    } catch (error) {
      console.error('Error checking story status:', error);
      res.status(500).json({ error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
