#!/usr/bin/env npx -y bun

import assert from "node:assert";
import {
  AIAgent,
  ChatModelOpenAI,
  ExecutionEngine,
  parallel,
  runChatLoopInTerminal,
} from "@aigne/core-next";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
});

const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
  outputKey: "features",
});

const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
  outputKey: "audience",
});

const engine = new ExecutionEngine({ model });

const userAgent = await engine.run(parallel(featureExtractor, audienceAnalyzer));

await runChatLoopInTerminal(userAgent, {
  welcome: `Hello, I'm a product analyst and market researcher. I can help you with extracting features and identifying target audience.`,
  defaultQuestion: "AIGNE is a No-code Generative AI Apps Engine",
  inputKey: "product",
});
