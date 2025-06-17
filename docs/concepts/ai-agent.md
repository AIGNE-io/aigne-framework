# AIAgent

[English](./ai-agent.md) | [中文](./ai-agent.zh.md)

## Overview

AIAgent is a core component in the AIGNE framework that allows developers to easily create intelligent agents powered by Large Language Models (LLMs). This document details the various creation patterns of AIAgent (basic, custom instructions, custom instructions with variables, structured output, and skill integration) and how to invoke these agents. The main advantages of AIAgent lie in its simplicity and flexibility, supporting multiple language models, custom instructions, and structured output, enabling developers to quickly build intelligent conversational systems for different scenarios. Whether for applications requiring simple Q\&A or complex multi-skill agents, AIAgent provides concise yet powerful solutions.

## Basic Pattern

In the basic example, we use the AIAgent.from() method and provide a language model to create a basic AI agent. Agents created this way can directly answer user questions and represent the simplest creation method.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

const agent = AIAgent.from({ model });
```

## Invoking Agents

After creating an AIAgent, you can use the invoke method to send requests to the agent and get responses. In basic invocation, simply pass a string as the user's question or instruction.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-invoke"
const result = await agent.invoke("What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

## Streaming Response

Streaming response is a way to get AI answers in real-time, allowing applications to progressively receive and display content during the complete response generation process, rather than waiting for the entire response to complete before returning it all at once. This approach is particularly suitable for interactive applications that need immediate feedback, such as chatbots or real-time assistance tools.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-invoke-stream"
import { isAgentResponseDelta } from "@aigne/core";

const stream = await agent.invoke("What is AIGNE?", { streaming: true });
let response = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk) && chunk.delta.text?.$message)
    response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```

Key features:

* Enable streaming response by setting the `streaming: true` option
* Use `for await...of` loop to process each data chunk in the response stream
* Support real-time display of AI-generated content, enhancing user experience
* Suitable for application scenarios requiring immediate feedback, such as chat interfaces or real-time content generation
* Can start processing or displaying partial content early during long response generation

## Custom Instructions

When you need to control the behavior or style of an AI agent, you can create agents by providing custom instructions.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  instructions: "Only speak in Haikus.",
});
```

The following example shows how to invoke an agent with custom instructions and get answers that conform to the specified style (haiku):

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-invoke"
const result = await agent.invoke("What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE stands for  \nA new approach to learning,  \nKnowledge intertwined." }
```

Key features:

* Provide custom instructions through the instructions parameter
* Control the response style or behavior of AI agents
* Suitable for scenarios requiring specific styles or domain-specific answers

### Custom Instructions with Variables

In some scenarios, instructions need to be dynamically adjusted based on user input. AIAgent supports using variables in instructions for more flexible control.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-with-variables-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  instructions: "Only speak in {{style}}.",
});
```

The following example shows how to invoke an agent with custom instructions containing variables. By using the createMessage function to create a message containing the user's question and variable values, the agent can generate answers based on the provided style (Haikus):

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-with-variables-invoke"
import { createMessage } from "@aigne/core";

const result = await agent.invoke(
  createMessage("What is AIGNE?", { style: "Haikus" }),
);
console.log(result);
// Output: { $message: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms." }
```

Key features:

* Use double braces `{{variable_name}}` to insert variables in instructions
* Define the structure and type of input parameters through inputSchema
* Suitable for scenarios requiring dynamic adjustment of AI behavior

### Structured Output

When you need AI agents to return data in a specific structure, you can achieve this by defining output schemas.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-structured-output-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  outputSchema: z.object({
    topic: z.string().describe("The topic of the request"),
    response: z.string().describe("The response to the request"),
  }),
  instructions: "Only speak in {{style}}.",
});
```

The following example shows how to invoke an agent with structured output. Similar to custom instructions with variables, we use the createMessage function to pass user questions and variable values, but this time the agent will return structured data that conforms to our defined output schema:

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-structured-output-invoke"
import { createMessage } from "@aigne/core";

const result = await agent.invoke(
  createMessage("What is AIGNE?", { style: "Haikus" }),
);
console.log(result);
// Output: { topic: "AIGNE", response: "AIGNE, you ask now  \nArtificial Intelligence  \nGuidance, new tech blooms." }
```

Key features:

* Define the structure and type of output data through outputSchema
* Ensure AI returns data in the expected format
* Suitable for application scenarios requiring structured data processing

### Skill Integration

AIAgent can integrate other agents as skills to extend its functional range.

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-create-skill"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const getWeather = FunctionAgent.from({
  name: "get_weather",
  description: "Get the current weather for a location.",
  inputSchema: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  outputSchema: z.object({
    temperature: z.number().describe("The current temperature in Celsius"),
    condition: z.string().describe("The current weather condition"),
    humidity: z.number().describe("The current humidity percentage"),
  }),
  process: async ({ location }) => {
    console.log(`Fetching weather for ${location}`);
    // This would typically call a weather API
    return {
      temperature: 22,
      condition: "Sunny",
      humidity: 45,
    };
  },
});
```

The following example shows how to create an AIAgent that integrates weather query skills. By adding the previously created getWeather function agent to the skills array, the AI agent can access and use this skill:

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-create-agent"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  instructions:
    "You are a helpful assistant that can provide weather information.",
  skills: [getWeather],
});
```

The following example shows how to invoke an agent with skills. When a user asks about the weather in Beijing, the agent will automatically recognize this as a weather query request and call the getWeather skill to obtain weather data, then return the result in natural language:

```ts file="../../docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-invoke"
const result = await agent.invoke("What's the weather like in Beijing today?");
console.log(result);
// Output: { $message: "The current weather in Beijing is 22°C with sunny conditions and 45% humidity." }
```

Key features:

* Integrate other agents as skills through the skills parameter
* Extend the functional range of AI agents
* Suitable for building multi-functional, complex intelligent agents

## Summary

AIAgent is a powerful and flexible tool in AIGNE that provides users with multiple creation and invocation methods, suitable for different scenario requirements:

1. Basic Pattern: Quickly create simple AI agents, suitable for basic Q\&A scenarios.
2. Custom Instructions Pattern: Control AI agent behavior and style, suitable for domain-specific or style-specific applications.
3. Custom Instructions with Variables Pattern: Dynamically adjust instructions based on user input for more flexible control.
4. Structured Output Pattern: Ensure AI returns data in expected formats, suitable for applications requiring structured data processing.
5. Skill Integration Pattern: Extend AI agent functional range to build multi-functional, complex intelligent agents.

Based on actual requirements, developers can flexibly choose appropriate patterns to implement feature-rich AI agents.
