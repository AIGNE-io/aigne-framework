#!/usr/bin/env npx -y bun

import { join } from "node:path";
import { FSMemory } from "@aigne/agent-library/fs-memory/index.js";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  name: "memory_example",
  instructions: "You are a friendly chatbot",
  memory: [new FSMemory({ rootDir: join(import.meta.dirname, "memories") })],
});

await runWithAIGNE(agent, {
  chatLoopOptions: {
    welcome: "Hello! I'm a chatbot with memory. Try asking me a question!",
  },
});
