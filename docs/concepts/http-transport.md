# HTTP Transport

## Overview

HTTP Transport is an important component in the AIGNE framework that allows developers to expose AI agents as API services through the HTTP protocol and remotely invoke these agents through clients. This mechanism enables AIGNE agents to be easily integrated into various applications, whether Web applications, mobile applications, or other services. HTTP Transport consists of two main parts: AIGNEHTTPServer and AIGNEHTTPClient, which are responsible for server-side and client-side functionality implementation respectively. Through HTTP Transport, developers can build distributed AI application architectures, providing AI capabilities as microservices for multiple clients to use.

## Server Side: AIGNEHTTPServer

AIGNEHTTPServer allows developers to expose AIGNE instances and their agents through HTTP interfaces. It can integrate with common Node.js Web frameworks (such as Express) to provide standard RESTful API interfaces.

### Creating Agents and AIGNE Instance

First, we need to create a named agent and AIGNE instance:

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-transport-create-named-agent"
import { AIAgent } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory";

const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
  memory: new DefaultMemory(),
  inputKey: "message",
});
```

In the above example, we created an AIAgent named "chatbot", set basic instructions, and enabled memory functionality.

Next, we create an AIGNE instance and add the agent to the instance:

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-transport-create-aigne"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});
```

In this example, we created an AIGNE instance, specified OpenAIChatModel as the language model, and added the previously created agent to the instance.

### Creating HTTP Server

With the AIGNE instance, we can create an HTTP server to expose the agent's functionality:

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-transport-create-http-server"
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";

const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  const userId = "user_123"; // Example user ID, replace with actual logic to get user ID
  await server.invoke(req, res, { userContext: { userId } });
});

const port = 3000;

const httpServer = app.listen(port);
```

In this example, we:

1. Created an AIGNEHTTPServer instance, passing in the AIGNE instance
2. Created an Express application
3. Defined a POST route "/api/chat", using the server.invoke method to handle requests
4. Detected available port and started the HTTP server

This way, our AI agent can be accessed through HTTP interfaces. Clients can send POST requests to the "/api/chat" endpoint, specifying the agent name to invoke and input messages.

## Client Side: AIGNEHTTPClient

AIGNEHTTPClient provides a simple client interface for remotely invoking agents exposed through AIGNEHTTPServer. It encapsulates the details of HTTP requests, allowing developers to invoke remote agents as if they were local agents.

### Creating HTTP Client

To create an HTTP client, we need to specify the server's URL:

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-client-create-client"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});
```

In this example, we created an AIGNEHTTPClient instance, specifying the server's URL.

### Invoking Remote Agents

After creating the client, we can use the invoke method to call remote agents:

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-client-invoke-agent"
const result = await client.invoke("chatbot", {
  message: "What is the crypto price of ABT/USD on coinbase?",
});
console.log(result);
// Output: { message: "The current price of ABT/USD on Coinbase is $0.9684." }
```

In this example, we:

1. Invoked the remote agent named "chatbot"
2. Sent a question as input
3. Received and printed the agent's response

The client's invoke method accepts two parameters: agent name and input message. It sends these parameters to the server, the server invokes the corresponding agent to process the request, and then returns the result to the client.

## Use Cases

HTTP Transport is suitable for various scenarios, including:

1. **Microservice Architecture**: Deploy AI agents as independent microservices for use by multiple applications
2. **Frontend-Backend Separation**: Deploy AI agents on the backend, with frontend calling agent functionality through HTTP
3. **Cross-Platform Integration**: Allow applications on different platforms (Web, mobile, desktop, etc.) to access the same AI capabilities
4. **Load Balancing**: Deploy multiple AI agent service instances, distributing requests through load balancers
5. **API Gateway**: Integrate AI agents into API gateways to provide unified access points

## Summary

HTTP Transport is the bridge connecting server-side and client-side in the AIGNE framework, providing:

1. **Server-side Component AIGNEHTTPServer**: Expose AIGNE agents as HTTP services
2. **Client-side Component AIGNEHTTPClient**: Provide simple interfaces for invoking remote agents
3. **Flexible Integration**: Seamless integration with Web frameworks like Express
4. **Standard Interface**: Use standard HTTP protocol for easy cross-platform and cross-language integration

Through HTTP Transport, developers can build distributed AI application architectures, providing AI capabilities as services for multiple clients to use, achieving more flexible and scalable application designs.
