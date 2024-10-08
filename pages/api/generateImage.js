import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  try {
    // Replace these with your actual AI Horde API endpoint and key
    const apiUrl = 'https://stablehorde.net/api/v2/generate/async';
    const apiKey = 'YOUR_API_KEY';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
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
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const taskId = data.id;

    // Poll for completion
    let generatedImage = null;
    while (!generatedImage) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/check/${taskId}`);
      const statusData = await statusResponse.json();

      if (statusData.done) {
        const resultResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${taskId}`);
        const resultData = await resultResponse.json();
        generatedImage = resultData.generations[0].img;
      }
    }

    res.status(200).json({
      image: generatedImage,
      worker: statusData.worker_name,
      model: statusData.model
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating image', error: error.message });
  }
}
