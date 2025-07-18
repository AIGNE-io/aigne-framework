# Custom User Context

In multi-user applications, maintaining independent conversation memory for different users is an important requirement. The AIGNE framework provides a flexible user context mechanism that allows you to create independent session spaces for each user, ensuring that conversation memories between users do not interfere with each other. This guide will introduce how to configure and use custom user context functionality.

## Basic Process

The process of implementing custom user context includes the following key steps:

1. **Configure Session Identifier** - Configure memory storage by defining how to extract session ID from user context through the `getSessionId` function
2. **Pass User Context** - Provide user identification information when invoking Agents

Let's understand the implementation details of each step:

### Configure Agent Memory Session ID

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-custom-user-context-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory({
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  }),
  inputKey: "message",
});
```

**Explanation**:

* **Session Isolation Mechanism**: Define how to extract unique session identifiers from user context through the `getSessionId` function
* **User Identity Extraction**: Get the `userId` field from the `userContext` object as the session ID
* **Storage Separation**: Framework maintains independent conversation records in the same storage file based on different session IDs
* **Flexible Configuration**: You can use other fields (such as `sessionId`, `tenantId`, etc.) as session identifiers based on business requirements

### Invoke Agent with User Context

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-custom-user-context-invoke-agent" exclude_imports
const result = await aigne.invoke(
  agent,
  { message: "My name is John Doe and I like to invest in Bitcoin." },
  {
    userContext: { userId: "user_123" },
  },
);
console.log(result);
// Output: { message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
```

**Explanation**:

* **Context Passing**: Pass the `userContext` object containing user identification through the third parameter
* **Session Binding**: Agent will create or access the corresponding user session based on `userId: "user_123"`
* **Memory Isolation**: This user's conversation records will be stored completely isolated from other users
* **Standard Response**: Agent's response format remains consistent, user context processing is transparent to business logic
* **Persistent Storage**: User's conversation records are persistently saved, allowing continuation of previous conversations when using the same `userId` next time

## Example Code

The following code demonstrates how to create an Agent and extract session ID from user context to implement multi-user isolated memory functionality:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-custom-user-context"
import { DefaultMemory } from '@aigne/default-memory';
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory({
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  }),
  inputKey: "message",
});

const result = await aigne.invoke(
  agent,
  { message: "My name is John Doe and I like to invest in Bitcoin." },
  {
    userContext: { userId: "user_123" },
  },
);
console.log(result);
// Output: { message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
```

## Best Practices

* **Uniqueness Guarantee**: Ensure session IDs are globally unique in your application to avoid session conflicts between different users
* **Security Considerations**: Do not include sensitive information in session IDs; use hashed or encrypted user identifiers
