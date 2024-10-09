import { useState } from 'react';
import styles from './index.module.css';

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
    setImages([]); // Reset images

    try {
      // Initiate story generation
      const storyResponse = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyParams),
      });

      if (!storyResponse.ok) {
        throw new Error(`HTTP error! status: ${storyResponse.status}`);
      }

      const { taskId: storyTaskId } = await storyResponse.json();

      // Validate taskId for story
      if (!storyTaskId) {
        throw new Error('Story Task ID is undefined');
      }

     // Poll for story completion
const pollStory = async () => {
  const storyStatusResponse = await fetch(`/api/checkStoryStatus?taskId=${storyTaskId}`, {
    method: 'GET', // Change to GET request
  });

  if (!storyStatusResponse.ok) {
    throw new Error('Error checking story status');
  }

  const storyData = await storyStatusResponse.json();

  if (storyData.done) {
    setGeneratedStory(storyData.story);

    // Now that the story is generated, initiate picture generation
    const pictureResponse = await fetch('/api/generatePictures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: storyData.story, // Use the generated story as a prompt
        numPictures: storyParams.numPictures,
      }),
    });

    if (!pictureResponse.ok) {
      throw new Error(`HTTP error! status: ${pictureResponse.status}`);
    }

    const { taskId: pictureTaskId } = await pictureResponse.json();

    // Validate taskId for pictures
    if (!pictureTaskId) {
      throw new Error('Picture Task ID is undefined');
    }

    // Poll for picture completion
    const pollPictures = async () => {
      const pictureStatusResponse = await fetch(`/api/checkPictureStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: pictureTaskId }), // Send taskId in the body
      });

      if (!pictureStatusResponse.ok) {
        throw new Error('Error checking picture status');
      }

      const pictureData = await pictureStatusResponse.json();

      if (pictureData.done) {
        setImages(pictureData.images);
      } else {
        setTimeout(pollPictures, 5000);
      }
    };

    pollPictures(); // Start polling for pictures
  } else {
    setTimeout(pollStory, 5000);
  }
};

pollStory(); // Start polling for story

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

      {/* Form to set parameters */}
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

      {/* Render generated story */}
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

      {/* Render images */}
      {images.length > 0 && (
        <div className={styles.imageTable}>
          <h2>Illustrations</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                {images.map((img, index) => (
                  <td key={index} className={styles.imageCell}>
                    <img src={img} alt={`Illustration ${index + 1}`} className={styles.image} />
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
