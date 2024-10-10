// pages/api/checkPictureStatus.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { taskId } = req.body;

    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';

      const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${taskId}`, {
        method: 'GET',
        headers: { 'apikey': apiKey },
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(`Error checking picture status: ${statusResponse.status} - ${JSON.stringify(errorData)}`);
      }

      const statusData = await statusResponse.json();
      console.log('Status Response:', statusData);

      if (statusData.done) {
        // Fetch the actual images
        const imagesResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${taskId}`, {
          method: 'GET',
          headers: { 'apikey': apiKey },
        });

        if (!imagesResponse.ok) {
          throw new Error(`Error fetching images: ${imagesResponse.status}`);
        }

        const imagesData = await imagesResponse.json();
        console.log('Images Data:', imagesData);

        const images = imagesData.generations.map(gen => {
          if (gen.img) {
            return `data:image/webp;base64,${gen.img}`;
          } else {
            console.error('Missing image data for generation:', gen);
            return null;
          }
        }).filter(img => img !== null);

        console.log('Processed Images:', images);
        console.log('Sending image data to frontend:', JSON.stringify(images));

        res.status(200).json({ done: true, images });
      } else {
        res.status(200).json({ done: false, ...statusData });
      }
    } catch (error) {
      console.error('Error checking picture status:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
