import { useState, useEffect } from 'react';
import styles from '../styles/index.module.css';

const IndexPage = () => {
  const [storyParams, setStoryParams] = useState({
    age: 5,
    storyType: 'fantasy',
    length: 'short',
    numPictures: 3,
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [storyStatus, setStoryStatus] = useState('');
  const [imageStatus, setImageStatus] = useState('');

  const generateContent = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedStory('');
    setImages([]);
    setStoryStatus('Initiating story generation...');
    setImageStatus('Initiating image generation...');

    try {
      // Generate story
      const storyResponse = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Write a ${storyParams.length} ${storyParams.storyType} story for a ${storyParams.age}-year-old child.` }),
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to generate story');
      }

      const { uniqueId: storyId } = await storyResponse.json();
      setUniqueId(storyId);
      setStoryStatus('Story generation in progress...');

      // Generate pictures
      const pictureResponse = await fetch('/api/generatePictures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `A ${storyParams.storyType} scene for a children's story`,
          numPictures: storyParams.numPictures,
        }),
      });

      if (!pictureResponse.ok) {
        throw new Error('Failed to generate pictures');
      }
      setImageStatus('Image generation in progress...');

    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
      setIsLoading(false);
      setStoryStatus('');
      setImageStatus('');
    }
  };

  useEffect(() => {
    if (uniqueId) {
      const interval = setInterval(async () => {
        try {
          const storyResponse = await fetch(`/api/getStory?id=${uniqueId}`);
          const picturesResponse = await fetch(`/api/getPictures?id=${uniqueId}`);

          if (storyResponse.ok) {
            const storyData = await storyResponse.json();
            if (storyData.story) {
              setGeneratedStory(storyData.story);
              setStoryStatus('Story generated successfully!');
            }
          }

          if (picturesResponse.ok) {
            const picturesData = await picturesResponse.json();
            if (picturesData.images && picturesData.images.length > 0) {
              setImages(picturesData.images);
              setImageStatus(`Generated ${picturesData.images.length} of ${storyParams.numPictures} images`);
              if (picturesData.images.length === storyParams.numPictures) {
                setImageStatus('All images generated successfully!');
                setIsLoading(false);
                clearInterval(interval);
              }
            }
          }

        } catch (error) {
          console.error('Error fetching content:', error);
          setError('Error fetching content. Please try again.');
          setIsLoading(false);
          clearInterval(interval);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [uniqueId, storyParams.numPictures]);

  return (
    <div className={styles.container}>
      <h1>Story and Image Generator</h1>
      <div className={styles.form}>
        <label>
          Age:
          <input
            type="number"
            value={storyParams.age}
            onChange={(e) => setStoryParams({ ...storyParams, age: parseInt(e.target.value) })}
          />
        </label>
        <label>
          Story Type:
          <input
            type="text"
            value={storyParams.storyType}
            onChange={(e) => setStoryParams({ ...storyParams, storyType: e.target.value })}
          />
        </label>
        <label>
          Length:
          <input
            type="text"
            value={storyParams.length}
            onChange={(e) => setStoryParams({ ...storyParams, length: e.target.value })}
          />
        </label>
        <label>
          Number of Pictures:
          <input
            type="number"
            value={storyParams.numPictures}
            onChange={(e) => setStoryParams({ ...storyParams, numPictures: parseInt(e.target.value) })}
          />
        </label>
         <button onClick={generateContent} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Story and Images'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {storyStatus && <p>{storyStatus}</p>}
      {imageStatus && <p>{imageStatus}</p>}
      {generatedStory && (
        <div className={styles.storyContainer}>
          <h2>Generated Story</h2>
          <p>{generatedStory}</p>
        </div>
      )}
      {images.length > 0 && (
        <div className={styles.imageContainer}>
          <h2>Generated Images</h2>
          {images.map((img, index) => (
            <img key={index} src={img} alt={`Generated image ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  )
};
       
export default IndexPage;
