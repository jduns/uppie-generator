// pages/api/checkPictureStatus.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { taskId } = req.body;
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/check/${taskId}`, {
        method: 'GET',
        headers: { 'apikey': apiKey },
      });
      const responseText = await statusResponse.text();
      console.log('Raw status response:', responseText);
      if (!statusResponse.ok) {
        throw new Error(`Error checking picture status: ${statusResponse.status} - ${responseText}`);
      }
      const statusData = JSON.parse(responseText);
      console.log('Parsed status data:', statusData);
      if (statusData.done) {
        const imagesResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${taskId}`, {
          method: 'GET',
          headers: { 'apikey': apiKey },
        });
        const imagesData = await imagesResponse.json();
        console.log('Images data:', imagesData);
        const images = imagesData.generations.map(gen => {
          if (gen.img) {
            return `data:image/webp;base64,${gen.img}`;
          } else {
            console.error('Missing image data for generation:', gen);
            return null;
          }
        }).filter(img => img !== null);
        console.log(`Processed ${images.length} images`);
        res.status(200).json({ done: true, images });
      } else {
        res.status(200).json({ 
          done: false, 
          ...statusData,
          message: `Generation in progress. Waiting: ${statusData.waiting}, Processing: ${statusData.processing}`
        });
      }
    } catch (error) {
      console.error('Error in checkPictureStatus:', error);
      res.status(500).json
