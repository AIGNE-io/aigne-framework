# FunctionAgent

[English](./function-agent.md) | [中文](./function-agent.zh.md)

## Overview

FunctionAgent is a core component in the AIGNE framework that allows developers to convert ordinary functions into intelligent agents. This document details the four creation patterns of FunctionAgent (basic, minimal, streaming, and generator) and how to invoke these agents. The main advantages of FunctionAgent lie in its flexibility and type safety, supporting synchronous/asynchronous processing, streaming output, and type inference, enabling developers to choose the most suitable implementation approach for different scenarios. Whether for complex applications requiring strict type definitions or rapid prototype development, FunctionAgent provides concise yet powerful solutions.

## Creation Methods

### Basic Pattern

In the basic example, we use the FunctionAgent.from() method and provide corresponding options to create an Agent capable of getting weather information. Agents created this way cover input/output type definitions and processing logic, representing the most fundamental creation approach.

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-basic-create-agent"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const weather = FunctionAgent.from({
  name: "getWeather",
  description: "Get the current weather for a given location.",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  outputSchema: z.object({
    $message: z.string().describe("The message from the agent."),
    temperature: z.number().describe("The current temperature in Celsius."),
  }),
  process: async ({ city }) => {
    console.log(`Fetching weather for ${city}`);
    const temperature = 25; // You can replace this with actual weather fetching logic

    return {
      $message: "Hello, I'm AIGNE!",
      temperature,
    };
  },
});
```

Key features:

* Use name and description fields to define Agent functionality
* Define data structures using zod through input and output schema definitions
* Implement asynchronous processing logic

### Minimal Pattern

When you need to quickly create an Agent without explicitly defining inputSchema, outputSchema, etc., you can use the minimal pattern.

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-pure-function-create-agent"
import { FunctionAgent } from "@aigne/core";

const weather = FunctionAgent.from(async ({ city }) => {
  console.log(`Fetching weather for ${city}`);

  return {
    $message: "Hello, I'm AIGNE!",
    temperature: 25,
  };
});
```

Key features:

* Directly pass a function, which can be a synchronous function, asynchronous function, generator function, or function returning ReadableStream
* TypeScript automatically infers input/output types based on the passed function
* Suitable for scenarios with less strict type requirements or needing rapid implementation

### Streaming Output Pattern

In some scenarios, you need to continuously output partial results in a streaming manner, such as real-time progress updates, continuous data fragment returns, etc. FunctionAgent also supports this requirement.

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-streaming-create-agent"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const weather = FunctionAgent.from({
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  outputSchema: z.object({
    $message: z.string().describe("The message from the agent."),
    temperature: z.number().describe("The current temperature in Celsius."),
  }),
  process: async ({ city }) => {
    console.log(`Fetching weather for ${city}`);

    return new ReadableStream({
      start(controller) {
        controller.enqueue({ delta: { text: { $message: "Hello" } } });
        controller.enqueue({ delta: { text: { $message: "," } } });
        controller.enqueue({ delta: { text: { $message: " I'm" } } });
        controller.enqueue({ delta: { text: { $message: " AIGNE" } } });
        controller.enqueue({ delta: { text: { $message: "!" } } });
        controller.enqueue({ delta: { json: { temperature: 25 } } });
        controller.close();
      },
    });
  },
});
```

Key features:

* Processing function returns a ReadableStream
* Push data sequentially through stream controller
* Suitable for scenarios requiring gradual data return and real-time updates

### Generator Pattern

If you don't want to directly return ReadableStream internally, you can use generator functions to gradually yield data during asynchronous processes, achieving streaming or segmented returns.

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-generator-create-agent"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const weather = FunctionAgent.from({
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  outputSchema: z.object({
    $message: z.string().describe("The message from the agent."),
    temperature: z.number().describe("The current temperature in Celsius."),
  }),
  process: async function* ({ city }) {
    console.log(`Fetching weather for ${city}`);

    yield { delta: { text: { $message: "Hello" } } };
    yield { delta: { text: { $message: "," } } };
    yield { delta: { text: { $message: " I'm" } } };
    yield { delta: { text: { $message: " AIGNE" } } };
    yield { delta: { text: { $message: "!" } } };
    yield { delta: { json: { temperature: 25 } } };

    // Or you can return a partial result at the end
    return { temperature: 25 };
  },
});
```

Key features:

* Use async generator functions to process data
* Generate new data chunks through yield
* Can return a complete or partial final result at the end
* Syntax is closer to JavaScript functional programming style

## Invocation Methods

### Basic Invocation

Use the invocation method to execute the created intelligent agent. The most common invocation method is passing a parameter object and waiting for execution completion to get the return result.

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-basic-invoke"
const result = await weather.invoke({ city: "New York" });
console.log(result);
// Output: { $message: "Hello, I'm AIGNE!", temperature: 25 }
```

### Streaming Invocation

When you need to handle streaming data, you can enable streaming options, then use async iteration to gradually get data chunks, implementing streaming reading and segmented processing logic.

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-streaming-invoke"
const stream = await weather.invoke({ city: "New York" }, { streaming: true });
let text = "";
const json = {};
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
  if (chunk.delta.json) Object.assign(json, chunk.delta.json);
}
console.log(text); // Output: Hello, I'm AIGNE!
console.log(json); // Output: { temperature: 25 }
```

## Summary

FunctionAgent is a powerful and flexible tool in AIGNE that provides users with multiple creation and invocation methods, suitable for different scenario requirements:

1. Regular Pattern: Explicitly define input/output types and processing logic, suitable for scenarios with strict input/output requirements.
2. Minimal Pattern: Create Agents quickly with minimal code, improving development efficiency.
3. Streaming/Generator Pattern: Convenient for handling long-running, real-time, or segmented output tasks.

Based on actual requirements, developers can flexibly choose appropriate patterns to implement "functions as intelligent agents."
