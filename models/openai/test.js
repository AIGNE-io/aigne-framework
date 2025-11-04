import { OpenAIChatModel } from "./src/index.js";

const model = new OpenAIChatModel({
  model: "gpt-5",
  apiKey: process.env.OPENAI_API_KEY,
  modelOptions: {
    temperature: 0.5,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, how are you?" }],
});

console.log(result);
