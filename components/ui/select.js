import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select name="storyType" value={storyParams.storyType} onValueChange={(value) => handleInputChange({ target: { name: 'storyType', value } })}>
  <SelectTrigger>
    <SelectValue placeholder="Select story type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="adventure">Adventure</SelectItem>
    <SelectItem value="fantasy">Fantasy</SelectItem>
    <SelectItem value="educational">Educational</SelectItem>
  </SelectContent>
</Select>
  )
}
