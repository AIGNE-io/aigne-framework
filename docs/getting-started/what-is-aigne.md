# What is AIGNE?

[English](./what-is-aigne.md) | [中文](./what-is-aigne.zh.md)

AIGNE is a cutting-edge framework and runtime engine for Large Language Model (LLM) application development. It provides a unified platform for Agent orchestration, complex AI workflow design, and integration of various AI models with external tools, focusing on flexibility, scalability, and ease of use.

```ts file="../../docs-examples/test/what-is-aigne.test.ts" region="example-what-is-aigne-basic"
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
  instructions: "You are a helpful assistant",
});

const result = await agent.invoke("What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

## Key Features

* **Agent Architecture**: AIGNE allows you to define, compose, and collaborate multiple Agents with different skills or roles to solve complex tasks together.
* **Workflow Engine**: Design and execute complex AI workflows with minimal code, supporting sequential, concurrent, event-driven, and other modes.
* **No-Code/Low-Code Capabilities**: Through high-level abstractions and configuration-driven design, users without deep programming experience can easily create generative AI applications.
* **Model Agnostic**: Seamlessly integrate with mainstream LLM providers (such as OpenAI, Anthropic, Gemini, etc.) and flexibly switch between models.
* **MCP Extensions**: Extend AIGNE capabilities by connecting to external Model Context Protocol (MCP) servers, enabling tool calling, web automation, database access, and more.

## Core Concepts

* **Agent**: The basic building unit of AIGNE. Agents encapsulate the logic, instructions, and capabilities for processing inputs and generating outputs. They can serve single functions or be composed into teams or orchestrators.
* **Workflow**: A sequence or network of Agent interactions designed to achieve specific goals, supporting linear, parallel, or dynamic processes.
* **Model**: The underlying LLM or AI model that provides support for Agent reasoning and generation. AIGNE abstracts model details for easy integration and switching.
* **MCP Integration**: AIGNE can connect to external MCP servers to access more tools, APIs, and resources, significantly expanding functional boundaries.
