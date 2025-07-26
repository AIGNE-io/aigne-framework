# MCP (Model Context Protocol) Agent

Connect AI agents to external systems using the Model Context Protocol standard.

```typescript
import { MCPAgent } from "@aigne/core";
import { join } from "node:path";

// Create MCP agent with SQLite server
const mcpAgent = await MCPAgent.from({
  command: "uvx",
  args: ["-q", "mcp-server-sqlite", "--db-path", join(process.cwd(), "example.db")],
  env: {}
});

console.log("Available skills:", mcpAgent.skills.map(s => s.name));
console.log("Available prompts:", mcpAgent.prompts.map(p => p.name));

// Alternative: Filesystem MCP server
// const mcpAgent = await MCPAgent.from({
//   command: "npx",
//   args: ["-y", "@modelcontextprotocol/server-filesystem"],
//   env: { FILESYSTEM_ROOT: process.cwd() }
// });
```

## Twitter Post #1

🔌 Connect AI to everything with AIGNE's MCP support!

Model Context Protocol enables:
📁 File system • 🗄️ Database • 🌐 API • 🛠️ Custom tools

Standard protocol, infinite possibilities! ✨

What external system would you connect first? 🤔

#AIGNE #ArcBlock #MCP

## Twitter Post #2

This example shows how to create an MCP agent:

• Use MCPAgent.from() with command and args
• Connect to MCP servers (filesystem, database, etc.)
• Set environment variables for configuration
• Standard protocol for external integrations

Connect AI to everything! 🔌

## Twitter Post #3

Connect AI to external systems: https://www.arcblock.io/docs/aigne-framework/en/aigne-framework-concepts-mcp-agent-md
