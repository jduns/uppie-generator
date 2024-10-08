 // The initial response contains a task ID, we need to check the status and get the result
      const taskId = data.id;
      let generatedText = null;
      
      while (!generatedText) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        
        const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/text/status/${taskId}`, {
          headers: { 'apikey': apiKey }
        });
        
        if (!statusResponse.ok) {
          throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }
        
        const statusData = await statusResponse.json();
        
        if (statusData.done) {
          generatedText = statusData.generations[0].text;
        }
      }

      res.status(200).json({ story: generatedText });
    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: error.message || 'Error generating story. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
