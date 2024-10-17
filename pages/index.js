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
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [error, setError] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [storyStatus, setStoryStatus] = useState('');
  const [imageStatus, setImageStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generateStory = async () => {
    setIsGeneratingStory(true);
    setError('');
    setGeneratedStory('');
    setStoryStatus('Initiating story generation...');

    try {
      const response = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyParams),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate story generation');
      }

      const { uniqueId } = await response.json();
      setUniqueId(uniqueId);
      pollStoryStatus(uniqueId);
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please try again.');
      setIsGeneratingStory(false);
      setStoryStatus('');
    }
  };

  const pollStoryStatus = async (id) => {
    try {
      const response = await fetch(`/api/checkStoryStatus?uniqueId=${id}`);
      const data = await response.json();

      if (data.status === 'complete') {
        setGeneratedStory(data.story);
        setStoryStatus('Story generation complete');
        setIsGeneratingStory(false);
      } else if (data.status === 'error') {
        throw new Error(data.error);
      } else {
        setStoryStatus(`Story generation in progress... ${data.progress || ''}`);
        setTimeout(() => pollStoryStatus(id), 5000);
      }
    } catch (error) {
      console.error('Error polling story status:', error);
      setError('Failed to retrieve story. Please try again.');
      setIsGeneratingStory(false);
      setStoryStatus('');
    }
  };

  const generateImages = async () => {
    setIsGeneratingImages(true);
    setError('');
    setImages([]);
    setImageStatus('Initiating image generation...');

    try {
      const response = await fetch('/api/generatePictures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyParams),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const { uniqueId } = await response.json();
      pollImageStatus(uniqueId);
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Failed to generate images. Please try again.');
      setIsGeneratingImages(false);
      setImageStatus('');
    }
  };

  const pollImageStatus = async (id) => {
    try {
      const response = await fetch(`/api/checkPictureStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id }),
      });
      const data = await response.json();

      if (data.done) {
        setImages(data.images);
        setIsGeneratingImages(false);
        setImageStatus('Image generation complete');
      } else {
        setImageStatus(`Image generation in progress... ${data.message || ''}`);
        setTimeout(() => pollImageStatus(id), 5000);
      }
    } catch (error) {
      console.error('Error polling image status:', error);
      setError('Failed to retrieve images. Please try again.');
      setIsGeneratingImages(false);
      setImageStatus('');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Story Generator</h1>
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
          Main Character's Name:
          <input
            type="text"
            name="mainCharacter"
            value={storyParams.mainCharacter}
            onChange={handleInputChange}
          />
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
      <div className={styles.buttonContainer}>
          <button onClick={generateStory} disabled={isGeneratingStory || isGeneratingImages}>
            {isGeneratingStory ? 'Generating Story...' : 'Generate Story'}
          </button>
          <button onClick={generateImages} disabled={isGeneratingStory || isGeneratingImages}>
            {isGeneratingImages ? 'Generating Images...' : 'Generate Images'}
          </button>
        </div>
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
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Generated image ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IndexPage;
