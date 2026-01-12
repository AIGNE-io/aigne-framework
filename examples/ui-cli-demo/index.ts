#!/usr/bin/env npx -y bun

import os from 'os';
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { FunctionAgent } from "@aigne/core";
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

// Create system metrics skill using FunctionAgent
const getSystemMetricsSkill = FunctionAgent.from({
  name: 'get_system_metrics',
  description: 'Get current system resource usage including CPU count, memory usage, and system uptime',
  process: async function (input: any) {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      cpu: {
        count: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        usage: Math.round(Math.random() * 100), // Simplified - real CPU usage requires more complex calculation
      },
      memory: {
        total: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100, // GB
        used: Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100, // GB
        free: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100, // GB
        usagePercent: Math.round((usedMem / totalMem) * 100 * 100) / 100,
      },
      uptime: {
        seconds: os.uptime(),
        hours: Math.round(os.uptime() / 3600 * 100) / 100,
        days: Math.round(os.uptime() / 86400 * 100) / 100,
      },
      platform: os.platform(),
      hostname: os.hostname(),
    };
  },
});

// Create UIAgent with Chart and Table components
const agent = UIAgent.forCLI({
  name: "GenerativeUIDemo",
  instructions: `You are a friendly assistant that helps the user interact with an application.
Your goal is to use a combination of tools and UI components to help the user accomplish their goal.`,
  inputKey: "message",

  components: [Chart, Table],
  skills: [getSystemMetricsSkill],
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
});

// Run the agent
await runWithAIGNE(agent, {
  aigne,
  chatLoopOptions: {
    welcome: `🎨 AIGNE Generative UI Demo

I can create charts and tables with real-world data! Try these examples:

📊 Charts:
  • "Show me a bar chart of G7 countries by GDP (in trillions)"
  • "Create a line graph of global population growth"
  • "Display a sparkline of average life expectancy over decades"

📋 Tables:
  • "Show me a table of top 10 countries by area"
  • "Display a table comparing USA, China, India with their population, GDP, and life expectancy"
  • "Create a table of BRICS nations with their GDP growth rates and population"

💻 System Metrics:
  • "Show me current system metrics"
  • "Display memory usage as a chart"
  • "Get system information and show it in a table"

💡 Combined Examples:
  • "Generate data for top 10 economies and show both a table and GDP comparison chart"
  • "Compare life expectancy across continents in a table, then visualize as a bar chart"
  • "Get system metrics and create a bar chart of memory usage (total, used, free)"

What data would you like to visualize?`,
  },
});
