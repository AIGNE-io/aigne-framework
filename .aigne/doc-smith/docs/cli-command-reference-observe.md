# observe

The `aigne observe` command starts a local web server, providing a visual interface to monitor and debug your agent's activities. This observability server is an essential tool for understanding your agent's behavior, tracking conversations, and diagnosing issues during development.

## Usage

```bash Basic Usage icon=lucide:terminal
aigne observe [options]
```

## Description

When you run `aigne observe`, it launches a web-based dashboard that connects to a local database where agent activity is logged. This allows you to inspect detailed information about each agent interaction, including inputs, outputs, skill executions, and state changes.

The server will output the path to the local observability database and the URL where you can access the dashboard.

## Options

Customize the server's host and port using the following options:

<x-field-group>
  <x-field data-name="--host" data-type="string" data-default="localhost">
    <x-field-desc markdown>The network host to run the server on. Use `0.0.0.0` to expose the server publicly on your network.</x-field-desc>
  </x-field>
  <x-field data-name="--port" data-type="number" data-default="7890">
    <x-field-desc markdown>The port number to run the server on. If the default port is in use, it will automatically find the next available one.</x-field-desc>
  </x-field>
</x-field-group>

## Examples

### Start the server on the default port

To start the observability server with default settings, simply run the command without any options. It will typically be available at `http://localhost:7890`.

```bash Start on Default Port icon=lucide:play
aigne observe
```

After running the command, you'll see output similar to this:

```text Console Output
Observability database path: /path/to/your/project/.aigne/observability.db
Observability server is running at http://localhost:7890
```

### Start the server on a custom port

If the default port is occupied or you prefer to use a different one, you can specify it with the `--port` option.

```bash Start on a Custom Port icon=lucide:play
aigne observe --port 3001
```

This will start the server on port 3001, and you can access it at `http://localhost:3001`.