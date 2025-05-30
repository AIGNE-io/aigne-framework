# Creating MCP Agents

**English** | [中文](mcp.zh.md)

Want to give your AI Agent more powerful capabilities? MCP (Model Context Protocol) is a standard protocol for connecting external resources. Through MCP, your AI can access file systems, databases, APIs, and various external resources, becoming a feature-rich intelligent assistant.

## Basic Structure

MCP agents provide two connection methods:

1. **Using Local Commands** - Start local MCP services:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

When using local commands:

* `type`: Must be set to `mcp`, specifying this is an MCP agent
* `command`: Base command to run the MCP server
* `args`: Array of arguments passed to the command
  * First element is usually the package name implementing the MCP server
  * Additional parameters can be passed based on specific MCP server requirements

2. **Using URL to Connect to Remote Servers**:

```yaml
type: mcp
url: "http://localhost:3000"
```

When connecting to remote servers:

* `type`: Must be set to `mcp`, identifying this as an MCP agent
* `url`: URL of the remote MCP server to connect to, can be local or remote

## How It Works

MCP agents act as a bridge between AI and the external world, helping AI access various external resources. MCP servers can provide:

1. **Tools**: Executable functions that can be called by AI, extending AI's operational capabilities
2. **Resources**: Data sources accessible by AI, providing rich information
3. **Resource Templates**: Patterns for dynamically generating resources, supporting flexible resource access

When an MCP agent initializes, the AIGNE framework performs the following steps:

1. Start the MCP server using the provided command and arguments
2. Connect to the server and discover available tools and resources
3. Make these tools and resources available to AI through standardized interfaces

## Popular MCP Servers

Here are some commonly used MCP server examples:

1. **File System Server** - Provides file operation capabilities:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

2. **SQLite Database Server** - Provides database operation capabilities:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-sqlite", "database.db"]
```

3. **GitHub Server** - Provides GitHub repository access capabilities:

```yaml
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-github"]
```

***

Now you understand how to create MCP agents. Through MCP agents, your AI has:

* File system access and operation capabilities
* Database query and management functions
* Various external API connection capabilities
* Collaboration capabilities with standard MCP servers

**Next Step:** Choose the appropriate MCP server according to your needs to expand AI's functional scope.

**Reference:** [MCP Official Documentation](https://modelcontextprotocol.io)
