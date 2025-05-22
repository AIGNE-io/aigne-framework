# TeamAgent

[English](./team-agent.md) | [中文](./team-agent.zh.md)

## Overview

TeamAgent is a powerful component in the AIGNE framework that allows developers to combine multiple agents into a team to solve complex problems through collaborative work. TeamAgent supports two processing modes: sequential and parallel, enabling developers to flexibly choose the most suitable workflow based on task dependencies. Through TeamAgent, complex multi-stage workflows can be built, with each stage handled by specialized agents, achieving more efficient and professional task processing. Whether for task chains that need to be executed in a specific order or independent tasks that can be performed simultaneously, TeamAgent provides concise yet powerful solutions.

## Sequential Processing Mode

In sequential processing mode, agents in TeamAgent execute in the order they were added, with the output of the previous agent serving as the input for the next agent. This mode is suitable for handling tasks with clear dependencies, such as translation followed by text beautification.

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-sequential-create-agent"
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("The text content to translate"),
  }),
  instructions: "Translate the text to Chinese:\n{{content}}",
  outputKey: "translation",
});

const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("The translated text"),
  }),
  instructions: "Prettier the following text:\n{{translation}}",
  outputKey: "formatted",
});

const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

In the above example, we created two AIAgents:

1. `translatorAgent`: Responsible for translating text to Chinese and storing the result in the `translation` field
2. `prettierAgent`: Receives the translated text, performs beautification processing, and stores the result in the `formatted` field

Then, we use the `TeamAgent.from()` method to create a sequential processing team agent, adding these two agents as skills to the team. By setting `mode: ProcessMode.sequential`, we ensure these agents execute in the order they were added.

### Invoking Sequential Processing Team

After creating a TeamAgent, you can use AIGNE's invoke method to send requests to the team and get responses. In sequential processing mode, each agent's output serves as input for the next agent, ultimately returning results containing all agents' outputs.

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-sequential-invoke"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(teamAgent, {
  content: "AIGNE is a great framework to build AI agents.",
});
console.log(result);
// Output:
// {
//   translation: "AIGNE 是一个构建人工智能代理的优秀框架。",
//   formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
// }
```

In this example, we first created an OpenAIChatModel instance and an AIGNE instance. Then, we call the `aigne.invoke()` method, passing in the team agent and initial input. The processing flow is as follows:

1. `translatorAgent` receives input `{ content: "AIGNE is a great framework to build AI agents." }`, translates the text to Chinese, and outputs `{ translation: "AIGNE 是一个构建人工智能代理的优秀框架。" }`
2. `prettierAgent` receives `translatorAgent`'s output as input, beautifies the translated text, and outputs `{ formatted: "AIGNE 是一个出色的人工智能代理构建框架。" }`
3. The final result contains all agents' outputs: `{ translation: "...", formatted: "..." }`

## Parallel Processing Mode

In parallel processing mode, all agents in TeamAgent execute simultaneously, each processing the same input. This mode is suitable for handling mutually independent tasks, such as simultaneously analyzing different aspects of a product.

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-parallel-create-agent"
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: `\
You are a product analyst. Given a product description, identify and list the key features of the product.
Be specific and focus only on the features. Format as bullet points.

Product description:
{{product}}`,
  outputKey: "features",
});

const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: `\
You are a market researcher. Given a product description, identify the target audience for this product.
Consider demographics, interests, needs, and pain points. Format as bullet points.

Product description:
{{product}}`,
  outputKey: "audience",
});

const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

In the above example, we created two AIAgents:

1. `featureAnalyzer`: Responsible for analyzing product features and storing the result in the `features` field
2. `audienceAnalyzer`: Responsible for analyzing target audience and storing the result in the `audience` field

Then, we use the `TeamAgent.from()` method to create a parallel processing team agent, adding these two agents as skills to the team. By setting `mode: ProcessMode.parallel`, we ensure these agents execute simultaneously, each processing the same input.

### Invoking Parallel Processing Team

After creating a parallel processing TeamAgent, you can use AIGNE's invoke method to send requests to the team and get responses. In parallel processing mode, all agents simultaneously receive the same input, ultimately returning results containing all agents' outputs.

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-parallel-invoke"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(analysisTeam, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
// Output would include:
// {
//   features: "- No-code platform\n- Generative AI capabilities\n- App engine functionality\n- Easy integration",
//   audience: "- Business professionals\n- Non-technical users\n- Organizations seeking AI solutions\n- Developers looking for rapid prototyping",
// }
```

In this example, we first created an OpenAIChatModel instance and an AIGNE instance. Then, we call the `aigne.invoke()` method, passing in the team agent and initial input. The processing flow is as follows:

1. `featureAnalyzer` and `audienceAnalyzer` simultaneously receive input `{ product: "AIGNE is a No-code Generative AI Apps Engine" }`
2. `featureAnalyzer` analyzes product features, outputting `{ features: "- No-code platform\n- ..." }`
3. `audienceAnalyzer` analyzes target audience, outputting `{ audience: "- Business professionals\n- ..." }`
4. The final result merges all agents' outputs: `{ features: "...", audience: "..." }`

## Combining Sequential and Parallel Processing

A powerful feature of TeamAgent is the ability to combine sequential and parallel processing to build complex workflows. For example, you can first analyze different aspects of a product in parallel, then sequentially pass the analysis results to content creation agents.

This combined usage can be achieved through nested TeamAgents. For example, you can create a parallel processing TeamAgent as the first skill of a sequential processing TeamAgent, then add other agents that depend on parallel processing results as subsequent skills.

## Summary

TeamAgent is a powerful and flexible tool in the AIGNE framework that provides users with the ability to combine multiple agents for collaborative work:

1. **Sequential Processing Mode**: Agents execute in the order they were added, with the previous agent's output serving as input for the next agent. Suitable for handling tasks with clear dependencies, such as translation followed by text beautification.

2. **Parallel Processing Mode**: All agents execute simultaneously, each processing the same input. Suitable for handling mutually independent tasks, such as simultaneously analyzing different aspects of a product.

3. **Combined Usage**: Through nested TeamAgents, sequential and parallel processing modes can be combined to build complex workflows.

The main advantages of TeamAgent are:

* **Modular Design**: Each agent focuses on specific tasks, improving processing quality and efficiency
* **Flexible Combination**: Choose sequential or parallel processing modes based on task dependencies
* **Scalability**: Easily add or remove skills, adjust workflows
* **Structured Output**: Each agent's output has clear field names, facilitating subsequent processing

Based on actual requirements, developers can flexibly choose appropriate processing modes to build efficient, professional multi-agent workflows.
