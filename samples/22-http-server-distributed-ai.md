# HTTP Server for Distributed AI

Deploy AI agents as web services with built-in streaming and multi-framework support.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPServer } from "@aigne/transport/http-server";
import express from "express";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

// Create distributed AI agents
const chatAgent = AIAgent.from({
  name: "chat",
  instructions: "You are a helpful chatbot",
  inputKey: "message",
});

const summaryAgent = AIAgent.from({
  name: "summarizer",
  instructions: "Summarize the given text concisely",
  inputKey: "text",
});

// Setup HTTP server with multiple agents
const aigneServer = new AIGNEHTTPServer({
  context: aigne,
  agents: { chat: chatAgent, summarizer: summaryAgent },
});

// Express.js integration
const app = express();
app.use(express.json());

// Standard HTTP endpoint
app.post("/ai/:agentName", async (req, res) => {
  await aigneServer.invoke(req, res);
});

// Streaming endpoint
app.post("/ai/:agentName/stream", async (req, res) => {
  await aigneServer.invoke(req, res, { streaming: true });
});

app.listen(3000, () => {
  console.log("🚀 AI Server running on http://localhost:3000");
  console.log("📡 Endpoints:");
  console.log("  POST /ai/chat - Chat agent");
  console.log("  POST /ai/summarizer - Summary agent");
  console.log("  Add /stream for real-time responses");
});

// Usage examples:
// curl -X POST http://localhost:3000/ai/chat \
//   -H "Content-Type: application/json" \
//   -d '{"message": "Hello!"}'
```

## Twitter Post #1

🌐 Turn AI agents into web services with AIGNE!

HTTP Server features:
🤖 Multi-agent deployment
📡 Real-time streaming
🔧 Express/Hono/vanilla support
🛡️ Auto error handling

From local agents to distributed microservices in minutes! 🚀

What services would you deploy? 🤔

#AIGNE #ArcBlock #HTTP

## Twitter Post #2

This example shows HTTP server for distributed AI:

• Use AIGNEHTTPServer with multiple agents
• Express.js integration for web services
• Support for streaming responses
• Deploy AI agents as REST APIs

Local agents to web services! 🌐

## Twitter Post #3

📖 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #HTTP
