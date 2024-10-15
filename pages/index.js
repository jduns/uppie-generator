import { useState, useEffect } from 'react';
import styles from '../styles/index.module.css';

const IndexPage = () => {
  const [storyParams, setStoryParams] = useState({
    age: 5,
    storyType: 'fantasy',
    length: 'short',
    numPictures: 3,
    mainCharacter: '',
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [storyStatus, setStoryStatus] = useState('');
  const [imageStatus, setImageStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generateContent = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedStory('');
    setImages([]);
    setStoryStatus('Initiating story generation...');
    setImageStatus('Initiating image generation...');

    try {
      // Initiate story generation
      const storyResponse = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a ${storyParams.length} ${storyParams.storyType} story for a ${storyParams.age}-year-old child. The main character's name is ${storyParams.mainCharacter}.`
        }),
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to initiate story generation');
      }

      const { uniqueId } = await storyResponse.json();
      setUniqueId(uniqueId);

      // Poll for story status
      pollStoryStatus(uniqueId);

      // Initiate image generation
      const imageResponse = await fetch('/api/generatePictures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Illustration for a ${storyParams.storyType} story for ${storyParams.age}-year-old children, featuring ${storyParams.mainCharacter}`,
          numPictures: storyParams.numPictures
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to initiate image generation');
      }

      const { taskId } = await imageResponse.json();

      // Poll for image status
      pollImageStatus(taskId);

    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
      setIsLoading(false);
      setStoryStatus('');
      setImageStatus('');
    }
  };

  const pollStoryStatus = async (id) => {
    try {
      const response = await fetch(`/api/checkStoryStatus?uniqueId=${id}`);
      const data = await response.json();

      if (data.status === 'complete') {
        setGeneratedStory(data.story);
        setStoryStatus('Story generation complete');
        setIsLoading(false);
      } else if (data.status === 'error') {
        throw new Error(data.error);
      } else {
        // If still pending, poll again after 5 seconds
        setTimeout(() => pollStoryStatus(id), 5000);
      }
    } catch (error) {
      console.error('Error polling story status:', error);
      setError('Failed to retrieve story. Please try again.');
      setIsLoading(false);
      setStoryStatus('');
    }
  };

  const pollImageStatus = async (taskId) => {
    try {
      const response = await fetch('/api/checkPictureStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await response.json();

      if (data.done) {
        setImages(data.images);
        setImageStatus('Image generation complete');
        setIsLoading(false);
      } else {
        // If not done, poll again after 5 seconds
        setTimeout(() => pollImageStatus(taskId), 5000);
      }
    } catch (error) {
      console.error('Error polling image status:', error);
      setError('Failed to retrieve images. Please try again.');
      setIsLoading(false);
      setImageStatus('');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Story and Image Generator</h1>
      <div className={styles.form}>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={storyParams.age}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Story Type:
          <input
            type="text"
            name="storyType"
            value={storyParams.storyType}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Length:
          <select name="length" value={storyParams.length} onChange={handleInputChange}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
        <label>
          Number of Pictures:
          <input
            type="number"
            name="numPictures"
            value={storyParams.numPictures}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Main Character's Name:
          <input
            type="text"
            name="mainCharacter"
            value={storyParams.mainCharacter}
            onChange={handleInputChange}
          />
        </label>
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
