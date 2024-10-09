// components/StoryTypeSelect.js

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"; // Adjust the path if necessary

const StoryTypeSelect = ({ storyParams, handleInputChange }) => {
  return (
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
  );
};

export default StoryTypeSelect;
