export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    
    try {
      const apiKey = process.env.AI_HORDE_API_KEY || '0000000000';
      
      const response = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          prompt: prompt,
          params: {
            sampler_name: 'k_lms',
            cfg_scale: 7.5,
            denoising_strength: 0.75,
            height: 512,
            width: 512,
            karras: false,
            tiling: false,
            steps: 30,
            n: 1,
          },
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const taskId = data.id;

      // Poll for completion
      let generatedImage = null;
      let workerName = null;
      let modelName = null;

      while (!generatedImage) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/check/${taskId}`, {
          headers: {
            'apikey': apiKey
          }
        });
        const statusData = await statusResponse.json();

        if (statusData.done) {
          const resultResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${taskId}`, {
            headers: {
              'apikey': apiKey
            }
          });
          const resultData = await resultResponse.json();
          generatedImage = resultData.generations[0].img;
          workerName = resultData.generations[0].worker_name;
          modelName = resultData.model;
        }
      }

      res.status(200).json({
        image: generatedImage,
        worker: workerName,
        model: modelName
      });
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).json({ error: error.message || 'Error generating image. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
