# Agent with File System Memory

Store and retrieve agent memories from the file system for persistent knowledge.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { FSMemory } from "@aigne/agent-library/fs-memory";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "You remember conversations from files",
  memory: new FSMemory({ rootDir: "./memories" }),
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "What do you remember about me?" });
```

## Twitter Post #1

📁 File-based memory with AIGNE!

Store AI memories as files:
📝 Easy to browse & edit
🔄 Version control friendly
👀 Human-readable format
💾 Backup & sync simple

Perfect for knowledge bases! 🧠

What would you store in AI memory? 🤔

#AIGNE #ArcBlock #Memory

## Twitter Post #2

This example shows file system memory storage:

• Import FSMemory from agent-library
• Configure rootDir for memory storage
• Memories saved as readable files
• Easy backup and version control

Human-readable AI memory! 📁

## Twitter Post #3

🤝 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #Memory
