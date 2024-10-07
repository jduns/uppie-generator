import { useState } from 'react';

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
    setGeneratedStory('Once upon a time...');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Kids Storybook Generator</h1>
      
      <div>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={storyParams.age}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Story Type:
          <select
            name="storyType"
            value={storyParams.storyType}
            onChange={handleInputChange}
          >
            <option value="adventure">Adventure</option>
            <option value="fantasy">Fantasy</option>
            <option value="educational">Educational</option>
          </select>
        </label>
        <br />
        <label>
          Length:
          <select
            name="length"
            value={storyParams.length}
            onChange={handleInputChange}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
        <br />
        <label>
          Number of Pictures:
          <input
            type="number"
            name="numPictures"
            value={storyParams.numPictures}
            onChange={handleInputChange}
          />
        </label>
      </div>

      <button onClick={generateStory} style={{ marginTop: '20px' }}>
        Generate Story
      </button>

      {generatedStory && (
        <div style={{ marginTop: '20px' }}>
          <h2>Generated Story:</h2>
          <p>{generatedStory}</p>
        </div>
      )}
    </div>
  );
}
