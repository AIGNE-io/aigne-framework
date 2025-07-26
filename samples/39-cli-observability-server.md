# CLI Observability Server

Monitor and debug your AI agents with built-in observability tools.

```bash
# Start observability server on default port 7890
aigne observe

# Start on custom port
aigne observe --port 3000

# Expose server publicly for team access
aigne observe --host 0.0.0.0 --port 7890

# Run observability alongside your agents
# Terminal 1: Start observability
aigne observe --port 7890

# Terminal 2: Run agents with monitoring
export AIGNE_OBSERVABILITY_URL=http://localhost:7890
aigne run --chat --model openai:gpt-4o

# Production monitoring setup
aigne observe --host 0.0.0.0 --port 7890 &
OBSERVE_PID=$!
aigne serve-mcp --port 3000
kill $OBSERVE_PID
```

## Twitter Post #1

📊 Real-time AI monitoring with AIGNE CLI!

🔍 Request/response tracking 📈 Performance metrics 🐛 Debug 🌐 Dashboard

Keep your AI apps running smoothly!

#AIGNE #ArcBlock #CLI

## Twitter Post #2

This example shows CLI observability server:

• Use aigne observe command to start monitoring
• Track requests, responses, and performance
• Web dashboard for real-time insights
• Perfect for production monitoring

Real-time AI monitoring! 📊

## Twitter Post #3

🚀 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #CLI
