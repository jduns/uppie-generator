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
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generateStory = async () => {
    setLoading(true);
    setGeneratedStory('');

    try {
      const response = await fetch('https://ai-horde.com/api/v1/generate', { // Replace with your AI Horde API URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer 0000000000`, // Replace YOUR_API_KEY with your actual API key
      },
        body: JSON.stringify({
          age: storyParams.age,
          storyType: storyParams.storyType,
          length: storyParams.length,
          numPictures: storyParams.numPictures,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setGeneratedStory(data.story); // Adjust this based on the actual response structure
    } catch (error) {
      console.error('Error generating story:', error);
      setGeneratedStory('There was an error generating your story. Please try again.');
    } finally {
      setLoading(false);
    }
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
