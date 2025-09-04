#!/usr/bin/env npx -y bun

import { join } from "node:path";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory";

const agent = AIAgent.from({
  name: "nano_banana",
  instructions: "You are a drawer who creates images based on user descriptions.",
  memory: [
    new DefaultMemory({
      storage: { url: `file:${join(import.meta.dirname, "memory.db")}` },
    }),
  ],
  inputKey: "message",
  fileInputKey: "files",
});

await runWithAIGNE(agent, {
  modelOptions: {
    model: "aignehub:gemini/gemini-2.5-flash-image-preview",
    modalities: ["text", "image"],
  },
  chatLoopOptions: {
    welcome: "Draw an image of a lovely cat in the space",
  },
});
