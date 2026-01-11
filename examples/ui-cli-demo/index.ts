#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgentToolChoice } from "@aigne/core";
import { Chart, Table } from "@aigne/ui-cli";
import { UIAgent, UI_TOOL_NAME_PREFIX } from "@aigne/ui";
import { render } from "ink";

// Load AIGNE with OpenAI configuration
const aigne = await loadAIGNEWithCmdOptions();

// Set up AFS with history
const afs = new AFS().mount(
  new AFSHistory({
    storage: { url: ":memory:" }, // In-memory for demo
  })
);

// Create UIAgent with Chart and Table components
const agent = UIAgent.forCLI({
  name: "ui-assistant",
  instructions: `You are a friendly assistant that helps the user interact with an application.
Your goal is to use a combination of tools and UI components to help the user accomplish their goal.`,
  inputKey: "message",

  components: [Chart, Table],
  afs,
  model: aigne.chatModel,

  // Use 'auto' to allow the model to choose when to call tools vs respond with text
  toolChoice: AIAgentToolChoice.auto,

  // Don't catch tool errors - let them propagate for debugging
  catchToolsError: false,

  hooks: {
    onSkillEnd: async (event) => {
      // Handle errors
      if ('error' in event && event.error) {
        console.error("\n❌ Error:", event.error);
        return;
      }

      // Only render UI components
      if (!event.skill.name.startsWith(UI_TOOL_NAME_PREFIX)) {
        return;
      }

      const result = event.output as any;
      if (result?.element) {
        try {
          console.log(); // Empty line for spacing
          const { unmount } = render(result.element);
          await new Promise(resolve => setTimeout(resolve, 100));
          unmount();
          console.log(); // Empty line for spacing
        } catch (error) {
          console.error("❌ Render error:", error);
        }
      }
    },
  },
});

// Run the agent
await runWithAIGNE(agent, {
  aigne,
});
