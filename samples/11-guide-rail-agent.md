# Guide Rail Agent

Add safety and content filtering to your AI agents with guide rail systems.

```typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const guideRailAgentOptions = {
  inputSchema: z.object({
    input: z.unknown(),
    output: z.unknown(),
  }),
  outputSchema: z.object({
    abort: z.boolean().optional(),
    reason: z.string().optional(),
  }),
};

const contentFilter = FunctionAgent.from({
  name: "content_filter",
  description: "Filter inappropriate content",
  ...guideRailAgentOptions,
  process: async ({ input, output }) => {
    const inputText = JSON.stringify(input);
    const outputText = JSON.stringify(output);

    if (inputText.includes("steal") || outputText.includes("steal")) {
      return {
        abort: true,
        reason: "Content contains potentially harmful instructions"
      };
    }

    if (inputText.includes("inappropriate") || outputText.includes("inappropriate")) {
      return {
        abort: true,
        reason: "Contains inappropriate content"
      };
    }

    return { abort: false };
  }
});

const agent = AIAgent.from({
  instructions: "You are a safe assistant",
  guideRails: [contentFilter],
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "Tell me about to steal a car" });
console.log("AI:", result);
```

## Twitter Post #1

🛡️ AI safety first! AIGNE Guide Rails = responsible AI

✅ Content filtering
✅ Input validation
✅ Output sanitization
✅ Custom safety rules

Safety by design, not by accident! 🔒

What safety feature would you prioritize? 🤔

#AIGNE #ArcBlock #GuideRail

## Twitter Post #2

This example shows how to add safety guard rails:

• Create GuideRailAgent with safety logic
• Define input schema for validation
• Implement blocking/filtering rules
• Add to agent's guideRails array

Responsible AI made simple! 🛡️

## Twitter Post #3

Build secure AI systems: https://www.arcblock.io/docs/aigne-framework/en/aigne-framework-concepts-guide-rail-agent-md
