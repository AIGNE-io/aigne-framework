import { GeminiImageModel } from "../src/gemini-image-model.js";

const model = new GeminiImageModel({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log(process.env.GEMINI_API_KEY);

const input = {
  prompt: "A beautiful sunset over a calm ocean",
  model: "imagen-4.0-generate-001",
};

const output = await model.process(input);
console.log(output);
