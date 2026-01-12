#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { UIAgent } from "@aigne/ui";
import { Chart, Table, createCLIRenderer } from "@aigne/ui-cli";
import { tmpdir } from "os";
import { join } from "path";
import { getStockPriceSkill } from "./skills/get-stock-price.js";
import { getSystemMetricsSkill } from "./skills/get-system-metrics.js";
// import { createGitHubMCPSkill } from "./skills/github-mcp.js";

// Load AIGNE with OpenAI configuration
const aigne = await loadAIGNEWithCmdOptions();

// Set up AFS with history
const afs = new AFS().mount(
  new AFSHistory({
    // storage: { url: ":memory:" }, // In-memory for demo
    storage: { url: `file:${join(tmpdir(), "gen-ui-cli-history.sqlite3")}` },
  }),
);
console.log("💾 AFS History Database:", join(tmpdir(), "gen-ui-cli-history.sqlite3"));

// Initialize skills
const skills = [getSystemMetricsSkill, getStockPriceSkill];

// Try to add GitHub MCP skill (optional - only if token is configured)
// try {
//   const githubSkill = await createGitHubMCPSkill();
//   skills.push(githubSkill);
//   console.log("✓ GitHub MCP integration enabled");
// } catch (error) {
//   console.log("ℹ GitHub MCP integration disabled (GITHUB_PERSONAL_ACCESS_TOKEN not set)");
// }

// Create UIAgent with Chart and Table components
const agent = UIAgent.forCLI({
  name: "GenerativeUIDemo",
  inputKey: "message",
  instructions: `You are a friendly assistant that helps the user interact with an application.
Your goal is to use a combination of tools and UI components to help the user accomplish their goal.`,

  afs,

  skills,
  components: [Chart, Table],

  // Use the CLI renderer for automatic rendering
  onComponentShow: createCLIRenderer(),

  catchToolsError: false,
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

📈 Stock Prices:
  • "Get the current price of Apple stock (AAPL)"
  • "Show me TSLA stock information"
  • "Compare AAPL, GOOGL, and MSFT prices in a table"
  • "Create a chart showing the day high and low for NVDA"

🐙 GitHub (if configured):
  • "Search for issues in owner/repo repository"
  • "Get repository information for owner/repo"
  • "List pull requests in owner/repo"
  • "Create an issue in owner/repo with title and description"

💡 Combined Examples:
  • "Generate data for top 10 economies and show both a table and GDP comparison chart"
  • "Compare life expectancy across continents in a table, then visualize as a bar chart"
  • "Get system metrics and create a bar chart of memory usage (total, used, free)"
  • "Get AAPL stock price and create a bar chart comparing open, high, low, and current price"

What data would you like to visualize?`,
  },
});
