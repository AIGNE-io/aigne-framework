#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";

const aigne = await loadAIGNEWithCmdOptions();

const sharedStorage = { url: "file:./memory.sqlite3" };

const afs = new AFS()
  .mount(new AFSHistory({ storage: sharedStorage }))
  .mount(new UserProfileMemory({ storage: sharedStorage, context: aigne.newContext() }));

const agent = AIAgent.from({
  instructions: "You are a friendly chatbot",
  inputKey: "message",
  afs,
});

await runWithAIGNE(agent, {
  aigne,
  chatLoopOptions: {
    welcome: "Hello! I'm a chatbot with memory. Try asking me a question!",
  },
});
