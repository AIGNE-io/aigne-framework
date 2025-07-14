#!/usr/bin/env npx -y bun

import { join } from "node:path";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory/adapter/memory.js";
import { FSMemory } from "@aigne/fs-memory/adapter/memory.js";

const agent = AIAgent.from({
  name: "memory_example",
  instructions: "You are a friendly chatbot",
  memory: [
    new DefaultMemory({
      storage: {
        url: `file:${join(import.meta.dirname, "memory.db")}`,
      },
    }),
    new FSMemory({ rootDir: join(import.meta.dirname, "memories") }),
  ],
  inputKey: "message",
});

await runWithAIGNE(agent, {
  chatLoopOptions: {
    welcome: "Hello! I'm a chatbot with memory. Try asking me a question!",
  },
});
