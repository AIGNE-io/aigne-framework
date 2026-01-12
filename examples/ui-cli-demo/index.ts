#!/usr/bin/env npx -y bun

import os from 'os';
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
  name: "GenerativeUIDemo",
  instructions: `You are a friendly assistant that helps the user interact with an application.
Your goal is to use a combination of tools and UI components to help the user accomplish their goal.`,
  inputKey: "message",

  components: [Chart, Table],
  afs,

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

  // skills: [
  //   {
  //     name: 'get_system_metrics',
  //     description: 'Get current system resource usage',
  //     inputSchema: z.object({}),
  //     process: async function (this: any, input: any, options: any) {
  //       const cpus = os.cpus();
  //       const totalMem = os.totalmem();
  //       const freeMem = os.freemem();
  //       const usedMem = totalMem - freeMem;

  //       return {
  //         cpu: {
  //           count: cpus.length,
  //           usage: Math.random() * 100, // Simplified
  //         },
  //         memory: {
  //           total: totalMem,
  //           used: usedMem,
  //           free: freeMem,
  //           usagePercent: (usedMem / totalMem) * 100,
  //         },
  //         uptime: os.uptime(),
  //       };
  //     },
  //   },
  // ],
});

// Run the agent
await runWithAIGNE(agent, {
  aigne,
});
