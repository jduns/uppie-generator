import { useState } from 'react';
import styles from './index.module.css';

export default function Home() {
  const [storyParams, setStoryParams] = useState({
    age: 5,
    storyType: 'adventure',
    length: 'medium',
    numPictures: 3,
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading status

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generateStory = async () => {
    setLoading(true); // Set loading to true when starting the generation
    setGeneratedStory(''); // Clear previous story

    try {
      const response = await fetch('/api/generateStory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate story');
      }

      const { jobId } = data; // Get the job ID for the generated story

      // Now check the status of the request
      const statusResponse = await checkJobStatus(jobId);
      setGeneratedStory(statusResponse.story); // Assuming the status response has the story
    } catch (error) {
      console.error('Error generating story:', error);
      setGeneratedStory('Sorry, there was an error generating your story. Please try again later.');
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  // Function to check the status of the job
  const checkJobStatus = async (jobId) => {
    let isDone = false;
    let story = '';

    while (!isDone) {
      const response = await fetch(`https://api.aihorde.net/v2/generate/text/status?jobId=${jobId}`);
      const data = await response.json();

      if (data.status === 'done') {
        isDone = true;
        story = data.story; // Adjust this to match the actual response structure
      } else if (data.status === 'error') {
        throw new Error('Error generating story');
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before rechecking
    }

    return { story };
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kids Storybook Generator</h1>
      
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Age:
            <input
              type="number"
              name="age"
              value={storyParams.age}
              onChange={handleInputChange}
              className={styles.input}
            />
          </label>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Story Type:
            <select
              name="storyType"
              value={storyParams.storyType}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="adventure">Adventure</option>
              <option value="fantasy">Fantasy</option>
              <option value="educational">Educational</option>
            </select>
          </label>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Length:
            <select
              name="length"
              value={storyParams.length}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </label>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Number of Pictures:
            <input
              type="number"
              name="numPictures"
              value={storyParams.numPictures}
              onChange={handleInputChange}
              className={styles.input}
            />
          </label>
        </div>

        <button onClick={generateStory} className={styles.button} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Story'}
        </button>
      </div>

      {generatedStory && (
        <div className={styles.storyContainer}>
          <h2 className={styles.storyTitle}>Generated Story:</h2>
          <p className={styles.storyContent}>{generatedStory}</p>
        </div>
      )}
    </div>
  );
}
