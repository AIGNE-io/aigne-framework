#!/usr/bin/env npx -y bun

import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  model: "openai/gpt-image-1",
  // model: "google/gemini-2.5-flash-image-preview",
  // model: "ideogram/ideogram-v3",
  // model: "doubao/doubao-seedream-4-0-250828",
});

const result = await model.invoke({
  prompt: "Change to cartoon style",
  image: [
    {
      type: "url",
      url: "https://hub.aigne.io/image-bin/uploads/c9121213809f72a63d0fb9d793b4f175.png",
    },
  ],
  outputFileType: "local",
});

console.log(result);
