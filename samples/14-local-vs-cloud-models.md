# Local vs Cloud AI Models

Choose between privacy-first local deployment and powerful cloud models based on your needs.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { OllamaChatModel } from "@aigne/ollama";

// Privacy-first local deployment (offline, no data sent externally)
const localAigne = new AIGNE({
  model: new OllamaChatModel({
    baseURL: "http://localhost:11434",
    model: "llama3", // Runs entirely on your machine
  }),
});

// Cloud-powered enterprise solution
const cloudAigne = new AIGNE({
  model: new OpenAIChatModel({
    model: "gpt-4o", // Latest cloud AI capabilities
  }),
});

const agent = AIAgent.from({
  instructions: "You are a coding assistant",
  inputKey: "message",
});

// Local processing - completely private
const localResult = await localAigne.invoke(agent, {
  message: "Review this sensitive code"
});

// Cloud processing - maximum performance
const cloudResult = await cloudAigne.invoke(agent, {
  message: "Generate a complex algorithm"
});
```

## Twitter Post #1

🏠 Privacy vs ☁️ Power with AIGNE!

Local Ollama:
🔒 100% private & offline
💰 No API costs
🛡️ Full data control

Cloud OpenAI:
🚀 Latest AI capabilities
⚡ Unlimited scale
📊 Best performance

One codebase, flexible deployment! 🚀

#AIGNE #ArcBlock #LocalAI

## Twitter Post #2

This example shows local vs cloud model deployment:

• Use OllamaChatModel for local privacy
• Use OpenAIChatModel for cloud power
• Identical code for both approaches
• Choose based on your needs

Which approach fits your needs better? 🤔

## Twitter Post #3

Checkout our repo: https://github.com/aigne-io/aigne-framework
