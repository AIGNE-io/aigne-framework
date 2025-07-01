# Serve as MCP Server

**English** | [中文](serve-mcp.zh.md)

Use AIGNE CLI to deploy agents as services.

## `aigne serve-mcp` Command

Serve agents in the specified directory as a Model Context Protocol (MCP) server.

```bash
aigne serve-mcp [options]
```

### Options

* `--path <path>`: Path to the agent directory (defaults to current directory `.`)
* `--host <host>`: Host address to run the MCP server on (defaults to "localhost"), use "0.0.0.0" to expose the server publicly
* `--port <port>`: Port to run the MCP server on (uses PORT environment variable if set, otherwise defaults to 3000)
* `--pathname <pathname>`: URL path for the MCP server endpoint (defaults to "/mcp")
* `--help`: Show command help

### Basic Usage Examples

#### Serve MCP service on default port

```bash
aigne serve-mcp
```

After successful startup, the command will display the server running address:

```
MCP server is running on http://localhost:3000/mcp
```

#### Serve in specific directory

```bash
aigne serve-mcp --path ./my-agents
```

#### Use custom port

```bash
aigne serve-mcp --path ./my-agents --port 8080
```

#### Expose server publicly

```bash
aigne serve-mcp --host 0.0.0.0
```

#### Use custom endpoint path

```bash
aigne serve-mcp --pathname /api/agents
```

### Advanced Configuration Examples

#### Complete custom configuration

```bash
aigne serve-mcp --path ./my-agents --host 0.0.0.0 --port 8080 --pathname /api/agents
```

This will serve the MCP service at `http://0.0.0.0:8080/api/agents`.

### Environment Variables

You can use environment variables to configure the server:

```bash
# Set port
export PORT=8080
aigne serve-mcp

# Or set directly in command line
PORT=8080 aigne serve-mcp
```

### MCP Server

Model Context Protocol (MCP) is a standard protocol that allows AI models to interact with external tools and data sources. By serving your AIGNE agents as an MCP server, you can:

1. **Integrate into other applications**: Allow other applications to use your agents through the MCP protocol
2. **Provide API access**: Offer a standardized API interface for your agents
3. **Extend functionality**: Allow multiple clients to access your agent services simultaneously

### Deployment Considerations

1. **Security**: Ensure appropriate security measures when deploying in production environments
2. **Performance**: Adjust server configuration based on expected load
3. **Monitoring**: Implement proper logging and monitoring
4. **Network configuration**: Ensure firewall and network settings allow required connections
