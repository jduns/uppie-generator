// File: /api/testMongo.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI; // Ensure this is set in your Vercel environment variables
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Test the connection by listing databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("Connected to MongoDB. Databases:", databasesList);

    // Respond with a success message
    res.status(200).json({ message: "Connected to MongoDB successfully!", databases: databasesList.databases });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Respond with an error message
    res.status(500).json({ message: "Failed to connect to MongoDB", error: error.message });
  } finally {
    // Close the connection
    await client.close();
  }
}
