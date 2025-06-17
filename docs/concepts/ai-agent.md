<markdown>
# AI Agent Framework: Designing Intelligent Agents with Adaptive Tool Usage

The AI Agent Framework is designed to facilitate the creation of intelligent agents that leverage adaptive tool usage to enhance their functionality. This framework allows for creating AI-powered agents capable of processing inputs, generating responses, and executing specific functions within various domains. Typical usage scenarios include constructing conversational agents, dynamically adjusting to user requirements, and integrating real-world data retrieval processes.

## Basic AI Agent Initialization and Invocation

The foundational aspect of utilizing AI Agents involves creating an instance with the necessary model configurations and invoking it to perform tasks. The AI Agent leverages underlying language models to process and respond to inputs, aligning processing capabilities with contextual demands. In typical scenarios, the agent is initialized with a language model, and upon invocation, it provides processed outputs with specified messages extracted from the model's responses. This encapsulates the fundamental mechanism through which an AI Agent operates, effectively serving as a bridge between input queries and model-based intelligence outputs.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-basic-create-agent"
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

const agent = AIAgent.from({ model });
```

## Customizing AI Agent Instructions

Customizing instructions allows the AI Agent to adapt its responses according to a predefined style or format. This customization is achieved by integrating specific instructions at the agent initialization phase. The instructions can range from stylistic elements, such as speaking in Haikus, to more specialized command patterns. This flexibility in instruction customization enables developers to tailor agent responses sharply to suit the application context, enhancing the agent's alignment with user expectations and functional roles.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-create-agent"
const agent = AIAgent.from({
  model,
  instructions: "Only speak in Haikus.",
});
```

## Variable Instruction Templates

By incorporating variables into instruction templates, AI Agents gain the ability to dynamically adjust their communication styles based on runtime inputs. This capability enhances the adaptability of responses, allowing for fine-grained control over how the agent articulates information. The variables provide contextual placeholders that are populated at invocation time, facilitating an interactive customization experience. This dynamic templating approach is particularly advantageous in scenarios where response style needs to vary widely based on input conditions or user preferences.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-custom-instructions-with-variables-create-agent"
const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  instructions: "Only speak in {{style}}.",
});
```

## Structured Output Handling

The capability to manage structured outputs is pivotal for AI Agents in contexts where compact data representation is crucial. By defining output schemas, agents can deliver responses in structured formats, which is beneficial for scenarios demanding precise data extraction from the model's responses. This structured approach fosters improved data integration, as responses can be easily parsed and utilized within broader application workflows, enhancing the utility and integration of agent responses into technological ecosystems.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-structured-output-create-agent"
const agent = AIAgent.from({
  model,
  inputSchema: z.object({
    style: z.string().describe("The style of the response."),
  }),
  outputSchema: z.object({
    topic: z.string().describe("The topic of the request"),
    response: z.string().describe("The response to the request"),
  }),
  instructions: "Only speak in {{style}}."
});
```

## Integrating Functional Skills for Enhanced Responsiveness

Integrating functional skills into AI Agents expands their operational capabilities by allowing them to perform tasks beyond mere language processing. For example, integrating a weather retrieval skill enables the agent to fetch and report real-world data as a part of its response process. This skill integration enables agents to act as more versatile and responsive entities, able to execute complex, multi-faceted tasks that align with both command inputs and environmental data, thereby broadening the scope of applications and scenarios they can address effectively.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/ai-agent.test.ts" region="example-agent-with-skills-create-skill"
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
    return {
      temperature: 22,
      condition: "Sunny",
      humidity: 45,
    };
  },
});
```

In conclusion, the AI Agent Framework offers extensive capabilities for developing intelligent agents that can adapt to various requirements. From initial setup and instruction customization to dynamic templating and skill integration, each component works together to support complex scenarios and enhance responsiveness. Developers are encouraged to explore combinations of these functionalities to fully leverage the framework's flexibility, fostering the creation of highly specialized and responsive agents tailored specifically to their application's needs.

</markdown>