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
  chatLoopOptions: {
    welcome: `🎨 AIGNE Generative UI Demo

I can create charts and tables with real-world data! Try these examples:

📊 Charts:
  • "Show me a bar chart of G7 countries by GDP (in trillions): USA 25.5, China 17.9, Japan 4.2, Germany 4.1, UK 3.1, France 2.9, Italy 2.0"
  • "Create a line graph of global population growth: 1950: 2.5B, 1975: 4.1B, 2000: 6.1B, 2025: 8.0B"
  • "Display a sparkline of average life expectancy over decades: 45, 52, 60, 67, 72, 75, 78"

📋 Tables:
  • "Show me a table of top 5 countries by area (Russia, Canada, USA, China, Brazil)"
  • "Display a table comparing USA, China, India with their population, GDP, and life expectancy"
  • "Create a table of BRICS nations with their GDP growth rates and population"

💡 Combined Examples:
  • "Generate data for top 10 economies and show both a table and GDP comparison chart"
  • "Compare life expectancy across continents in a table, then visualize as a bar chart"

What global data would you like to visualize?`,
  },
});
