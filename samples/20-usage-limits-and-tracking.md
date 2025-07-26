# Usage Limits and Resource Tracking

Control costs and monitor resource consumption with built-in usage tracking and limits.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  limits: {
    maxAgentInvokes: 10,    // Limit agent calls per session
    maxDuration: 30000,     // 30 second timeout
    maxTokens: 1000,        // Token usage limit
  },
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
  inputKey: "message",
  hooks: {
    onEnd: async ({ context }) => {
      const { usage } = context;
      console.log("📊 Usage Stats:", {
        agentCalls: usage.agentCalls,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalCost: usage.totalCost,
        duration: usage.duration,
      });

      // Alert when approaching limits
      if (usage.agentCalls >= 8) {
        console.warn("⚠️ Approaching agent call limit!");
      }
    }
  }
});

try {
  const result = await aigne.invoke(agent, {
    message: "What are the benefits of renewable energy?"
  });

  // Access usage information
  console.log("Current usage:", aigne.usage);

} catch (error) {
  if (error.message.includes("Exceeded max")) {
    console.error("💸 Usage limit exceeded:", error.message);
  }
}
```

## Twitter Post #1

💰 Smart cost control with AIGNE!

Built-in resource management:
📊 Token usage tracking
🔢 Agent call limits
⏰ Timeout protection
💸 Cost monitoring

Never exceed your AI budget again! Perfect for production deployments. 🚀

What's your biggest AI cost concern? 🤔

#AIGNE #ArcBlock #Tracking

## Twitter Post #2

This example shows usage limits and tracking:

• Configure limits in AIGNE initialization
• Use hooks to monitor resource usage
• Track tokens, calls, duration, and cost
• Automatic protection against overuse

Production-ready cost control! 💰

## Twitter Post #3

🤝 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #Tracking
