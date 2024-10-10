// pages/api/generateStory.js and pages/api/generatePictures.js
import { generateUniqueId } from '../../utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      const webhookUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/webhook`;
      const uniqueId = generateUniqueId();
