[Documentation](../../../README.md) / [@aigne/core](../README.md) / agents/ai-agent

# agents/ai-agent

## Enumerations

### AIAgentToolChoice

Tool choice options for AI agents

Controls how the agent decides to use tools during execution

#### Enumeration Members

| Enumeration Member               | Value        | Description                                      |
| -------------------------------- | ------------ | ------------------------------------------------ |
| <a id="auto"></a> `auto`         | `"auto"`     | Let the model decide when to use tools           |
| <a id="none"></a> `none`         | `"none"`     | Disable tool usage                               |
| <a id="required"></a> `required` | `"required"` | Force tool usage                                 |
| <a id="router"></a> `router`     | `"router"`   | Choose exactly one tool and route directly to it |

## Classes

### AIAgent\<I, O\>

AI-powered agent that leverages language models

AIAgent connects to language models to process inputs and generate responses,
with support for streaming, function calling, and tool usage.

Key features:

- Connect to any language model
- Use customizable instructions and prompts
- Execute tools/function calls
- Support streaming responses
- Router mode for specialized agents

#### Example

Basic AIAgent creation:

```ts
// Create a simple AIAgent with minimal configuration
const model = new OpenAIChatModel();

spyOn(model, "process").mockReturnValueOnce(
  Promise.resolve(stringToAgentResponseStream("Hello, How can I help you?")),
);

const agent = AIAgent.from({
  model,
  name: "assistant",
  description: "A helpful assistant",
});

const result = await agent.invoke("What is the weather today?");

expect(result).toEqual({ $message: "Hello, How can I help you?" });

console.log(result); // Expected output: { $message: "Hello, How can I help you?" }
```

#### Extends

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  | Description                               |
| ------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The output message type the agent returns |

#### Constructors

##### Constructor

> **new AIAgent**\<`I`, `O`\>(`options`): [`AIAgent`](#aiagent)\<`I`, `O`\>

Create an AIAgent instance

###### Parameters

| Parameter | Type                                            | Description                            |
| --------- | ----------------------------------------------- | -------------------------------------- |
| `options` | [`AIAgentOptions`](#aiagentoptions)\<`I`, `O`\> | Configuration options for the AI agent |

###### Returns

[`AIAgent`](#aiagent)\<`I`, `O`\>

###### Overrides

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

| Property                                                  | Type                                                                                                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Inherited from                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| <a id="description"></a> `description?`                   | `string`                                                                                                                                                                                                         | Description of the agent's purpose and capabilities Useful for documentation and when agents need to understand each other's roles in a multi-agent system                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [`Agent`](agent.md#agent).[`description`](agent.md#agent#description)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <a id="includeinputinoutput"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                                                                        | Whether to include the original input in the output When true, the agent will merge input fields into the output object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | [`Agent`](agent.md#agent).[`includeInputInOutput`](agent.md#agent#includeinputinoutput)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <a id="instructions"></a> `instructions`                  | `PromptBuilder`                                                                                                                                                                                                  | Instructions for the language model Contains system messages, user templates, and other prompt elements that guide the model's behavior **Example** Custom prompt builder: `const model = new OpenAIChatModel(); spyOn(model, "process").mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Is there any message on the screen?"))); // Create a custom prompt template const systemMessage = SystemMessageTemplate.from("You are a technical support specialist."); const userMessage = UserMessageTemplate.from("Please help me troubleshoot this issue: {{issue}}"); const promptTemplate = ChatMessagesTemplate.from([systemMessage, userMessage]); // Create a PromptBuilder with the template const promptBuilder = new PromptBuilder({ instructions: promptTemplate, }); // Create an AIAgent with the custom PromptBuilder const agent = AIAgent.from({ model, name: "support", description: "Technical support specialist", instructions: promptBuilder, }); const result = await agent.invoke({ issue: "My computer won't start." }); expect(result).toEqual({ $message: "Is there any message on the screen?" }); console.log(result); // Expected output: { $message: "Is there any message on the screen?" }` | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <a id="memory"></a> `memory?`                             | `AgentMemory`                                                                                                                                                                                                    | Agent's memory instance for storing conversation history When enabled, allows the agent to remember past interactions and use them for context in future processing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | [`Agent`](agent.md#agent).[`memory`](agent.md#agent#memory)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <a id="model"></a> `model?`                               | [`ChatModel`](../models/chat-model.md#chatmodel)                                                                                                                                                                 | The language model used by this agent If not set on the agent, the model from the context will be used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <a id="name"></a> `name`                                  | `string`                                                                                                                                                                                                         | Name of the agent, used for identification and logging Defaults to the class constructor name if not specified in options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | [`Agent`](agent.md#agent).[`name`](agent.md#agent#name)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <a id="outputkey"></a> `outputKey?`                       | `string`                                                                                                                                                                                                         | Custom key to use for text output in the response **Example** Setting a custom output key: `const model = new OpenAIChatModel(); spyOn(model, "process").mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Hello, How can I help you?"))); // Create an AIAgent with a custom output key const agent = AIAgent.from({ model, outputKey: "greeting", }); const result = await agent.invoke("What is the weather today?"); expect(result).toEqual({ greeting: "Hello, How can I help you?" }); console.log(result); // Expected output: { greeting: "Hello, How can I help you?" }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <a id="publishtopic"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>                                                                                                                                       | Topics the agent publishes to for sending messages Can be a string, array of strings, or a function that determines topics based on the output                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [`Agent`](agent.md#agent).[`publishTopic`](agent.md#agent#publishtopic)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <a id="skills"></a> `skills`                              | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>; \} | Collection of skills (other agents) this agent can use Skills can be accessed by name or by array index, allowing the agent to delegate tasks to specialized sub-agents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | [`Agent`](agent.md#agent).[`skills`](agent.md#agent#skills)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <a id="subscribetopic"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                                                                    | Topics the agent subscribes to for receiving messages Can be a single topic string or an array of topic strings                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | [`Agent`](agent.md#agent).[`subscribeTopic`](agent.md#agent#subscribetopic)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <a id="toolchoice"></a> `toolChoice?`                     | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`AIAgentToolChoice`](#aiagenttoolchoice)                                                                           | Controls how the agent uses tools during execution **Examples** Automatic tool choice: `const model = new OpenAIChatModel(); // Create function agents to serve as tools const calculator = FunctionAgent.from({ name: "calculator", inputSchema: z.object({ a: z.number(), b: z.number(), operation: z.enum(["add", "subtract", "multiply", "divide"]), }), outputSchema: z.object({ result: z.union([z.number(), z.string()]), }), process: ({ a, b, operation }: { a: number; b: number; operation: string; }) => { let result: number                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | string; switch (operation) { case "add": result = a + b; break; case "subtract": result = a - b; break; case "multiply": result = a \* b; break; case "divide": result = a / b; break; default: result = "Unknown operation"; } return { result }; }, }); const weatherService = FunctionAgent.from({ name: "weather", inputSchema: z.object({ location: z.string(), }), outputSchema: z.object({ forecast: z.string(), }), process: ({ location }: { location: string; }) => { return { forecast: `Weather forecast for ${location}: Sunny, 75°F`, }; }, }); // Create an AIAgent that can use tools automatically const agent = AIAgent.from({ model, name: "assistant", description: "A helpful assistant with tool access", toolChoice: AIAgentToolChoice.auto, // Let the model decide when to use tools skills: [calculator, weatherService], }); spyOn(model, "process") .mockReturnValueOnce(Promise.resolve({ toolCalls: [createToolCallResponse("weather", { location: "San Francisco" })], })) .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Weather forecast for San Francisco: Sunny, 75°F"))); const result1 = await agent.invoke("What is the weather in San Francisco?"); expect(result1).toEqual({ $message: "Weather forecast for San Francisco: Sunny, 75°F" }); console.log(result1); // Expected output: { $message: "Weather forecast for San Francisco: Sunny, 75°F" } spyOn(model, "process") .mockReturnValueOnce(Promise.resolve({ toolCalls: [createToolCallResponse("calculator", { a: 5, b: 3, operation: "add" })], })) .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("The result of 5 + 3 is 8"))); const result2 = await agent.invoke("Calculate 5 + 3"); expect(result2).toEqual({ $message: "The result of 5 + 3 is 8" }); console.log(result2); // Expected output: { $message: "The result of 5 + 3 is 8" }`Router tool choice:`const model = new OpenAIChatModel(); // Create specialized function agents const weatherAgent = FunctionAgent.from({ name: "weather", inputSchema: z.object({ location: z.string(), }), outputSchema: z.object({ forecast: z.string(), }), process: ({ location }: { location: string; }) => ({ forecast: `Weather in ${location}: Sunny, 75°F`, }), }); const translator = FunctionAgent.from({ name: "translator", inputSchema: z.object({ text: z.string(), language: z.string(), }), outputSchema: z.object({ translation: z.string(), }), process: ({ text, language }: { text: string; language: string; }) => ({ translation: `Translated ${text} to ${language}`, }), }); // Create an AIAgent with router tool choice const agent = AIAgent.from({ model, name: "router-assistant", description: "Assistant that routes to specialized agents", toolChoice: AIAgentToolChoice.router, // Use the router mode skills: [weatherAgent, translator], }); spyOn(model, "process").mockReturnValueOnce(Promise.resolve({ toolCalls: [createToolCallResponse("weather", { location: "San Francisco" })], })); const result = await agent.invoke("What's the weather in San Francisco?"); expect(result).toEqual({ forecast: "Weather in San Francisco: Sunny, 75°F" }); console.log(result); // Expected output: { forecast: "Weather in San Francisco: Sunny, 75°F" }` | -   |

#### Accessors

##### inputSchema

###### Get Signature

> **get** **inputSchema**(): `ZodType`\<`I`\>

Get the input data schema for this agent

Used to validate that input messages conform to required format
If no input schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`I`\>

The Zod type definition for input data

###### Inherited from

[`Agent`](agent.md#agent).[`inputSchema`](agent.md#agent#inputschema)

##### isInvokable

###### Get Signature

> **get** **isInvokable**(): `boolean`

Check if the agent is invokable

An agent is invokable if it has implemented the process method

###### Returns

`boolean`

###### Inherited from

[`Agent`](agent.md#agent).[`isInvokable`](agent.md#agent#isinvokable)

##### outputSchema

###### Get Signature

> **get** **outputSchema**(): `ZodType`\<`O`\>

Get the output data schema for this agent

Used to validate that output messages conform to required format
If no output schema is set, returns an empty object schema by default

###### Returns

`ZodType`\<`O`\>

The Zod type definition for output data

###### Inherited from

[`Agent`](agent.md#agent).[`outputSchema`](agent.md#agent#outputschema)

##### topic

###### Get Signature

> **get** **topic**(): `string`

Default topic this agent subscribes to

Each agent has a default topic in the format "$agent\_[agent name]"
The agent automatically subscribes to this topic to receive messages

###### Returns

`string`

The default topic string

###### Inherited from

[`Agent`](agent.md#agent).[`topic`](agent.md#agent#topic)

#### Methods

##### \_processRouter()

> `protected` **\_processRouter**(`input`, `model`, `modelInput`, `context`, `toolsMap`): [`AgentProcessAsyncGenerator`](agent.md#agentprocessasyncgenerator)\<`O`\>

Process router mode requests

In router mode, the agent sends a single request to the model to determine
which tool to use, then routes the request directly to that tool

###### Parameters

| Parameter    | Type                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `input`      | `I`                                                                                                          |
| `model`      | [`ChatModel`](../models/chat-model.md#chatmodel)                                                             |
| `modelInput` | [`ChatModelInput`](../models/chat-model.md#chatmodelinput)                                                   |
| `context`    | [`Context`](../aigne.md#context)                                                                             |
| `toolsMap`   | `Map`\<`string`, [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>\> |

###### Returns

[`AgentProcessAsyncGenerator`](agent.md#agentprocessasyncgenerator)\<`O`\>

##### \[asyncDispose\]()

> **\[asyncDispose\]**(): `Promise`\<`void`\>

Async dispose method for shutdown the agent

###### Returns

`Promise`\<`void`\>

###### Example

Here's an example of shutting down an agent by using statement:

```ts
class MyAgent extends Agent {
  override process(input: Message): Message {
    return { text: `Hello, ${input}` };
  }
  override async shutdown() {
    console.log("Agent is shutting down...");
    // Clean up resources, close connections, etc.
  }
}

// agent will be automatically disposed of at the end of this block
await using agent = new MyAgent();

const shutdown = spyOn(agent, "shutdown");

expect(shutdown).not.toHaveBeenCalled();
```

###### Inherited from

[`Agent`](agent.md#agent).[`[asyncDispose]`](agent.md#agent#asyncdispose)

##### \[custom\]()

> **\[custom\]**(): `string`

Custom object inspection behavior

When using Node.js's util.inspect function to inspect an agent,
only the agent's name will be shown, making output more concise

###### Returns

`string`

Agent name

###### Inherited from

[`Agent`](agent.md#agent).[`[custom]`](agent.md#agent#custom)

##### addSkill()

> **addSkill**(...`skills`): `void`

Add skills (other agents or functions) to this agent

Skills allow agents to reuse functionality from other agents,
building more complex behaviors.

###### Parameters

| Parameter   | Type                                                                                                                                                           | Description                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| ...`skills` | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills to add, can be Agent instances or functions |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`addSkill`](agent.md#agent#addskill)

##### attach()

> **attach**(`context`): `void`

Attach agent to context:

- Subscribe to topics and invoke process method when messages are received
- Subscribe to memory topics if memory is enabled

Agents can receive messages and respond through the topic subscription system,
enabling inter-agent communication.

###### Parameters

| Parameter | Type                                                      | Description          |
| --------- | --------------------------------------------------------- | -------------------- |
| `context` | `Pick`\<[`Context`](../aigne.md#context), `"subscribe"`\> | Context to attach to |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`attach`](agent.md#agent#attach)

##### checkAgentInvokesUsage()

> `protected` **checkAgentInvokesUsage**(`context`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

###### Inherited from

[`Agent`](agent.md#agent).[`checkAgentInvokesUsage`](agent.md#agent#checkagentinvokesusage)

##### invoke()

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<`O`\>

Invoke the agent with regular (non-streaming) response

Regular mode waits for the agent to complete processing and return the final result,
suitable for scenarios where a complete result is needed at once.

###### Parameters

| Parameter  | Type                                                                               | Description                                                      |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `input`    | `string` \| `I`                                                                    | Input message to the agent, can be a string or structured object |
| `context?` | [`Context`](../aigne.md#context)                                                   | Execution context, providing environment and resource access     |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) & \{ `streaming?`: `false`; \} | Invocation options, must set streaming to false or leave unset   |

###### Returns

`Promise`\<`O`\>

Final JSON response

###### Example

Here's an example of invoking an agent with regular mode:

```ts
// Create a chat model
const model = new OpenAIChatModel();

spyOn(model, "process").mockReturnValueOnce(
  Promise.resolve(
    stringToAgentResponseStream("Hello, How can I assist you today?"),
  ),
);

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

// Create an Agent instance
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

// Invoke the agent
const result = await aigne.invoke(agent, "hello");

console.log(result); // Output: { $message: "Hello, How can I assist you today?" }

expect(result).toEqual({ $message: "Hello, How can I assist you today?" });
```

###### Inherited from

[`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke)

###### Call Signature

> **invoke**(`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<`O`\>\>

Invoke the agent with streaming response

Streaming responses allow the agent to return results incrementally,
suitable for scenarios requiring real-time progress updates, such as
chat bot typing effects.

###### Parameters

| Parameter           | Type                                            | Description                                                      |
| ------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| `input`             | `string` \| `I`                                 | Input message to the agent, can be a string or structured object |
| `context`           | `undefined` \| [`Context`](../aigne.md#context) | Execution context, providing environment and resource access     |
| `options`           | \{ `streaming`: `true`; \}                      | Invocation options, must set streaming to true for this overload |
| `options.streaming` | `true`                                          | -                                                                |

###### Returns

`Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<`O`\>\>

Streaming response object

###### Example

Here's an example of invoking an agent with streaming response:

```ts
// Create a chat model
const model = new OpenAIChatModel();

spyOn(model, "process").mockReturnValueOnce(
  Promise.resolve(
    stringToAgentResponseStream("Hello, How can I assist you today?"),
  ),
);

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

// Create an Agent instance
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

// Invoke the agent with streaming enabled
const stream = await aigne.invoke(agent, "hello", { streaming: true });

const chunks: string[] = [];

// Read the stream using an async iterator
for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.$message;
  if (text) {
    chunks.push(text);
  }
}

console.log(chunks); // Output: ["Hello", ",", " ", "How", " ", "can", " ", "I", " ", "assist", " ", "you", " ", "today", "?"]

expect(chunks).toMatchSnapshot();
```

###### Inherited from

[`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke)

###### Call Signature

> **invoke**(`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<`O`\>\>

General signature for invoking the agent

Returns either streaming or regular response based on the streaming parameter in options

###### Parameters

| Parameter  | Type                                                | Description                |
| ---------- | --------------------------------------------------- | -------------------------- |
| `input`    | `string` \| `I`                                     | Input message to the agent |
| `context?` | [`Context`](../aigne.md#context)                    | Execution context          |
| `options?` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | Invocation options         |

###### Returns

`Promise`\<[`AgentResponse`](agent.md#agentresponse)\<`O`\>\>

Agent response (streaming or regular)

###### Inherited from

[`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke)

##### postprocess()

> `protected` **postprocess**(`input`, `output`, `context`): `void`

Post-processing operations after handling output

Operations performed after the agent produces output, including:

- Checking context status
- Adding interaction records to memory

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `input`   | `I`                              | Input message     |
| `output`  | `O`                              | Output message    |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`postprocess`](agent.md#agent#postprocess)

##### preprocess()

> `protected` **preprocess**(`_`, `context`): `void`

Pre-processing operations before handling input

Preparatory work done before executing the agent's main processing logic, including:

- Checking context status
- Verifying invocation limits

###### Parameters

| Parameter | Type                             | Description            |
| --------- | -------------------------------- | ---------------------- |
| `_`       | `I`                              | Input message (unused) |
| `context` | [`Context`](../aigne.md#context) | Execution context      |

###### Returns

`void`

###### Inherited from

[`Agent`](agent.md#agent).[`preprocess`](agent.md#agent#preprocess)

##### process()

> `protected` **process**(`input`, `context`): [`AgentProcessAsyncGenerator`](agent.md#agentprocessasyncgenerator)\<`O`\>

Process an input message and generate a response

###### Parameters

| Parameter | Type                             |
| --------- | -------------------------------- |
| `input`   | `I`                              |
| `context` | [`Context`](../aigne.md#context) |

###### Returns

[`AgentProcessAsyncGenerator`](agent.md#agentprocessasyncgenerator)\<`O`\>

###### Overrides

[`Agent`](agent.md#agent).[`process`](agent.md#agent#process)

##### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Shut down the agent and clean up resources

Primarily used to clean up memory and other resources to prevent memory leaks

###### Returns

`Promise`\<`void`\>

###### Examples

Here's an example of shutting down an agent:

```ts
class MyAgent extends Agent {
  override process(input: Message): Message {
    return { text: `Hello, ${input}` };
  }
  override async shutdown() {
    console.log("Agent is shutting down...");
    // Clean up resources, close connections, etc.
  }
}

const agent = new MyAgent();

const shutdown = spyOn(agent, "shutdown");

await agent.shutdown();

expect(shutdown).toHaveBeenCalled();
```

Here's an example of shutting down an agent by using statement:

```ts
class MyAgent extends Agent {
  override process(input: Message): Message {
    return { text: `Hello, ${input}` };
  }
  override async shutdown() {
    console.log("Agent is shutting down...");
    // Clean up resources, close connections, etc.
  }
}

// agent will be automatically disposed of at the end of this block
await using agent = new MyAgent();

const shutdown = spyOn(agent, "shutdown");

expect(shutdown).not.toHaveBeenCalled();
```

###### Inherited from

[`Agent`](agent.md#agent).[`shutdown`](agent.md#agent#shutdown)

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`AIAgent`](#aiagent)\<`I`, `O`\>

Create an AIAgent with the specified options

Factory method that provides a convenient way to create new AI agents

###### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

###### Parameters

| Parameter | Type                                            | Description                            |
| --------- | ----------------------------------------------- | -------------------------------------- |
| `options` | [`AIAgentOptions`](#aiagentoptions)\<`I`, `O`\> | Configuration options for the AI agent |

###### Returns

[`AIAgent`](#aiagent)\<`I`, `O`\>

A new AIAgent instance

###### Example

AI agent with custom instructions:

```ts
const model = new OpenAIChatModel();

spyOn(model, "process").mockReturnValueOnce(
  Promise.resolve(stringToAgentResponseStream("10 factorial is 3628800.")),
);

// Create an AIAgent with custom instructions
const agent = AIAgent.from({
  model,
  name: "tutor",
  description: "A math tutor",
  instructions:
    "You are a math tutor who helps students understand concepts clearly.",
});

const result = await agent.invoke("What is 10 factorial?");

expect(result).toEqual({ $message: "10 factorial is 3628800." });

console.log(result); // Expected output: { $message: "10 factorial is 3628800." }
```

## Interfaces

### AIAgentOptions\<I, O\>

Configuration options for an AI Agent

These options extend the base agent options with AI-specific parameters
like model configuration, prompt instructions, and tool choice.

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  | Description                               |
| ------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The output message type the agent returns |

#### Properties

| Property                                                    | Type                                                                                                                                                           | Description                                                                                                                                           | Inherited from                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="description-1"></a> `description?`                   | `string`                                                                                                                                                       | Description of the agent A human-readable description of what the agent does, useful for documentation and debugging                                  | [`AgentOptions`](agent.md#agentoptions).[`description`](agent.md#agentoptions#description-2)                   |
| <a id="disableevents"></a> `disableEvents?`                 | `boolean`                                                                                                                                                      | Whether to disable emitting events for agent actions When true, the agent won't emit events like agentStarted, agentSucceed, or agentFailed           | [`AgentOptions`](agent.md#agentoptions).[`disableEvents`](agent.md#agentoptions#disableevents)                 |
| <a id="includeinputinoutput-1"></a> `includeInputInOutput?` | `boolean`                                                                                                                                                      | Whether to include input in the output When true, the agent will merge input fields into the output object                                            | [`AgentOptions`](agent.md#agentoptions).[`includeInputInOutput`](agent.md#agentoptions#includeinputinoutput-2) |
| <a id="inputschema-1"></a> `inputSchema?`                   | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`I`\>                                                                                             | Zod schema defining the input message structure Used to validate that input messages conform to the expected format                                   | [`AgentOptions`](agent.md#agentoptions).[`inputSchema`](agent.md#agentoptions#inputschema-2)                   |
| <a id="instructions-1"></a> `instructions?`                 | `string` \| `PromptBuilder`                                                                                                                                    | Instructions to guide the AI model's behavior Can be a simple string or a full PromptBuilder instance for more complex prompt templates               | -                                                                                                              |
| <a id="memory-1"></a> `memory?`                             | `boolean` \| `AgentMemory` \| `AgentMemoryOptions`                                                                                                             | Memory configuration for the agent Can be an AgentMemory instance, configuration options, or simply a boolean to enable/disable with default settings | [`AgentOptions`](agent.md#agentoptions).[`memory`](agent.md#agentoptions#memory-2)                             |
| <a id="model-1"></a> `model?`                               | [`ChatModel`](../models/chat-model.md#chatmodel)                                                                                                               | The language model to use for this agent If not provided, the agent will use the model from the context                                               | -                                                                                                              |
| <a id="name-1"></a> `name?`                                 | `string`                                                                                                                                                       | Name of the agent Used for identification and logging. Defaults to the constructor name if not specified                                              | [`AgentOptions`](agent.md#agentoptions).[`name`](agent.md#agentoptions#name-2)                                 |
| <a id="outputkey-1"></a> `outputKey?`                       | `string`                                                                                                                                                       | Custom key to use for text output in the response Defaults to $message if not specified                                                               | -                                                                                                              |
| <a id="outputschema-1"></a> `outputSchema?`                 | [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<`O`\>                                                                                             | Zod schema defining the output message structure Used to validate that output messages conform to the expected format                                 | [`AgentOptions`](agent.md#agentoptions).[`outputSchema`](agent.md#agentoptions#outputschema-2)                 |
| <a id="publishtopic-1"></a> `publishTopic?`                 | [`PublishTopic`](agent.md#publishtopic-4)\<`O`\>                                                                                                               | Topics the agent should publish to These topics determine where the agent's output messages will be sent in the system                                | [`AgentOptions`](agent.md#agentoptions).[`publishTopic`](agent.md#agentoptions#publishtopic-2)                 |
| <a id="skills-1"></a> `skills?`                             | ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[] | List of skills (other agents or functions) this agent has These skills can be used by the agent to delegate tasks or extend its capabilities          | [`AgentOptions`](agent.md#agentoptions).[`skills`](agent.md#agentoptions#skills-2)                             |
| <a id="subscribetopic-1"></a> `subscribeTopic?`             | [`SubscribeTopic`](agent.md#subscribetopic-4)                                                                                                                  | Topics the agent should subscribe to These topics determine which messages the agent will receive from the system                                     | [`AgentOptions`](agent.md#agentoptions).[`subscribeTopic`](agent.md#agentoptions#subscribetopic-2)             |
| <a id="toolchoice-1"></a> `toolChoice?`                     | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`AIAgentToolChoice`](#aiagenttoolchoice)                         | Controls how the agent uses tools during execution **Default** `AIAgentToolChoice.auto`                                                               | -                                                                                                              |

## Variables

### aiAgentOptionsSchema

> `const` **aiAgentOptionsSchema**: `ZodObject`\<\{ `description?`: `ZodType`\<`undefined` \| `string`, `ZodTypeDef`, `undefined` \| `string`\>; `disableEvents?`: `ZodType`\<`undefined` \| `boolean`, `ZodTypeDef`, `undefined` \| `boolean`\>; `includeInputInOutput?`: `ZodType`\<`undefined` \| `boolean`, `ZodTypeDef`, `undefined` \| `boolean`\>; `inputSchema?`: `ZodType`\<`undefined` \| [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`Message`](agent.md#message)\>, `ZodTypeDef`, `undefined` \| [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`Message`](agent.md#message)\>\>; `memory?`: `ZodType`\<`undefined` \| `boolean` \| `AgentMemory` \| `AgentMemoryOptions`, `ZodTypeDef`, `undefined` \| `boolean` \| `AgentMemory` \| `AgentMemoryOptions`\>; `name?`: `ZodType`\<`undefined` \| `string`, `ZodTypeDef`, `undefined` \| `string`\>; `outputSchema?`: `ZodType`\<`undefined` \| [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`Message`](agent.md#message)\>, `ZodTypeDef`, `undefined` \| [`AgentInputOutputSchema`](agent.md#agentinputoutputschema)\<[`Message`](agent.md#message)\>\>; `publishTopic?`: `ZodType`\<`undefined` \| [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>, `ZodTypeDef`, `undefined` \| [`PublishTopic`](agent.md#publishtopic-4)\<[`Message`](agent.md#message)\>\>; `skills?`: `ZodType`\<`undefined` \| ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[], `ZodTypeDef`, `undefined` \| ([`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| [`FunctionAgentFn`](agent.md#functionagentfn)\<`any`, `any`\>)[]\>; `subscribeTopic?`: `ZodType`\<`undefined` \| [`SubscribeTopic`](agent.md#subscribetopic-4), `ZodTypeDef`, `undefined` \| [`SubscribeTopic`](agent.md#subscribetopic-4)\>; \} & \{ `instructions`: `ZodOptional`\<`ZodUnion`\<\[`ZodString`, `ZodType`\<`PromptBuilder`, `ZodTypeDef`, `PromptBuilder`\>\]\>\>; `model`: `ZodOptional`\<`ZodType`\<[`ChatModel`](../models/chat-model.md#chatmodel), `ZodTypeDef`, [`ChatModel`](../models/chat-model.md#chatmodel)\>\>; `outputKey`: `ZodOptional`\<`ZodString`\>; `toolChoice`: `ZodOptional`\<`ZodUnion`\<\[`ZodLiteral`\<`"auto"`\>, `ZodLiteral`\<`"none"`\>, `ZodLiteral`\<`"required"`\>, `ZodLiteral`\<`"router"`\>, `ZodType`\<[`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>, `ZodTypeDef`, [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>\>\]\>\>; \}, `UnknownKeysParam`, `ZodTypeAny`, \{ `description?`: `unknown`; `disableEvents?`: `unknown`; `includeInputInOutput?`: `unknown`; `inputSchema?`: `unknown`; `instructions?`: `string` \| `PromptBuilder`; `memory?`: `unknown`; `model?`: [`ChatModel`](../models/chat-model.md#chatmodel); `name?`: `unknown`; `outputKey?`: `string`; `outputSchema?`: `unknown`; `publishTopic?`: `unknown`; `skills?`: `unknown`; `subscribeTopic?`: `unknown`; `toolChoice?`: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| `"auto"` \| `"none"` \| `"required"` \| `"router"`; \}, \{ `description?`: `unknown`; `disableEvents?`: `unknown`; `includeInputInOutput?`: `unknown`; `inputSchema?`: `unknown`; `instructions?`: `string` \| `PromptBuilder`; `memory?`: `unknown`; `model?`: [`ChatModel`](../models/chat-model.md#chatmodel); `name?`: `unknown`; `outputKey?`: `string`; `outputSchema?`: `unknown`; `publishTopic?`: `unknown`; `skills?`: `unknown`; `subscribeTopic?`: `unknown`; `toolChoice?`: [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> \| `"auto"` \| `"none"` \| `"required"` \| `"router"`; \}\>

Zod schema for validating AIAgentOptions

Extends the base agent options schema with AI-specific parameters

---

### aiAgentToolChoiceSchema

> `const` **aiAgentToolChoiceSchema**: `ZodUnion`\<\[`ZodLiteral`\<`"auto"`\>, `ZodLiteral`\<`"none"`\>, `ZodLiteral`\<`"required"`\>, `ZodLiteral`\<`"router"`\>, `ZodType`\<[`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>, `ZodTypeDef`, [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\>\>\]\>

Zod schema for validating AIAgentToolChoice values

Used to ensure that toolChoice receives valid values
