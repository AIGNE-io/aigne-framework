# Function Agent

A `FunctionAgent` serves as a direct bridge between standard JavaScript/TypeScript functions and the AIGNE framework. It allows you to encapsulate any function into a fully-featured agent, enabling seamless integration of custom logic, third-party tools, or existing codebases into your AI workflows.

This approach offers a lightweight and efficient alternative to subclassing the main `Agent` class, making it ideal for creating specialized, single-purpose agents with minimal boilerplate.

## Core Concepts

The `FunctionAgent` is designed for simplicity. You provide a function, and the framework wraps it in the necessary agent structure. This allows your function to participate in the AIGNE ecosystem, receiving inputs and producing outputs just like any other agent.

Key features include:
- **Direct Function Wrapping:** Convert existing functions into agents with a single command.
- **Schema Definition:** Attach input and output schemas to your function for automatic validation and type safety.
- **Asynchronous Support:** Natively handles `async` functions, `Promise`-based logic, and even streaming responses via Async Generators.

## Creating a Function Agent

You can create a `FunctionAgent` by passing a function and an optional configuration object to the `FunctionAgent.from()` factory method.

### Basic Example

The most straightforward method is to wrap an existing function. Let's create an agent that performs a simple calculation.

First, define the function that will contain the core logic:

```javascript Simple Calculator Function icon=logos:javascript
function calculator({ a, b, operation }) {
  switch (operation) {
    case 'add':
      return { result: a + b };
    case 'subtract':
      return { result: a - b };
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}
```

Now, wrap this function to create an agent. You can define the input and output schemas directly in the configuration to ensure data integrity.

```javascript Creating the Calculator Agent icon=logos:javascript
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

const calculatorAgent = FunctionAgent.from({
  name: 'calculator',
  description: 'Performs basic arithmetic operations.',
  process: calculator,
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum(['add', 'subtract']),
  }),
  outputSchema: z.object({
    result: z.number(),
  }),
});
```

### Invoking the Agent

Once created, the `FunctionAgent` can be invoked like any other agent.

```javascript Invoking the Agent icon=logos:javascript
const response = await calculatorAgent.invoke({
  a: 10,
  b: 5,
  operation: 'add',
});

console.log(response);
```

**Example Response**

```json
{
  "result": 15
}
```

## Advanced Usage

`FunctionAgent` also supports more complex scenarios, including asynchronous operations and streaming data.

### Asynchronous Functions

If your function performs asynchronous operations, simply define it as an `async` function. The `FunctionAgent` will automatically await the `Promise`.

Here is an example of an agent that evaluates JavaScript code in a sandboxed environment.

```javascript Sandbox Agent Implementation icon=logos:javascript
import vm from "node:vm";
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

// The core logic
async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

// Create the agent
const sandboxAgent = FunctionAgent.from({
    name: 'evaluateJs',
    description: 'This agent evaluates JavaScript code.',
    process: evaluateJs,
    inputSchema: z.object({
        code: z.string().describe("JavaScript code to evaluate"),
    }),
    outputSchema: z.object({
        result: z.any().describe("Result of the evaluated code"),
    }),
});

// Invoke the agent
const { result } = await sandboxAgent.invoke({ code: '1 + 1' });
console.log(result); // 2
```

### Streaming with Async Generators

For tasks that produce data incrementally, you can use an async generator function. The `FunctionAgent` will stream the yielded chunks to the caller. This is particularly useful for long-running processes or for providing real-time feedback.

```javascript Streaming Agent Example icon=logos:javascript
import { FunctionAgent, jsonDelta } from '@aigne/core';
import { z } from 'zod';

const streamingAgent = FunctionAgent.from({
  name: 'streamingCounter',
  description: 'Counts from 0 to a specified number, streaming each number.',
  inputSchema: z.object({
    count: z.number().int().positive(),
  }),
  outputSchema: z.object({
    progress: z.number(),
  }),
  process: async function* ({ count }) {
    for (let i = 0; i <= count; i++) {
      // Yield a JSON delta for each step
      yield jsonDelta({ progress: i });
      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
});

// To consume the stream
const stream = await streamingAgent.invoke(
    { count: 5 }, 
    { streaming: true }
);

for await (const chunk of stream) {
  console.log(chunk);
}
```

This agent will produce a stream of updates, allowing the client to process each number as it becomes available without waiting for the entire sequence to complete.