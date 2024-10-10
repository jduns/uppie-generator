// uppie-generator/pages/index.js

import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import styles from '../styles/index.module.css';

export default function Home() {
  const [storyParams, setStoryParams] = useState({
    age: 5,
    storyType: 'adventure',
    length: 'medium',
    numPictures: 3,
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [workerInfo, setWorkerInfo] = useState('');
  const [modelInfo, setModelInfo] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generateStory = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedStory('');
    setWorkerInfo('');
    setModelInfo('');
    setGeneratedImages([]);

    try {
      const prompt = `Write a ${storyParams.length} ${storyParams.storyType} story for a ${storyParams.age}-year-old child. The story should have ${storyParams.numPictures} key scenes that could be illustrated.`;
      const response = await fetch('/api/generateStory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedStory(data.story);
      setWorkerInfo(data.worker);
      setModelInfo(data.model);

      // Generate images
      const images = await generateImages(storyParams.numPictures, data.story);
      setGeneratedImages(images);
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateImages = async (numImages, storyContent) => {
    const images = [];
    for (let i = 0; i < numImages; i++) {
      try {
        const response = await fetch('/api/generateImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `Image for children's story: ${storyContent}` })
        });
        if (response.ok) {
          const data = await response.json();
          images.push(data.image);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
    return images;
  };

  const generateMore = async () => {
    console.log("Generate more functionality not yet implemented");
  };

  const regenerate = () => {
    generateStory();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Kids Storybook Generator</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Age:</label>
          <Input
            type="number"
            name="age"
            value={storyParams.age}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block mb-1">Story Type:</label>
          <Select
            name="storyType"
            value={storyParams.storyType}
            onValueChange={(value) => handleInputChange({ target: { name: 'storyType', value } })}>
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
        
        <div>
          <label className="block mb-1">Length:</label>
          <Select
            name="length"
            value={storyParams.length}
            onValueChange={(value) => handleInputChange({ target: { name: 'length', value } })}>
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
        
        <div>
          <label className="block mb-1">Number of Pictures:</label>
          <Input
            type="number"
            name="numPictures"
            value={storyParams.numPictures}
            onChange={handleInputChange}
          />
        </div>

        <Button onClick={generateStory} disabled={isLoading}>
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
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Generated Story:</h2>
          <p className="mb-4 whitespace-pre-wrap">{generatedStory}</p>
          <p className="text-sm text-gray-600">Worker: {workerInfo}</p>
          <p className="text-sm text-gray-600 mb-4">Model: {modelInfo}</p>
          
          {generatedImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Generated Images:</h3>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image, index) => (
                  <img key={index} src={image} alt={`Story illustration ${index + 1}`} className="w-full h-auto" />
                ))}
              </div>
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
