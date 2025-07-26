# Agent with Multiple Models

Use different AI models for different tasks - fast models for quick responses, powerful models for complex analysis.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AnthropicChatModel } from "@aigne/anthropic";

const fastAigne = new AIGNE({
  model: new OpenAIChatModel({ model: "gpt-4o-mini" }),
});

const strongAigne = new AIGNE({
  model: new AnthropicChatModel({ model: "claude-3-5-sonnet-20241022" }),
});

const quickAgent = AIAgent.from({
  instructions: "Provide quick responses",
  inputKey: "message",
});

const detailedAgent = AIAgent.from({
  instructions: "Provide detailed analysis",
  inputKey: "message",
});

const quickResult = await fastAigne.invoke(quickAgent, { message: "What is AI?" });
const detailedResult = await strongAigne.invoke(detailedAgent, { message: "Explain machine learning in detail" });
```

## Twitter Post #1

🎯 Smart model selection with AIGNE!

Use the right model for the job:
⚡ GPT-4o-mini for quick tasks
🧠 Claude Sonnet for deep analysis
💰 Optimize cost & performance

Strategic AI deployment made simple! 🚀

Which model combo works best for you? 🤔

#AIGNE #ArcBlock #MultiModel

## Twitter Post #2

This example shows strategic model selection:

• Use fast models for quick responses
• Use powerful models for complex analysis
• Create different AIGNE instances
• Optimize cost and performance

Right model for every job! 🎯

## Twitter Post #3

Star our repo on GitHub: https://github.com/aigne-io/aigne-framework
