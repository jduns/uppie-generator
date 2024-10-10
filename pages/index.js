// pages/index.js
import { useState } from 'react';
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

  const generateContent = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedStory('');
    setImages([]);

    try {
      // Initiate story generation
      const storyResponse = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyParams),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.text();
        throw new Error(`Error generating story: ${errorData}`);
      }

      const { taskId: storyTaskId } = await storyResponse.json();
      if (!storyTaskId) {
        throw new Error('Story Task ID is undefined');
      }

      console.log('Story Task ID:', storyTaskId);

      const pollStory = async () => {
        const storyStatusResponse = await fetch(`/api/checkStoryStatus?taskId=${storyTaskId}`, {
          method: 'GET',
        });

        if (!storyStatusResponse.ok) {
          const errorData = await storyStatusResponse.text();
          throw new Error(`Error checking story status: ${errorData}`);
        }

        const storyData = await storyStatusResponse.json();
        if (storyData.done) {
          if (storyData.story && storyData.story.length > 5) {
            setGeneratedStory(storyData.story);
            // Generate pictures based on the story
            const pictureResponse = await fetch('/api/generatePictures', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: storyData.story,
                numPictures: storyParams.numPictures,
              }),
            });

            if (!pictureResponse.ok) {
              const errorData = await pictureResponse.text();
              throw new Error(`Error generating pictures: ${errorData}`);
            }

            const { taskId: pictureTaskId } = await pictureResponse.json();
            if (!pictureTaskId) {
              throw new Error('Picture Task ID is undefined');
            }

            console.log('Picture Task ID:', pictureTaskId);

            let retryCount = 0;
          const pollPictures = async () => {
  if (retryCount > 10) {  // Increased retry count
    setError('Failed to generate images after multiple attempts. The server might be busy. Please try again later.');
    setIsLoading(false);
    return;
  }

  try {
    const pictureStatusResponse = await fetch(`/api/checkPictureStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: pictureTaskId }),
    });

    if (!pictureStatusResponse.ok) {
      throw new Error(`HTTP error! status: ${pictureStatusResponse.status}`);
    }

    const pictureData = await pictureStatusResponse.json();
    console.log('Received picture data:', pictureData);

    if (pictureData.done && Array.isArray(pictureData.images)) {
      console.log('Received images:', pictureData.images);
      const validImages = pictureData.images.filter(img => img && typeof img === 'string' && img.startsWith('data:image'));
      setImages(validImages);

      if (validImages.length === 0) {
        setError('No valid images were generated. Please try again.');
      }
      setIsLoading(false);
    } else {
      setError(`Image generation in progress: ${pictureData.message || 'Please wait...'}`);
      retryCount += 1;
      setTimeout(pollPictures, 10000);  // Increased polling interval to 10 seconds
    }
  } catch (error) {
    console.error('Error in pollPictures:', error);
    setError(`Error checking image status: ${error.message}`);
    retryCount += 1;
    setTimeout(pollPictures, 10000);  // Increased polling interval to 10 seconds
  }
};
            pollPictures();
          } else {
            throw new Error('Generated story is too short.');
          }
        } else {
          setTimeout(pollStory, 5000);
        }
      };

      pollStory();
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
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
      </div>
      
      {error && <p className={styles.error}>{error}</p>}
      
      {generatedStory && (
        <div className={styles.storyTable}>
          <h2>Generated Story</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.storyCell}>
                  <p>{generatedStory}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {images.length > 0 && (
        <div className={styles.imageTable}>
          <h2>Illustrations</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                {images.map((img, index) => (
                  <td key={index} className={styles.imageCell}>
                    <img 
                      src={img} 
                      alt={`Illustration ${index + 1}`} 
                      className={styles.image}
                      onError={(e) => {
                        console.error(`Error loading image ${index}:`, e);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
