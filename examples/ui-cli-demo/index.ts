#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgentToolChoice } from "@aigne/core";
import { SimpleChart } from "@aigne/ui-cli";
import { UIAgent } from "@aigne/ui";
import { render } from "ink";

// Load AIGNE with OpenAI configuration
const aigne = await loadAIGNEWithCmdOptions();

// Set up AFS with history
const afs = new AFS().mount(
  new AFSHistory({
    storage: { url: ":memory:" }, // In-memory for demo
  })
);

// Create UIAgent with SimpleChart component
const agent = UIAgent.forCLI({
  name: "chart-assistant",
  instructions: `You are a chart visualization assistant.

CRITICAL RULE: Whenever the user provides numeric data or requests visualization, you MUST immediately call the ui_chart tool with that data. Do NOT respond with explanatory text.

Pattern matching:
- If message contains numbers AND words like "show", "chart", "visualize", "plot", "graph" → Call ui_chart
- Extract the numbers from the message and pass as data array
- Look for optional title in the message

Examples:
- "Show me a chart of 5, 10, 15, 20" → ui_chart({data: [5, 10, 15, 20]})
- "Visualize: 3, 7, 2, 9" → ui_chart({data: [3, 7, 2, 9]})
- "Chart sales 100, 150, 200" → ui_chart({data: [100, 150, 200], title: "Sales"})
- "Plot these: 1 2 3 5 8" → ui_chart({data: [1, 2, 3, 5, 8]})

Only respond with text if:
- User asks a question about charts (not requesting actual visualization)
- User provides no data`,

  components: [SimpleChart],
  afs,
  model: aigne.chatModel,

  // TEMPORARY: Force tool usage to test if rendering works
  // Change back to 'auto' once we verify the tool is working
  toolChoice: AIAgentToolChoice.required,

  // Don't catch tool errors - let them propagate for debugging
  catchToolsError: false,

  // ✅ CORRECT: Hooks must be passed inside a 'hooks' object, not as top-level properties
  hooks: {
    // Hook into skill completion (handles both success and error)
    onSkillEnd: (event) => {
    // Check if this was an error
    if ('error' in event && event.error) {
      console.error("\n❌ Skill error:", event.skill.name);
      console.error("Error:", event.error);
      return;
    }

    // It's a success - check if it's a UI component
    if (!event.skill.name.startsWith("ui_")) {
      return; // Not a UI skill, ignore
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ UI Component Skill Completed!");
    console.log("Skill:", event.skill.name);

    const result = event.output as any;

    console.log("Result:", {
      hasElement: !!result?.element,
      componentName: result?.componentName,
      instanceId: result?.instanceId,
    });

    // Render chart as plain text (Ink's render() conflicts with AIGNE CLI spinner)
    if (result?.element) {
      console.log("\n🎨 Chart Visualization:\n");

      try {
        // Extract props from the Ink element to render as plain text
        const props = result.element.props;
        const { data, title, height = 10 } = props;

        // Render ASCII chart manually
        const lines: string[] = [];

        if (title) {
          lines.push(`\n${title}\n`);
        }

        const maxValue = Math.max(...data, 1);
        const barWidth = 3;

        // Chart rows
        for (let row = 0; row < height; row++) {
          const threshold = maxValue * (1 - row / height);
          let line = threshold.toFixed(0).padStart(6) + " │ ";

          for (const value of data) {
            const filled = value >= threshold;
            line += filled ? "█".repeat(barWidth) : " ".repeat(barWidth);
          }

          lines.push(line);
        }

        // X-axis
        lines.push("       └" + "─".repeat(data.length * barWidth));

        // Labels
        let labelLine = "        ";
        for (const value of data) {
          labelLine += value.toString().padEnd(barWidth);
        }
        lines.push(labelLine);

        // Print the chart
        console.log(lines.join("\n"));
        console.log("\n" + "=".repeat(60));
        console.log("✅ Chart rendered successfully");
        console.log("=".repeat(60) + "\n");
      } catch (renderError) {
        console.error("❌ Render error:", renderError);
        console.error("Stack:", renderError.stack);
      }
    } else {
      console.log("⚠️ No element in result to render");
      console.log("=".repeat(60) + "\n");
    }
    },
  },
});

// Debug: Check what skills are registered
console.log("\n🔍 Registered skills:");
if (agent.skills) {
  for (const skill of agent.skills) {
    console.log(`  - ${skill.name}: ${skill.description || '(no description)'}`);
  }
}

// Debug: Check if hooks are set (hooks are stored in agent.hooks object, not as direct properties)
console.log("\n🔍 Hooks configured:");
console.log(`  - agent.hooks exists: ${!!agent.hooks}`);
if (agent.hooks) {
  console.log(`  - agent.hooks type: ${Array.isArray(agent.hooks) ? 'array' : typeof agent.hooks}`);
  const hooksObj = Array.isArray(agent.hooks) ? agent.hooks[0] : agent.hooks;
  if (hooksObj) {
    console.log(`  - onStart: ${typeof hooksObj.onStart}`);
    console.log(`  - onEnd: ${typeof hooksObj.onEnd}`);
    console.log(`  - onSuccess: ${typeof hooksObj.onSuccess}`);
    console.log(`  - onError: ${typeof hooksObj.onError}`);
    console.log(`  - onSkillStart: ${typeof hooksObj.onSkillStart}`);
    console.log(`  - onSkillEnd: ${typeof hooksObj.onSkillEnd}`);
  }
}

console.log("\n🎨 AIGNE Chart Visualization Demo");
console.log("\nType a message with numbers to visualize:");
console.log('  Example: "Show me a chart of 5, 10, 15, 20"');
console.log('  Example: "Visualize: 3, 7, 2, 9, 5"\n');

// Run the agent
await runWithAIGNE(agent, {
  aigne,
  chatLoopOptions: {
    // No welcome message to avoid triggering an initial agent response
  },
});
