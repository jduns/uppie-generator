import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      await client.connect();
      const database = client.db('storybook');
      const collection = database.collection('generations');

      const data = await collection.findOne({ uniqueId: id });

      if (!data) {
        return res.status(404).json({ error: 'Generation not found' });
      }

      res.status(200).json({
        storyComplete: data.storyStatus === 'complete',
        imagesComplete: data.imageStatus === 'complete',
        story: data.story,
        images: data.images
      });
    } catch (error) {
      console.error('Error checking status:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
