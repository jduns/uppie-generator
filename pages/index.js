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
      const response = await fetch(`${API_BASE_URL}/generate/text/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_HORDE_API_KEY}`, // Add your API key here
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
      setGeneratedStory(statusResponse.story);
    } catch (error) {
      console.error('Error generating story:', error);
      setGeneratedStory('Sorry, there was an error generating your story. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkJobStatus = async (jobId) => {
    let isDone = false;
    let story = '';

    while (!isDone) {
      const response = await fetch(`${API_BASE_URL}/generate/text/status?jobId=${jobId}`);
      const data = await response.json();

      if (data.status === 'done') {
        isDone = true;
        story = data.story; // Adjust this to match the actual response structure
      } else if (data.status === 'error') {
        throw new Error('Error generating story');
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
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
              onChange={handleInputChange
