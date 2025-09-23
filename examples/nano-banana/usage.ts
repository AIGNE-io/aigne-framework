#!/usr/bin/env npx -y bun

import { loadChatModel } from "@aigne/cli/utils/aigne-hub/model.js";
import { AIAgent } from "@aigne/core";

const model = await loadChatModel({
  model: "aignehub:google/gemini-2.5-flash-image-preview",
  modalities: ["text", "image"],
});

const agent = AIAgent.from({
  name: "nano_banana",
  model,
  instructions: "You are a drawer who creates images based on user descriptions.",
  inputKey: "message",
  fileInputKey: "files",
  outputFileType: "local",
});

const result = await agent.invoke({ message: "Draw an image: a horse fly in the space" });

console.log(result);
