# Enable Memory for Agent

[English](./enable-memory-for-agent.md) | [中文](./enable-memory-for-agent.zh.md)

In conversational applications, the ability to remember previous conversation content is a very important feature. The AIGNE framework provides a simple way to enable memory capabilities for Agents, allowing them to maintain contextual coherence across multiple conversation rounds. This guide will introduce how to enable and use Agent memory functionality.

## Basic Process

The process of enabling memory for an Agent is very simple:

1. **Create Agent with Memory** - Enable memory functionality through configuration options
2. **Conduct First Conversation** - Provide initial information to the Agent
3. **Test Memory Capability** - Ask about previously provided information
4. **Build Continuous Dialogue** - Add new information and verify cumulative memory

Let's understand the implementation details of each step:

### Create Agent with Memory Functionality

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-enable-memory"
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory({
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
    },
  }),
  inputKey: "message",
});
```

**Explanation**:

* **Persistent Storage**: By configuring `storage.path`, memory data can be persisted to files
* **Zero-Code Management**: Memory storage, retrieval, and context construction are all handled automatically by the framework
* **Underlying Implementation**: The system uses conversation history as context input to the model, achieving the "memory" effect

### First Round of Conversation - Provide Personal Information

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-1" exclude_imports
const result1 = await aigne.invoke(agent, {
  message: "My name is John Doe and I like to invest in Bitcoin.",
});
console.log(result1);
// Output: { message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
```

**Explanation**:

* **Information Input**: First conversation provides personal identity and preference information
* **Memory Activation**: System begins recording conversation content, including user input and Agent replies
* **State Saving**: Name (John Doe) and cryptocurrency preference (Bitcoin) are recorded in conversation history
* **Natural Response**: Agent friendly acknowledges understood information and attempts to expand the conversation
* **Internal Processing**: This message and its reply become the first node of memory

### Second Round of Conversation - Test Memory Capability

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-2" exclude_imports
const result2 = await aigne.invoke(agent, {
  message: "What is my favorite cryptocurrency?",
});
console.log(result2);
// Output: { message: "Your favorite cryptocurrency is Bitcoin." }
```

**Explanation**:

* **Memory Retrieval**: Ask about previously mentioned information to test Agent's memory capability
* **Context Understanding**: Agent not only remembers "Bitcoin" but also understands this is the user's "preference"
* **Coherent Answer**: Can correctly answer preference questions, demonstrating accurate understanding of previous conversations
* **Behavioral Comparison**: Without memory enabled, Agent would answer "I don't know" or request more information
* **Incremental Memory**: This Q\&A is also added to conversation history, further enriching the context

### Third Round of Conversation - Add More Information

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-3" exclude_imports
const result3 = await aigne.invoke(agent, {
  message: "I've invested $5000 in Ethereum.",
});
console.log(result3);
// Output: { message: "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!" }
```

**Explanation**:

* **Memory Extension**: Add new specific information (investment amount and currency) to existing conversation
* **Cumulative Knowledge**: System integrates new information with existing content (user identity, preferences)
* **Professional Response**: Agent confirms new information and provides appropriate professional evaluation
* **Information Integration**: Adds user's Ethereum investment to their known cryptocurrency interests (Bitcoin)
* **Conversation Continuity**: Reply reflects understanding of the overall conversation, not just response to current message

### Fourth Round of Conversation - Further Test Memory Capability

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-4" exclude_imports
const result4 = await aigne.invoke(agent, {
  message: "How much have I invested in Ethereum?",
});
console.log(result4);
// Output: { message: "You've invested $5000 in Ethereum." }
```

**Explanation**:

* **Precise Recall**: Can accurately answer specific numerical questions, demonstrating detailed memory capability
* **Associative Understanding**: Not only remembers the amount but also the association with specific cryptocurrency
* **Deep Memory**: Can extract specific detail information from accumulated conversations
* **User Profile**: At this point, Agent has built a relatively complete user investment profile
* **Persistent Memory**: All this information will continue to be saved until the session ends or memory is cleared

## Example Code

The following example shows how to create an Agent with memory functionality and test its memory capability in continuous conversations:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent"
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
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
    },
  }),
  inputKey: "message",
});

const result1 = await aigne.invoke(agent, {
  message: "My name is John Doe and I like to invest in Bitcoin.",
});
console.log(result1);
// Output: { message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }

const result2 = await aigne.invoke(agent, {
  message: "What is my favorite cryptocurrency?",
});
console.log(result2);
// Output: { message: "Your favorite cryptocurrency is Bitcoin." }

const result3 = await aigne.invoke(agent, {
  message: "I've invested $5000 in Ethereum.",
});
console.log(result3);
// Output: { message: "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!" }

const result4 = await aigne.invoke(agent, {
  message: "How much have I invested in Ethereum?",
});
console.log(result4);
// Output: { message: "You've invested $5000 in Ethereum." }
```

## How Memory Functionality Works

Memory functionality achieves conversation coherence through the following mechanisms:

1. **Message Storage**: Each conversation (user input and Agent reply) is stored in memory
2. **Context Construction**: When new messages are sent, the framework automatically provides previous conversations as context to the model
3. **Intelligent Processing**: The underlying model understands and processes new messages based on context, producing coherent replies
4. **Memory Optimization**: The system optimizes long conversations to ensure they don't exceed the model's context window limits
