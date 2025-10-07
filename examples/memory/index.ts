#!/usr/bin/env npx -y bun

import { UserProfileMemory } from "@aigne/agent-library/afs-modules/user-profile-memory/index.js";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import { AFS } from "@aigne/fs";

await runWithAIGNE(
  (aigne) =>
    AIAgent.from({
      name: "memory_example",
      instructions: "You are a friendly chatbot",
      inputKey: "message",
      afs: new AFS({ storage: { url: "file:./memory.sqlite3" } }).use(
        new UserProfileMemory({ context: aigne.newContext() }),
      ),
    }),
  {
    chatLoopOptions: {
      welcome: "Hello! I'm a chatbot with memory. Try asking me a question!",
    },
  },
);
