```markdown
# AIGNE Framework Agent Documentation: Design and Usage

The AIGNE framework offers a powerful paradigm for creating and managing AI agents, providing essential features like input/output validation, lifecycle hooks, and guide rail enforcement to enable robust, scalable multi-agent systems. Whether designing simple chatbots or complex, memory-rich agents, developers can leverage these capabilities to ensure operational efficiency, traceability, and adaptability across various domains and use cases.

## Creating a Basic AI Agent with Identifiable Characteristics

In the AIGNE framework, agents are the primary building blocks enabling complex behaviors through message handling and response processing. Each agent is endowed with a name and description, serving as its identity and purpose within the system. This foundational aspect is crucial for documenting, logging, and managing agents in large multi-agent systems. Developers can assign meaningful names and descriptions to agents to enhance system traceability and maintenance.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-basic-info"
const chatbot = AIAgent.from({
  name: "chatbot",
  description: "A chatbot that answers questions."
});
```

## Constructing Input and Output Schemas for AI Agents

AI Agents in the AIGNE framework can define input and output schemas using the Zod library. These schemas serve the primary purpose of validating data formats and ensuring that the received inputs and produced outputs conform to expected structures. This feature is pivotal for maintaining data integrity and facilitating debugging tasks in complex agent-based systems. Through the reliable enforcement of data schemas, agents can process structured data effectively while minimizing runtime errors.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-input-output-schema"
const textAnalyzer = AIAgent.from({
  inputSchema: z.object({
    text: z.string().describe("The text content to analyze"),
  }),
  outputSchema: z.object({
    summary: z.string().describe("A concise summary of the text"),
    points: z.array(z.string()).describe("List of important points from the text"),
    sentiment: z
      .enum(["positive", "neutral", "negative"])
      .describe("Overall sentiment of the text"),
  }),
});
```

## Implementing Lifecycle Hooks in AI Agents

Lifecycle hooks in AIGNE agents provide a structured mechanism to intercept various points during an agent's execution. These hooks allow developers to inject custom behaviors such as logging, monitoring, and error handling without altering the core processing logic. Hooks enhance the flexibility and observability of agent operations, supporting integration with external systems for improved diagnostics and operational insights.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-hooks"
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

## Integrating Guide Rail Agents for Policy Enforcement

Guide Rail agents are specialized roles within the AIGNE framework designed to enforce rules and safety policies on agent communications. They perform input/output validation and business logic checks to ensure adherence to specified constraints. Guide Rail agents can abort processes if violations are detected, facilitating robust error handling and policy enforcement across agent interactions. This integration is crucial for maintaining the integrity and security of operations within sensitive application domains.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-create-guide-rail"
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

## Enabling Memory for Persistent Information in Agents

Memory integration within AIGNE agents allows them to retain and utilize past interactions, enabling personalized and context-aware responses. Through memory agents, information such as user preferences or historical data can be stored and retrieved, creating more intelligent and adaptive agent behaviors. This capability is essential for developing agents that require long-term context retention and dynamic interaction capabilities.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-enable-memory-for-agent"
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory(),
});
```

## Adding Skills to Enhance Agent Capabilities

Skills in AIGNE agents allow for modular and extendable functionalities, where an agent can delegate specific tasks to other agents or functions. Each skill encapsulates a particular ability, such as fetching data or performing specialized calculations, effectively broadening the agent's capabilities. By employing a skill-based architecture, agents can leverage reusable components, improving both efficiency and scalability within the multi-agent system.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-add-skills"
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
});
```

## Seamless Invocation of Agents for Tasks

Agents in the AIGNE framework can be invoked to perform tasks based on provided input data, either in regular or streaming mode. The invocation process can handle complex queries and return structured responses, making it suitable for real-time applications. This operational flexibility allows developers to efficiently manage and execute agent tasks in diverse scenarios, from simple queries to intricate, long-running processes.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-invoke"
spyOn(agent.model, "process").mockReturnValueOnce({
  text: "ABT is currently priced at $1000.",
});

const result = await agent.invoke("What is the price of ABT?");
console.log(result);
// Output: { $message: "ABT is currently priced at $1000." }
expect(result).toEqual({ $message: "ABT is currently priced at $1000." });
```

## Developing Custom Agents with Specialized Processing Logic

Custom agents in the AIGNE framework are designed by extending the base Agent class, providing flexibility for implementing tailored processing logic. This capability fosters innovation, allowing developers to craft agents that fulfill unique requirements or domain-specific functions. Custom agents enable the creation of highly specialized and optimized solutions that align seamlessly with the overarching agent system.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-custom-process"
class CustomAgent extends Agent {
  override process(
    input: Message,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<Message>> {
    console.log("Custom agent processing input:", input);
    return {
      $message: "AIGNE is a platform for building AI agents.",
    };
  }
}

const agent = new CustomAgent();

const result = await agent.invoke("What is the price of ABT?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
expect(result).toEqual({ $message: "AIGNE is a platform for building AI agents." });
```

## Graceful Agent Shutdown for Resource Management

Agents in the AIGNE framework can be gracefully shut down to release resources and prevent memory leaks. This process involves unsubscribing from message topics and cleaning up memory usage, ensuring that the system maintains optimal performance and stability. Proper shutdown mechanisms are particularly significant in environments with high concurrency and resource constraints.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown"
await agent.shutdown();
```

## Utilizing 'using' Statement for Automatic Agent Disposal

The 'using' statement in the AIGNE framework simplifies resource management by allowing the automatic disposal of agents. It provides a syntactical construct to ensure that agent instances are correctly shut down after use, promoting modern resource management practices and reducing the likelihood of resource leaks in agent-intensive applications.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown-by-using"
await using agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
});

expect(agent).toBeInstanceOf(AIAgent);
```

In summary, this documentation provides a comprehensive guide across multiple aspects of the AIGNE framework, from establishing basic characteristics and input/output schemas to advanced functionalities like Guide Rail integration, memory usage, and agent skills. By understanding and applying these features, developers are empowered to construct diverse AI systems that are efficient, maintainable, and adaptable, meeting specialized needs while maintaining strong overall architecture.
```