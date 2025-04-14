#!/usr/bin/env npx -y bun

import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, sequential } from "@aigne/core";
import { createAdaptiveModel } from "@aigne/core/utils/create-adaptive-model.js";

const model = createAdaptiveModel();

const conceptExtractor = AIAgent.from({
  instructions: `\
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
  outputKey: "concept",
});

const writer = AIAgent.from({
  instructions: `\
You are a marketing copywriter. Given a block of text describing features, audience, and USPs,
compose a compelling marketing copy (like a newsletter section) that highlights these points.
Output should be short (around 150 words), output just the copy as a single text block.

Product description:
{{product}}

Below is the info about the product:
{{concept}}`,
  outputKey: "draft",
});

const formatProof = AIAgent.from({
  instructions: `\
You are an editor. Given the draft copy, correct grammar, improve clarity, ensure consistent tone,
give format and make it polished. Output the final improved copy as a single text block.

Product description:
{{product}}

Below is the info about the product:
{{concept}}

Draft copy:
{{draft}}`,
  outputKey: "content",
});

const engine = new ExecutionEngine({ model });

const userAgent = engine.call(sequential(conceptExtractor, writer, formatProof));

await runChatLoopInTerminal(userAgent, {
  welcome: `Hello, I'm a marketing assistant. I can help you with product descriptions, marketing copy, and editing.`,
  defaultQuestion: "AIGNE is a No-code Generative AI Apps Engine",
  inputKey: "product",
});
