# Agent Hooks for Observability

Monitor and trace AI agent execution with comprehensive lifecycle hooks for production systems.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
  inputKey: "message",
  hooks: {
    onStart: async ({ context, input }) => {
      console.log("🚀 Agent started", { input, timestamp: new Date() });
      // Transform input if needed
      return { input: { ...input, startTime: Date.now() } };
    },
    onEnd: async ({ context, input, output, error }) => {
      if (error) {
        console.error("❌ Agent failed", { error: error.message });
      } else {
        console.log("✅ Agent completed", {
          duration: Date.now() - input.startTime,
          output
        });
      }
    },
    onSkillStart: async ({ context, skill, input }) => {
      console.log("🔧 Using skill", { skill: skill.name, input });
    },
    onSkillEnd: async ({ context, skill, input, output, error }) => {
      console.log("🏁 Skill completed", {
        skill: skill.name,
        success: !error
      });
    }
  }
});

const result = await aigne.invoke(agent, { message: "Hello!" });
```

## Twitter Post #1

🔍 Production-ready AI with AIGNE hooks!

Monitor everything:
📊 Agent lifecycle events ⏱️ Performance metrics 🔧 Skill usage tracking 🛡️ Error handling

Perfect for debugging, monitoring, and optimizing AI workflows in production!

#AIGNE #ArcBlock #Observability

## Twitter Post #2

This example shows comprehensive agent monitoring:

• Hook into onStart, onEnd, onSkillStart, onSkillEnd
• Track performance metrics and errors
• Transform input/output as needed
• Perfect for production debugging

Production-ready AI monitoring! 🔍

## Twitter Post #3

🚀 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #Observability
