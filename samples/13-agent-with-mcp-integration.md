# Agent with MCP Integration

Combine AI agents with MCP servers to access external systems and data sources.

```typescript
import { AIAgent, MCPAgent } from "@aigne/core";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";

await runWithAIGNE(
  async () => {
    const filesystemMCP = await MCPAgent.from({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem"],
    });

    const agent = AIAgent.from({
      instructions: "You can access and manage files",
      skills: [filesystemMCP],
      inputKey: "message",
    });

    return agent;
  },
  {
    chatLoopOptions: {
      initialCall: { message: "List files in the current directory" },
    },
  },
);
```

## Twitter Post #1

🚀 AI that actually does things! AIGNE + MCP = superpowers

Give your AI file system access:
📄 Read/write files • 📂 Navigate directories • 💻 Execute commands • 📊 Process data

No more "I can't access files" responses! 🎉

What task would you automate first? 🤔

#AIGNE #ArcBlock #MCP

## Twitter Post #2

This example shows AI agent with MCP integration:

• Create MCP agent for external system access
• Add MCP agent to skills array
• Agent can now interact with file system
• Real automation capabilities unlocked

AI that actually does things! 🚀

## Twitter Post #3

Check out the full framework: https://github.com/aigne-io/aigne-framework
