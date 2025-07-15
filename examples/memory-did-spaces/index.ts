#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import { DIDSpacesMemory } from "@aigne/did-space-memory";

const { DID_SPACES_URL, DID_SPACES_AUTHORIZATION } = process.env;
if (!DID_SPACES_URL || !DID_SPACES_AUTHORIZATION) {
  console.error("Please set DID_SPACES_URL and DID_SPACES_AUTHORIZATION environment variables.");
  process.exit(1);
}

const agent = AIAgent.from({
  instructions: `You are a crypto analyst with memory. Give brief answers only.

- Remember user details
- Answer in 20 words or less
- Show facts only, no explanations`,
  memory: new DIDSpacesMemory({
    url: DID_SPACES_URL,
    auth: {
      authorization: DID_SPACES_AUTHORIZATION,
    },
  }),
  inputKey: "message",
});

await runWithAIGNE(agent, {
  chatLoopOptions: {
    welcome: "Hello! I'm a chatbot with memory (in DID Space). Try asking me a question!",
  },
});
