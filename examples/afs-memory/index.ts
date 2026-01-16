#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";

const aigne = await loadAIGNEWithCmdOptions();

const afs = new AFS().mount(new AFSHistory({ storage: { url: "file:./history.sqlite3" } })).mount(
  new UserProfileMemory({
    storage: { url: "file:./user_profile.sqlite3" },
  }),
);

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
