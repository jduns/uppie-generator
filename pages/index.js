import { useState, useEffect } from 'react';
import styles from '../styles/index.module.css';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("storybook");
  // Use db for your operations
}
const fetchWithCacheBust = async (url) => {
  const cacheBuster = Date.now();
  const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}cache=${cacheBuster}`);
  return response;
};

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
    const checkStatus = async () => {
      try {
        const response = await fetchWithCacheBust(`/api/checkStatus?id=${uniqueId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.storyComplete) {
          setGeneratedStory(data.story);
          setStoryStatus('Story generated successfully!');
        }
        
        if (data.imagesComplete) {
          setImages(data.images);
          setImageStatus('All images generated successfully!');
        }
        
        if (data.storyComplete && data.imagesComplete) {
          setIsLoading(false);
        } else {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Error fetching content. Please try again.');
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }
}, [uniqueId]);

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
    </div>
  );
};

export default IndexPage;
