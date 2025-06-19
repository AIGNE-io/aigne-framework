# Agent

[English](./agent.md) | [中文](./agent.zh.md)

Agent is the core foundation of the AIGNE framework. It's not just a simple class, but the soul of the entire Agent ecosystem. Through the Agent class, you can build various intelligent applications from simple conversational assistants to complex decision-making systems. It provides a unified mechanism for all Agents to define input/output schemas and implement processing logic.

Think of Agent as providing a powerful and flexible skeleton for your AI applications, which you can extend to create Agents with rich capabilities:

* Precisely handle various structured input and output data
* Use schema validation to ensure data format correctness
* Create seamless communication channels between agents
* Flexibly support real-time streaming or one-time responses
* Build intelligent agents with memory that can remember past interactions
* Flexibly output results in multiple formats (JSON/text)
* Implement intelligent task distribution, forwarding specific tasks to specialized agents

## Built-in Supported Agents

AIGNE provides a series of pre-built powerful agent types to meet various application scenario requirements:

* [FunctionAgent](./function-agent.md) - Lightweight agents that implement logic through functions, suitable for simple and clear tasks
* [AIAgent](./ai-agent.md) - Intelligent agents that integrate large language model capabilities, suitable for complex natural language interactions
* [TeamAgent](./team-agent.md) - Team managers that coordinate multiple expert agents working together, solving complex multi-step problems
* [MCPAgent](./mcp-agent.md) - Bridge agents that connect to external MCP servers, extending system capability boundaries
* [MemoryAgent](./memory-agent.md) - Enhanced agents with contextual memory capabilities, enabling continuous dialogue and learning
* [GuideRailAgent](./guide-rail-agent.md) - Supervisory agents that provide safety guidance rules, ensuring outputs meet expected standards

## Agent Class Deep Dive

Let's explore the rich features and construction methods of the Agent class in depth.

### Basic Information

Each agent needs to have its own identity, just like every member in a team has their own name and responsibilities:

* **name** - The unique name of the Agent, used for identification and logging. If not specified, the system will default to using the constructor name.
* **description** - A clear description of the Agent's purpose and capabilities, which is not only the foundation of good documentation but also key for Agents to understand each other's roles in multi-Agent systems.

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-basic-info" exclude_imports
const chatbot = AIAgent.from({
  name: "chatbot",
  description: "A chatbot that answers questions.",
});
```

### Input/Output Structure

Agents need to clearly know what kind of input they expect to receive and what kind of output they will produce. This is achieved through schema definitions:

* **inputSchema** - Use Zod schema to define the Agent's input message structure, ensuring input data conforms to expected formats.
* **outputSchema** - Use Zod schema to define the Agent's output message structure, guaranteeing consistency and predictability of output data.

This structured definition not only provides type safety but also offers clear contracts for communication between Agents:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-input-output-schema" exclude_imports
const textAnalyzer = AIAgent.from({
  inputSchema: z.object({
    text: z.string().describe("The text content to analyze"),
  }),
  outputSchema: z.object({
    summary: z.string().describe("A concise summary of the text"),
    points: z
      .array(z.string())
      .describe("List of important points from the text"),
    sentiment: z
      .enum(["positive", "neutral", "negative"])
      .describe("Overall sentiment of the text"),
  }),
});
```

**TypeScript Type Support**

With these schema definitions, you can enjoy complete type checking and auto-completion functionality when calling Agents:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-input-output-schema-invoke" exclude_imports
const result = await textAnalyzer.invoke({
  text: "The new AIGNE framework offers ...",
});
console.log(result);
// Output: { summary: "AIGNE is a framework for building AI agents.", points: ["AIGNE", "framework", "AI agents"], sentiment: "positive" }
```

### Lifecycle Hooks

Lifecycle hooks are key observation points in the Agent processing flow, allowing you to inject custom logic such as logging, performance monitoring, error handling, etc., without modifying the core implementation:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-hooks" exclude_imports
const agent = AIAgent.from({
  hooks: {
    onStart(event) {
      console.log("Agent started:", event.input);
    },
    onEnd(event) {
      if (event.error) {
        console.error("Agent ended with error:", event.error);
      } else {
        console.log("Agent ended:", event.output);
      }
    },
    onSkillStart(event) {
      console.log("Skill started:", event.skill, event.input);
    },
    onSkillEnd(event) {
      if (event.error) {
        console.error("Skill ended with error:", event.error);
      } else {
        console.log("Skill ended:", event.output);
      }
    },
    onHandoff(event) {
      console.log("Handoff event:", event.source, event.target);
    },
  },
});
```

Each hook is triggered at specific stages of the Agent lifecycle:

* **onStart**: The preparation stage before the Agent begins processing, suitable for initialization setup, logging, or input transformation.
* **onEnd**: The cleanup stage when the Agent completes processing or encounters an error, suitable for resource cleanup, result logging, or error handling.
* **onSkillStart**: The moment before the Agent is about to call a skill (sub-Agent), suitable for tracking skill usage or adjusting input passed to skills.
* **onSkillEnd**: The callback after skill execution completes or fails, suitable for evaluating skill performance or handling specific skill error situations.
* **onHandoff**: The handoff point when an Agent transfers control to another Agent, suitable for monitoring processing flows and tracking task transfers in multi-Agent systems.

### Guide Rails

In AI applications, ensuring that Agent behavior meets expectations is crucial. Guide rail Agents act as gatekeepers, validating, transforming, or controlling message flow through the following mechanisms:

* Enforce safety rules and company policies
* Validate input and output according to business requirements
* Implement critical business logic validation
* Monitor and audit Agent behavior to ensure compliance

Each guide rail Agent can inspect input and expected output, and has the authority to abort processing and provide explanations when problems are found:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-create-guide-rail" exclude_imports
const financial = AIAgent.from({
  ...guideRailAgentOptions,
  instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
});
```

Apply guide rails to an Agent:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant that provides financial advice.",
  guideRails: [financial],
  inputKey: "message",
});
```

See how it protects users from inappropriate advice:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-invoke" exclude_imports
const result = await aigne.invoke(agent, {
  message: "What will be the price of Bitcoin next month?",
});
console.log(result);
// Output:
// {
//   "message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
// }
```

### Memory

Imagine an assistant that can remember all your past conversations - this is the power of AIGNE's memory feature. Agents can be configured with memory systems to store and retrieve historical interactions, which is crucial for maintaining coherent conversations or tasks that require historical context:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-enable-memory-for-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory(),
  inputKey: "message",
});
```

With memory, Agents can remember previous conversation content, providing more personalized and coherent experiences:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-enable-memory-invoke-1" exclude_imports
const result2 = await aigne.invoke(agent, {
  message: "What is my favorite cryptocurrency?",
});
console.log(result2);
// Output: { message: "Your favorite cryptocurrency is Bitcoin." }
```

### Skills

Just like humans can learn various skills, Agents can also "learn" and use other Agents or functions as skills, thereby expanding their capability range. An Agent can add multiple specialized skills and intelligently call them when needed:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-add-skills" exclude_imports
const getCryptoPrice = FunctionAgent.from({
  name: "get_crypto_price",
  description: "Get the current price of a cryptocurrency.",
  inputSchema: z.object({
    symbol: z.string().describe("The symbol of the cryptocurrency"),
  }),
  outputSchema: z.object({
    price: z.number().describe("The current price of the cryptocurrency"),
  }),
  process: async ({ symbol }) => {
    console.log(`Fetching price for ${symbol}`);
    return {
      price: 1000, // Mocked price
    };
  },
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  skills: [getCryptoPrice],
  inputKey: "message",
});
```

This skill composition mechanism enables Agents to break down complex tasks, delegating specialized work to dedicated sub-Agents, thus building more powerful intelligent systems.

### invoke Method

`invoke` is the main interface for calling Agents to execute tasks, supporting two powerful operation modes:

1. **Regular Mode** - Wait for the Agent to complete all processing and return the final result, suitable for scenarios that need to obtain complete answers at once:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-invoke" exclude_imports
const result = await agent.invoke({ message: "What is the price of ABT?" });
console.log(result);
// Output: { message: "ABT is currently priced at $1000." }
```

2. **Streaming Mode** - Allows Agents to return results incrementally in real-time, perfect for interactive scenarios that need immediate feedback, such as typing effects in chatbots:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-invoke-stream" exclude_imports
const stream = await agent.invoke(
  { message: "What is the price of ABT?" },
  { streaming: true },
);
let response = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk) && chunk.delta.text?.message)
    response += chunk.delta.text.message;
}
console.log(response);
// Output:  "ABT is currently priced at $1000."
```

### process Method

The `process` method is the core engine of every Agent. All subclasses must implement this method to define their unique processing logic. This is where the Agent's real "thinking" happens, and it can return various types of results:

* Regular object responses
* Streaming response sequences
* Async generators
* Another Agent instance (implementing processing transfer)

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-custom-process" exclude_imports
class CustomAgent extends Agent {
  override process(
    input: Message,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<Message>> {
    console.log("Custom agent processing input:", input);
    return {
      message: "AIGNE is a platform for building AI agents.",
    };
  }
}

const agent = new CustomAgent();

const result = await agent.invoke({ message: "What is the price of ABT?" });
console.log(result);
// Output: { message: "AIGNE is a platform for building AI agents." }
```

### shutdown Method

The `shutdown` method is used to gracefully shut down Agents and release resources. This is especially important in long-running applications to prevent memory leaks and resource exhaustion:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
});

await agent.shutdown();
```

Modern JavaScript environments also support automatic resource management through the `using` statement, making Agent usage more elegant:

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown-by-using" exclude_imports
await using agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
});
```

This way, regardless of the code execution path, the Agent will automatically shut down when the scope ends, ensuring resources are properly cleaned up.
