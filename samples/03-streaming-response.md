# Streaming Response

Get real-time streaming responses from AI agents for better user experience.

```typescript
import { AIAgent, AIGNE, isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "Provide detailed explanations",
  inputKey: "message",
});

const stream = await aigne.invoke(
  agent,
  { message: "Explain quantum computing" },
  { streaming: true }
);

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    console.log(chunk.delta.text?.message);
  }
}
```

## Twitter Post #1

⚡ Stop waiting for AI responses! AIGNE streaming = instant feedback

✨ Show progress immediately
😊 Better user experience
⏱️ Handle long responses
🔄 Real-time updates

How important is streaming for your AI app? 🤔

#AIGNE #ArcBlock #Streaming

## Twitter Post #2

This code demonstrates streaming responses from AI agents:

• Enable streaming with { streaming: true }
• Use async iterator to process chunks
• Check for delta chunks with isAgentResponseDelta
• Display content in real-time

Perfect for long AI responses! ⚡

## Twitter Post #3

📚 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #Streaming
