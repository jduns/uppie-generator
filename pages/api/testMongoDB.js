// pages/api/testMongoDB.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      console.log("Connected to MongoDB");

      // Simple query to check if connection and collection access work
      const database = client.db('storybook');
      const collection = database.collection('generations');
      const testDoc = await collection.findOne({});  // Attempt to read a document

      // If successful, return a message and optionally the test document
      res.status(200).json({
        message: "MongoDB connection successful",
        testDoc: testDoc || "No documents found in collection"
      });
    } catch (error) {
      console.error("MongoDB error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
