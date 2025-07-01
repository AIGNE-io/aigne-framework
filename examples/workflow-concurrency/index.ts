#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";

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

const agent = TeamAgent.from({
  name: "example_concurrency",
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel,
});

await runWithAIGNE(agent, {
  chatLoopOptions: {
    welcome: `Hello, I'm a product analyst and market researcher. I can help you with extracting features and identifying target audience.`,
    defaultQuestion: "AIGNE is a No-code Generative AI Apps Engine",
    inputKey: "product",
  },
});
