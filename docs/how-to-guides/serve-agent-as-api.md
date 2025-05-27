# Serving Agents as APIs

[English](./serve-agent-as-api.md) | [中文](./serve-agent-as-api.zh.md)

After creating an Agent, you may want to serve it as a Web API, making it callable by various client applications (such as websites, mobile apps, or desktop software). The AIGNE framework provides a simple way to expose Agents through HTTP interfaces, enabling developers to easily build AI-based service architectures. This guide will introduce how to serve Agents as APIs.

## Basic Process

The process of serving Agents as APIs includes the following steps:

1. **Configure Server Side**
   * **Create Agent** - Set name and functionality (such as memory capabilities)
   * **Create AIGNE Instance** - Register Agent and configure language model
   * **Start HTTP Server** - Create service endpoints and handle requests

2. **Configure Client Side**
   * **Create HTTP Client** - Connect to service endpoints
   * **Invoke Agent Services** - Send requests and handle responses

This architecture allows you to separate AI services from frontend applications, improving system scalability and maintainability.

## Server-Side Implementation

Let's understand the server-side implementation details step by step:

### Create Agent with Name

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service-create-named-agent" exclude_imports
const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
  memory: {
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  },
});
```

**Explanation**:

* **Naming Importance**: The `name` parameter provides a unique identifier for the Agent, especially important in multi-Agent environments
* **Behavior Definition**: `instructions` define the Agent's role and behavioral guidelines
* **State Persistence**: `memory` configuration enables conversation memory functionality, allowing the Agent to:
  * Maintain contextual coherence across multiple API calls
  * Reference information mentioned in previous conversations
  * Build continuous user interaction experiences
* **Configuration Flexibility**: Additional configuration options can be added as needed, such as skills, tools, etc.

### Create AIGNE Instance and Register Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});
```

**Explanation**:

* **Multi-Agent Management**: The `agents` array parameter allows registering multiple Agents to the same service
* **Service Uniformity**: All registered Agents share the same language model, simplifying resource management
* **Scalability**: New Agents can be easily added to existing services without architectural refactoring
* **Model Configuration**: Uses default OpenAI model here, but different models and parameters can be configured as needed

### Create HTTP Server

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service-create-http-server" exclude_imports
const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  const userId = "user_123"; // Example user ID, replace with actual logic to get user ID, such as `req.user.id` in a real application
  await server.invoke(req, res, { userContext: { userId } });
});

const port = 3000;

const httpServer = app.listen(port);
```

**Explanation**:

* **Server Creation**: `AIGNEHTTPServer` encapsulates the logic for handling Agent requests
* **Framework Integration**: Seamlessly integrates with the popular Express framework, facilitating middleware and other route additions
* **Request Processing Flow**:
  * Receives POST requests to `/api/chat` endpoint
  * `server.invoke` method automatically:
    * Parses Agent name and message content from request body
    * Routes requests to correct Agent instances
    * Handles asynchronous responses
    * Formats and returns results
* **Deployment Flexibility**: Server port, paths, and other parameters can be configured as needed

### Complete Server-Side Example

The following example shows how to create an API server to provide Agent services:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";

const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
  memory: {
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  },
});

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});

const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  const userId = "user_123"; // Example user ID, replace with actual logic to get user ID, such as `req.user.id` in a real application
  await server.invoke(req, res, { userContext: { userId } });
});

const port = 3000;

const httpServer = app.listen(port);
```

## Client-Side Implementation

Let's understand the client-side implementation details step by step:

### Create HTTP Client

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-aigne-http-client-create-client" exclude_imports
const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});
```

**Explanation**:

* **Client Configuration**: `AIGNEHTTPClient` encapsulates all logic for communicating with the server
* **Connection Setup**: `url` parameter specifies the server endpoint address
* **Flexibility**: Can connect to locally or remotely deployed Agent services
* **Network Abstraction**: Hides the complexity of HTTP communication, providing a clean API interface

### Invoke Agent Services

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-aigne-http-client-invoke-agent" exclude_imports
const result = await client.invoke(
  "chatbot",
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```

**Explanation**:

* **Invocation Method**: `client.invoke` method provides an interface almost identical to local Agent invocation
* **Parameter Parsing**:
  * First parameter `"chatbot"` is the target Agent's name
  * Second parameter is the message content sent to the Agent
* **Asynchronous Processing**: Returns Promise, requiring `await` to wait for response
* **Response Format**: Returns standard format response object, consistent with direct Agent invocation results
* **Transparent Invocation**: Client applications don't need to understand underlying AI model or service implementation details

### Complete Client-Side Example

The following example shows how to create an API client to invoke Agent services:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-aigne-http-client-usage"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});

const result = await client.invoke(
  "chatbot",
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```
