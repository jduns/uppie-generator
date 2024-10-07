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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generateStory = async () => {
    // Here you would call your API to generate the story
    // For now, we'll just set a placeholder story
    setGeneratedStory('Once upon a time, in a land far, far away...\n\nThere was a brave young hero who embarked on an exciting adventure...\n\nAlong the way, they met new friends and overcame challenging obstacles...\n\nIn the end, they learned valuable lessons about courage, friendship, and perseverance.\n\nThe End.');
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

        <button onClick={generateStory} className={styles.button}>
          Generate Story
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
