# Real-Time Progress Streaming

Track AI agent execution with live progress updates and streaming responses.

```typescript
import { AIAgent, AIGNE, isAgentResponseDelta, isAgentResponseProgress } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

// Agent with detailed progress tracking
const researchAgent = AIAgent.from({
  name: "researcher",
  instructions: "Research the topic thoroughly and provide detailed analysis",
  inputKey: "topic",

  hooks: {
    onStart: async ({ input }) => {
      console.log("🔍 Research started for:", input.topic);
    },

    onSkillStart: async ({ skill, input }) => {
      console.log("⚙️ Using skill:", skill.name);
    },

    onSkillEnd: async ({ skill, output, error }) => {
      if (error) {
        console.log("❌ Skill failed:", skill.name);
      } else {
        console.log("✅ Skill completed:", skill.name);
      }
    }
  }
});

// Stream with full progress tracking
async function streamWithProgress(topic: string) {
  const stream = await aigne.invoke(
    researchAgent,
    { topic },
    { streaming: true }
  );

  let fullResponse = "";

  for await (const chunk of stream) {
    if (isAgentResponseProgress(chunk)) {
      // Real-time progress updates
      const { progress } = chunk;

      switch (progress.event) {
        case "agentStarted":
          console.log("🚀 Agent execution started");
          break;

        case "agentSucceed":
          console.log("🎉 Agent completed successfully");
          break;

        case "agentFailed":
          console.error("💥 Agent failed:", progress.error.message);
          break;
      }

    } else if (isAgentResponseDelta(chunk)) {
      // Streaming content updates
      const textUpdate = chunk.delta.text?.topic || "";
      fullResponse += textUpdate;

      // Show typing effect in real-time
      process.stdout.write(textUpdate);
    }
  }

  return fullResponse;
}

// Usage with live progress
console.log("Starting research with live updates...");
const result = await streamWithProgress("Impact of renewable energy on global economy");
```

## Twitter Post #1

📡 Real-time AI progress with AIGNE streaming!

Live tracking features:
📊 Execution progress events ⌨️ Typing effect streaming 🔧 Skill usage monitoring 🛡️ Error handling in real-time

Perfect for responsive UX and debugging complex AI workflows!

#AIGNE #ArcBlock #Streaming

## Twitter Post #2

This example shows real-time progress streaming:

• Use isAgentResponseProgress for progress events
• Use isAgentResponseDelta for content updates
• Track agent lifecycle and skill usage
• Perfect for responsive user interfaces

Real-time AI progress made simple! 📡

## Twitter Post #3

📖 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #Streaming
