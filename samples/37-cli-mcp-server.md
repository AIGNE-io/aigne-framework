# CLI MCP Server

Transform your AIGNE agents into MCP (Model Context Protocol) servers for integration with other tools.

```bash
# Start MCP server on default port 3000
aigne serve-mcp

# Start on custom port
aigne serve-mcp --port 8080

# Serve agents from specific directory
aigne serve-mcp --path ./my-agents --port 3001

# Expose server publicly (be careful with security)
aigne serve-mcp --host 0.0.0.0 --port 3000

# Serve with custom pathname
aigne serve-mcp --pathname /api/mcp --port 3000

# Full configuration example
aigne serve-mcp \
  --path ./production-agents \
  --host 0.0.0.0 \
  --port 8080 \
  --pathname /mcp/v1
```

## Twitter Post #1

🔗 Bridge your AI agents with MCP protocol using AIGNE CLI!

Transform agents into services:
🌐 HTTP server endpoints 🔌 MCP protocol support 🎯 Tool integration ready ⚡ One-command deployment

Connect AIGNE to Claude Desktop, IDEs, and more!

#AIGNE #ArcBlock #CLI

## Twitter Post #2

This example shows MCP server deployment:

• Use serve-mcp command to start server
• Customize port and host settings
• Transform agents into MCP services
• Perfect for tool integration

MCP protocol made simple! 🔗

## Twitter Post #3

🤝 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #CLI
