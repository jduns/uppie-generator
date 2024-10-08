import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Home() {
  const [storyParams, setStoryParams] = useState({
    age: 5,
    storyType: 'adventure',
    length: 'medium',
    numPictures: 3,
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [workerInfo, setWorkerInfo] = useState('');
  const [modelInfo, setModelInfo] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({ ...prev, [name]: value }));
  };

  const generatePrompt = () => {
    return `Please create a ${storyParams.storyType} story for a ${storyParams.age}-year-old that is ${storyParams.length} length and includes ${storyParams.numPictures} images.`;
  };

  const generateStory = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedStory('');
    setWorkerInfo('');
    setModelInfo('');

    try {
      const prompt = generatePrompt();
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
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMore = async () => {
    // Implementation for generating more content
    // This could involve calling the API with a "continue story" prompt
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
            onChange={handleInputChange}
          >
            <option value="adventure">Adventure</option>
            <option value="fantasy">Fantasy</option>
            <option value="educational">Educational</option>
          </Select>
        </div>
        
        <div>
          <label className="block mb-1">Length:</label>
          <Select
            name="length"
            value={storyParams.length}
            onChange={handleInputChange}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
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

      {isLoading && <p className="mt-4">Generating your story... This may take a minute.</p>}

      {generatedStory && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Generated Story:</h2>
          <p className="mb-4">{generatedStory}</p>
          <p className="text-sm text-gray-600">Worker: {workerInfo}</p>
          <p className="text-sm text-gray-600 mb-4">Model: {modelInfo}</p>
          <Button onClick={generateMore} className="mr-2">Generate More</Button>
          <Button onClick={regenerate} variant="secondary">Regenerate</Button>
        </div>
      )}
    </div>
  );
}
