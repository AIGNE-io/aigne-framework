# serve-mcp

The `aigne serve-mcp` command transforms your local AI agent into a running service that other applications can connect to and interact with. It starts a local web server that exposes your agent's capabilities over the network using the standard Model Context Protocol (MCP), making it easy to integrate into larger systems.

This is useful when you want another application, like a website or a backend service, to be able to communicate with your agent.

## Usage

To start the server for the agent in your current project folder, simply run the command:

```bash Basic Usage icon=lucide:terminal
aigne serve-mcp
```

By default, this will start a server at `http://localhost:3000/mcp`.

## Options

The `serve-mcp` command provides several options to customize its behavior.

<x-field-group>
  <x-field data-name="--path" data-type="string" data-default=".">
    <x-field-desc markdown>The file path to your agent's project directory. Defaults to the current directory (`.`). You can also provide a URL to a remote project.</x-field-desc>
  </x-field>
  <x-field data-name="--host" data-type="string" data-default="localhost">
    <x-field-desc markdown>The network host to run the server on. Use `0.0.0.0` to make the server accessible from other computers on your network.</x-field-desc>
  </x-field>
  <x-field data-name="--port" data-type="number" data-default="3000">
    <x-field-desc markdown>The port number for the server to listen on. If the `PORT` environment variable is set, it will be used instead.</x-field-desc>
  </x-field>
  <x-field data-name="--pathname" data-type="string" data-default="/mcp">
    <x-field-desc markdown>The specific URL path where the agent service will be available.</x-field-desc>
  </x-field>
  <x-field data-name="--aigne-hub-url" data-type="string" data-required="false">
    <x-field-desc markdown>A custom URL for the AIGNE Hub service. This is used for fetching remote agent definitions or models if needed.</x-field-desc>
  </x-field>
</x-field-group>

## How It Works

When you run `aigne serve-mcp`, it creates a bridge between the standard web protocol (HTTP) and your agent. Other applications can send requests to this server, which then invokes your agent and streams the results back. This allows your agent to function as a tool within a larger ecosystem.

```d2 How serve-mcp Works icon=lucide:network
direction: down

Client-App: {
  label: "Client Application"
  shape: rectangle
}

MCP-Server: {
  label: "MCP Server\n(aigne serve-mcp)"
  shape: rectangle

  AIGNE-Agent: {
    label: "Your AIGNE Agent"
    shape: rectangle
  }
}

Client-App -> MCP-Server: "1. Sends MCP request (HTTP)"
MCP-Server -> MCP-Server.AIGNE-Agent: "2. Invokes agent as a tool"
MCP-Server.AIGNE-Agent -> MCP-Server: "3. Returns result"
MCP-Server -> Client-App: "4. Streams response back"
```

## Examples

### Serve on a Different Port

If the default port `3000` is already in use, you can specify a different one.

```bash Start on Port 8080 icon=lucide:server
aigne serve-mcp --port 8080
```

### Serve an Agent from a Specific Folder

If your agent's project files are in a different directory, use the `--path` option.

```bash Serve a Specific Project icon=lucide:folder
aigne serve-mcp --path ./my-awesome-agent
```

### Make the Server Accessible on Your Network

To allow other devices on your local network to connect to your agent, use `0.0.0.0` as the host. Be careful, as this may expose the service more widely depending on your network configuration.

```bash Expose Server on Network icon=lucide:wifi
aigne serve-mcp --host 0.0.0.0
```

After running this, the console will display the server URL, which you can use to interact with your agent from other applications.