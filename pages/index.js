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
      const storyResponse = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Write a ${storyParams.length} ${storyParams.storyType} story for a ${storyParams.age}-year-old child.` }),
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to initiate story generation');
      }

      const { uniqueId } = await storyResponse.json();
      setUniqueId(uniqueId);
      setStoryStatus('Story generation in progress...');
      pollStoryStatus(uniqueId);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
      setIsLoading(false);
      setStoryStatus('');
      setImageStatus('');
    }
  };

  const pollStoryStatus = async (uniqueId) => {
    try {
      const response = await fetch(`/api/checkStoryStatus?uniqueId=${uniqueId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'complete') {
        setGeneratedStory(data.story);
        setStoryStatus('Story generated successfully!');
        setIsLoading(false);
        generateImages(uniqueId, data.story);
      } else if (data.status === 'error') {
        throw new Error(data.error);
      } else {
        // Still pending, check again after 5 seconds
        setTimeout(() => pollStoryStatus(uniqueId), 5000);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Error fetching story. Please try again.');
      setIsLoading(false);
    }
  };

  const generateImages = async (uniqueId, story) => {
    setImageStatus('Generating images...');
    try {
      const response = await fetch('/api/generatePictures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uniqueId, prompt: story, numPictures: storyParams.numPictures }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate image generation');
      }

      const { taskId } = await response.json();
      pollImageStatus(taskId);
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Failed to generate images. Please try again.');
      setImageStatus('');
    }
  };

  const pollImageStatus = async (taskId) => {
    try {
      const response = await fetch('/api/checkPictureStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.done) {
        setImages(data.images);
        setImageStatus('Images generated successfully!');
      } else {
        // Still pending, check again after 5 seconds
        setTimeout(() => pollImageStatus(taskId), 5000);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Error fetching images. Please try again.');
      setImageStatus('');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Story and Image Generator</h1>
      <div className={styles.form}>
        {/* ... (form inputs remain the same) ... */}
        <button onClick={generateContent} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Story and Images'}
        </button>
      </div>
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
  );
};

export default IndexPage;
