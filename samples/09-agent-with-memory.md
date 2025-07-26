# Agent with Memory

Create AI agents that remember previous conversations and maintain context across sessions.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant that remembers our conversation history",
  memory: new DefaultMemory({
    storage: { url: "file:memory.db" }
  }),
  inputKey: "message",
});

// First conversation - establishing preferences
let result = await aigne.invoke(agent, {
  message: "Remember that I like coffee and prefer dark roast"
});
console.log("AI:", result.message);

// Second conversation - agent remembers previous context
result = await aigne.invoke(agent, {
  message: "What drink would you recommend for me?"
});
console.log("AI:", result.message);

// Third conversation - building on memory
result = await aigne.invoke(agent, {
  message: "I'm feeling tired today, any suggestions?"
});
console.log("AI:", result.message);
```

## Twitter Post #1

🧠 Build AI that remembers! AIGNE memory agents learn from every conversation!

✅ Persistent memory storage
✅ Context across sessions
✅ Real conversation flow
✅ SQLite powered

Tell it once, it remembers forever! 🚀

#AIGNE #ArcBlock #Memory

## Twitter Post #2

This example shows a complete memory conversation:

• First chat: Agent learns your preferences
• Second chat: Makes recommendations based on memory
• Third chat: Builds on previous context
• All stored in SQLite database

True conversational AI! 💬

## Twitter Post #3

Star our GitHub repo: https://github.com/aigne-io/aigne-framework
