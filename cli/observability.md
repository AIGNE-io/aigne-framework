# Service Deployment

**English** | [中文](observability.zh.md)

Use the AIGNE CLI to start the observability service.

## `aigne observe` Command

When using the aigne CLI, agent data flow is monitored. By running aigne observe, you can start a service to view the data flow.

```bash
aigne observe [options]
```

### Options

* host <host>: Host address to run the observability server on (defaults to "localhost"); use "0.0.0.0" to expose the server publicly
* port <port>: Port to run the observability server on (uses the PORT environment variable if set, otherwise defaults to 7890)
* help: Show command help

### Basic Usage Examples

```bash
aigne observe
```

After successful startup, the command will display the server running address:

```
Running observability server on http://localhost:7890
```

#### Use custom port

```bash
aigne observe --port 8080
```

#### Expose server publicly

```bash
aigne observe --host 0.0.0.0
```

### Environment Variables

You can use environment variables to configure the server:

```bash
# Set port
export PORT=8080
aigne observe

# Or set directly in the command line
PORT=8080 aigne observe
```
