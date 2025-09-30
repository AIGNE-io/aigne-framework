# Function Agent

The `FunctionAgent` provides a straightforward way to wrap a standard JavaScript or TypeScript function into a fully-featured AIGNE agent. It acts as a lightweight bridge, allowing you to integrate existing business logic or simple, deterministic tasks into the AIGNE ecosystem without the need to create a dedicated agent class.

Think of it as a quick way to create a specialized tool that other, more complex agents (like an [AIAgent](./core-agents-ai-agent.md)) can use. If you have a function that calculates a value, fetches data from a specific source, or performs any single, well-defined operation, `FunctionAgent` is the perfect choice.

## Basic Usage

The simplest way to create a `FunctionAgent` is by passing your function directly to the `FunctionAgent.from()` static method.

### Example: Creating a Simple Greeting Agent

Let's say you have a function that generates a greeting. You can turn it into an agent with a single line of code.

```javascript Function Agent Example icon=logos:javascript
import { FunctionAgent } from '@aigne/core';

// Create an agent from a simple function
const agent = FunctionAgent.from(({ name }: { name: string }) => {
  return {
    greeting: `Hello, ${name}!`,
  };
});

// Invoke the agent
const result = await agent.invoke({ name: "Alice" });

console.log(result); 
// Output: { greeting: "Hello, Alice!" }
```

In this example, AIGNE automatically wraps the provided function. When you `invoke` the agent, it executes your function with the input you provide and returns the result.

## Configuration and Schemas

For more control, you can provide a configuration object that includes a name, description, and schemas for input and output validation.

Defining schemas is a best practice, as it ensures your agent receives the data it expects and produces a consistent output format. This is especially important when `FunctionAgent`s are used as tools by other agents.

### Example: An Adder Agent with Validation

This example creates an agent that adds two numbers. It uses Zod schemas to ensure the inputs are numbers and the output is also a number.

```javascript Agent with Schemas icon=logos:javascript
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

const adderAgent = FunctionAgent.from({
  name: 'adder',
  description: 'Adds two numbers together.',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  outputSchema: z.object({
    sum: z.number(),
  }),
  process: ({ a, b }) => {
    return { sum: a + b };
  },
});

const result = await adderAgent.invoke({ a: 5, b: 10 });

console.log(result); 
// Output: { sum: 15 }

// This would fail validation and throw an error:
// await adderAgent.invoke({ a: 5, b: 'ten' });
```

## Streaming Responses

`FunctionAgent` is not limited to simple request-response patterns. It fully supports streaming, which is useful for long-running tasks or when you want to return data incrementally.

You can achieve this in two ways: by returning a `ReadableStream` or by using an async generator.

### Using an Async Generator

Using an `async function*` (async generator) is often the most intuitive way to create a stream. You can `yield` chunks of data as they become available.

```javascript Streaming with Async Generator icon=logos:javascript
import { FunctionAgent, textDelta } from '@aigne/core';

const streamingAgent = FunctionAgent.from(async function* ({ name }: { name: string }) {
  yield textDelta({ text: "Hello" });
  yield textDelta({ text: ", " });
  yield textDelta({ text: name });
  yield textDelta({ text: "!" });
});

// Invoke with streaming: true
const stream = await streamingAgent.invoke({ name: "World" }, { streaming: true });

let fullText = '';
for await (const chunk of stream) {
  // Process each chunk as it arrives
  if (chunk.delta?.text?.text) {
    fullText += chunk.delta.text.text;
  }
}

console.log(fullText); 
// Output: "Hello, World!"
```

## Summary

The `FunctionAgent` is a powerful utility for quickly integrating custom logic into the AIGNE framework. It simplifies the process of creating agents for specific tasks, complete with data validation and support for streaming.

- **Use it for:** Simple, deterministic tasks or wrapping existing functions.
- **Best Practice:** Always define `inputSchema` and `outputSchema` to ensure reliability.
- **Capabilities:** Supports both single-shot responses and complex streaming via async generators.

Now that you understand how to create functional tools, learn how to orchestrate multiple agents to work together in the [Team Agent](./core-agents-team-agent.md) section.