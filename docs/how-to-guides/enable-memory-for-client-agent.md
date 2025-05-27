# Enable Memory for Client Agent

[English](./enable-memory-for-client-agent.md) | [中文](./enable-memory-for-client-agent.zh.md)

Client Agent memory functionality is an important feature of the AIGNE framework that allows storing and managing conversation history locally on the client side. **The biggest advantage is privacy protection** - all memory data is stored locally on the client and never sent to the server.

## Privacy Protection Features

Unlike traditional server-side memory, client-side memory offers the following privacy protection advantages:

* **Local Storage**: All conversation memory is stored in the client's local database
* **No Data Upload**: Memory data is never sent to remote servers
* **User Control**: Users have complete control over their memory data and can delete or backup at any time
* **Privacy Security**: Sensitive conversation content never leaves the user's device

## Basic Process

### Create Server-side Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-create-agent"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
});

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});
```

**Explanation**: Create a basic AI Agent. Note that this Agent **does not configure memory functionality** because memory will be configured on the client side.

### Start HTTP Server

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-create-server"
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";

const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  await server.invoke(req, res);
});

const port = 3000;

const httpServer = app.listen(port);
```

**Explanation**: Start the HTTP server to provide Agent invocation interface for clients. The server side does not need to configure any memory-related settings.

### Create Client Connection

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-create-client"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});
```

**Explanation**: Create an HTTP client to connect to the remote AIGNE server.

### Configure Client Memory and Conduct Conversation

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-invoke-agent" exclude_imports
const chatbot = await client.getAgent({
  name: "chatbot",
  memory: {
    storage: {
      url: "file:memories.sqlite3",
    },
  },
});
const result = await chatbot.invoke(
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```

**Explanation**:

* Get the client Agent instance through `client.getAgent()`
* Specify the local storage path `file:memories.sqlite3` in the `memory` configuration
* Memory data will be stored in a local SQLite database on the client
* Conduct the first conversation round, and the Agent will remember this interaction

### Test Memory Capability

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-invoke-agent-1" exclude_imports
const result1 = await chatbot.invoke("What question did I just ask?");
console.log(result1);
// Output: { $message: "You just asked about the crypto price of ABT/USD on Coinbase." }
```

**Explanation**: The Agent can remember previous conversation content, proving that the memory functionality is working properly. Importantly, this memory data is stored entirely locally on the client.

## How Memory Functionality Works

Client-side memory functionality achieves conversation coherence and privacy protection through the following mechanisms:

### Local Storage Mechanism

* **SQLite Database**: Uses a local SQLite database to store conversation memory
* **File System**: Memory files are stored in the client-specified local path
* **Session Isolation**: Memory data from different sessions are isolated from each other

### Memory Retrieval and Recording

* **Retrieval Phase**: Before sending requests, the client retrieves relevant memory from the local database
* **Context Construction**: The retrieved memory is sent to the server as context
* **Recording Phase**: After receiving responses, the client records new conversation content to the local database

Client-side memory functionality provides users with a solution that maintains conversation coherence while completely protecting privacy, representing an important innovation in privacy protection for the AIGNE framework.
