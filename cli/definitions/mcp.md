# Creating MCP Agents - Bridge to the External World

**English** | [中文](mcp.zh.md)

Want to give your AI agent superpowers? MCP (Model Context Protocol) is the master key! Through MCP, your AI can easily connect to file systems, databases, APIs, and various external resources, instantly transforming into a versatile assistant.

## Basic Structure - Two Connection Methods at Your Choice

MCP agents are like bridges, with two ways to build them:

1. **Using Local Commands** - Start services locally:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

When using local commands:

* `type`: Must be set to `mcp`, telling AIGNE this is an MCP agent
* `command`: Base command to run the MCP server
* `args`: Array of arguments passed to the command
  * First element is usually the package name implementing the MCP server
  * Additional parameters can be passed based on specific MCP server requirements

2. **Using URL to Connect to Remote Servers** - Power across networks:

```yaml
type: mcp
url: "http://localhost:3000"
```

When connecting to remote servers:

* `type`: Must be set to `mcp`, identifying this as an MCP agent
* `url`: URL of the remote MCP server to connect to, can be local or remote

## How MCP Agents Work - How the Magic Happens

MCP agents act like translators, helping AI communicate with the external world. These MCP servers are like specialized assistants that can provide:

1. **Tools**: Executable functions that can be called by AI, giving AI "hands-on" capabilities
2. **Resources**: Data sources accessible by AI, providing rich knowledge bases
3. **Resource Templates**: Patterns for dynamically generating resources, allowing AI to flexibly adapt to different scenarios

When an MCP agent initializes, the AIGNE framework orchestrates everything like a director:

1. Start the MCP server using the provided command and arguments
2. Connect to the server and discover available tools and resources
3. Make these tools and resources available to AI through standardized interfaces

## Popular MCP Servers - Ready-to-Use Superpower Packages

Curated popular MCP servers, ready out of the box:

1. **File System Server** - Make AI a file management expert:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

2. **SQLite Database Server** - AI becomes a data analyst in seconds:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-sqlite", "database.db"]
```

3. **GitHub Server** - Intelligent assistant for code repositories:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-github"]
```

***

**Excellent!** You've mastered the secrets of creating MCP agents. Now your AI is no longer an island, but can:

✅ Be an intelligent butler that can read and write files
✅ Become a data expert capable of operating databases
✅ Act as a universal interface connecting various APIs
✅ Seamlessly collaborate with any MCP server

**Next Step:** Try connecting to the external services you need most, and let AI become your capable assistant!

**Learn More:** [MCP Official Documentation](https://modelcontextprotocol.io)
