<markdown>
# TeamAgent Module in Aigne Framework

The TeamAgent module in the Aigne Framework is designed to manage and coordinate a group of agents working collectively to accomplish tasks, either sequentially or in parallel. It provides flexible processing modes to suit different task coordination needs, such as creating agent workflows that require staged outputs or executing independent tasks concurrently. This module is particularly useful in scenarios like building complex agent systems with specialized components that work together seamlessly or executing multiple analyses that require independent processing.

## Sequential Execution of TeamAgent

This section explains the sequential mode in TeamAgent, which is designed to process various agents one by one. Each agent in the team executes in order, receiving the combined output from its predecessors. This mode is ideal for workflows where the output of one agent is required as input for the subsequent agent, thereby fostering a coordinated processing pipeline.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/team-agent.test.ts" region="example-agent-sequential-create-agent"
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

## Invoking TeamAgent in Sequential Mode

Here, the TeamAgent is utilized to translate and then format text sequentially. The example highlights the invocation process where the input content is translated and subsequently prettified using a sequence of agents operating synchronously. This demonstrates the utility of TeamAgent in scenarios necessitating gradual transformation and refinement of data through staged operations.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/team-agent.test.ts" region="example-agent-sequential-invoke"
const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(teamAgent, {
  content: "AIGNE is a great framework to build AI agents.",
});
console.log(result);
// Output:
// {
//   formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
// }
expect(result).toEqual({
  formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
});
```

## Parallel Execution of TeamAgent

The parallel processing mode of TeamAgent allows simultaneous execution of all agents with a shared input. This facilitates the parallel generation and amalgamation of outputs, making it suitable for tasks where multiple analyses or transformations need to be conducted concurrently without dependencies on intermediary results.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/team-agent.test.ts" region="example-agent-parallel-create-agent"
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

## Invoking TeamAgent in Parallel Mode

In this example, the TeamAgent processes an input description for a product by invoking both feature and audience analysis in parallel. This demonstrates the capability of handling complex analyses in tandem, with each agent focusing on specific data aspects, facilitating comprehensive insights without waiting for sequential outputs.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/team-agent.test.ts" region="example-agent-parallel-invoke"
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

expect(result).toEqual({
  features:
    "- No-code platform\n- Generative AI capabilities\n- App engine functionality\n- Easy integration",
  audience:
    "- Business professionals\n- Non-technical users\n- Organizations seeking AI solutions\n- Developers looking for rapid prototyping",
});
```

The TeamAgent module in the Aigne Framework offers substantial flexibility in building and coordinating complex multi-agent systems. By supporting both sequential and parallel execution modes, it caters to diverse use cases, ranging from pipeline transformations requiring data hand-offs between agents to parallel analyses that maximize throughput. Integrating and expanding the TeamAgent with custom agents can further tailor system behavior to specific application requirements, leveraging the core strengths of process orchestration and modular composition.

</markdown>