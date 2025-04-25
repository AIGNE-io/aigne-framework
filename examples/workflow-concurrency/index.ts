#!/usr/bin/env bunwrapper

import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, TeamAgent } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";

const model = await loadModel();

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

const userAgent = engine.call(
  TeamAgent.from({
    tools: [featureExtractor, audienceAnalyzer],
    processMethod: "parallel",
  }),
);

await runChatLoopInTerminal(userAgent, {
  welcome: `Hello, I'm a product analyst and market researcher. I can help you with extracting features and identifying target audience.`,
  defaultQuestion: "AIGNE is a No-code Generative AI Apps Engine",
  inputKey: "product",
});
