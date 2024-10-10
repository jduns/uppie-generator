// uppie-generator/pages/index.js

import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import styles from '../styles/index.module.css';

export default function Home() {
  const [storyParams, setStoryParams] = useState({
    age: '',
    storyType: '',
    length: '',
    numPictures: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [workerInfo, setWorkerInfo] = useState('');
  const [modelInfo, setModelInfo] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams((prev) => ({ ...prev, [name]: value }));
  };

  const generateStory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate generating story
      const story = "Once upon a time...";
      const images = ["/path/to/image1.jpg", "/path/to/image2.jpg"];
      setGeneratedStory(story);
      setGeneratedImages(images);
      setWorkerInfo("Worker Example");
      setModelInfo("Model Example");
    } catch (err) {
      setError("An error occurred while generating the story.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMore = () => {
    setGeneratedStory('');
    setGeneratedImages([]);
    generateStory();
  };

  const regenerate = () => {
    setGeneratedStory('');
    setGeneratedImages([]);
    generateStory();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kids Storybook Generator</h1>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Age:</label>
          <Input
            type="number"
            name="age"
            value={storyParams.age}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Story Type:</label>
          <Select
            name="storyType"
            value={storyParams.storyType}
            onValueChange={(value) => handleInputChange({ target: { name: 'storyType', value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select story type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Length:</label>
          <Select
            name="length"
            value={storyParams.length}
            onValueChange={(value) => handleInputChange({ target: { name: 'length', value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Number of Pictures:</label>
          <Input
            type="number"
            name="numPictures"
            value={storyParams.numPictures}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        <Button onClick={generateStory} disabled={isLoading} className={styles.button}>
          {isLoading ? 'Generating...' : 'Generate Story'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && <p className="mt-4">Generating your story and images... This may take a few minutes.</p>}

      {generatedStory && (
        <div className={styles.storyContainer}>
          <h2 className={styles.storyTitle}>Generated Story:</h2>
          <p className={styles.storyContent}>{generatedStory}</p>
          <p className="text-sm text-gray-600">Worker: {workerInfo}</p>
          <p className="text-sm text-gray-600 mb-4">Model: {modelInfo}</p>

          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <img key={index} src={image} alt={`Story illustration ${index + 1}`} className="w-full h-auto" />
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <Button onClick={generateMore} className="mr-2">Generate More</Button>
            <Button onClick={regenerate} variant="secondary">Regenerate</Button>
          </div>
        </div>
      )}
    </div>
  );
}
