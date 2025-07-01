# Using the Observability

**English** | [中文](observe.zh.md)

Use AIGNE CLI to start the observability service, monitor and analyze AI Agent runtime status in real-time.

## `aigne observe` Command

AIGNE Observability provides a powerful visualization interface to help you monitor Agent data flow.

```bash
aigne observe [options]
```

### Options

* `--host <host>`: Host address to run the observability service (default is "localhost"), use "0.0.0.0" to publicly expose the server
* `--port <port>`: Port to run the observability service (uses PORT environment variable if set, otherwise defaults to 7890)
* `--help`: Display command help

### Basic Usage Examples

Start the observability service:

```bash
aigne observe
```

After successful startup, the command will display the server running address:

```
Running observability server on http://localhost:7890
```

Visit this address in your browser to view the observability interface.

![AIGNE Monitor Screenshot](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

#### Using Custom Port

```bash
aigne observe --port 8080
```

#### Publicly Exposing the Server

```bash
aigne observe --host 0.0.0.0
```

#### Using Environment Variables for Configuration

You can use environment variables to configure the server:

```bash
# Set port
export PORT=8080
aigne observe

# Or set directly in command line
PORT=8080 aigne observe
```

## Running Example Applications

When running example AIGNE applications, you can view Agent data flow and call chains in real-time in the observability.

```bash
# Set OpenAI API key
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Run in one-shot mode
npx -y @aigne/example-chat-bot

# Or add `--chat` parameter to enter interactive chat mode
npx -y @aigne/example-chat-bot --chat
```
