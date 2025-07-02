# agents/team-agent

## Enumerations

### ProcessMode

Defines the processing modes available for a TeamAgent.

The processing mode determines how the agents within a team are executed
and how their outputs are combined.

#### Enumeration Members

| Enumeration Member                   | Value          | Description                                                                                                                                                                                                                  |
| ------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="sequential"></a> `sequential` | `"sequential"` | Process the agents one by one, passing the output of each agent to the next. In sequential mode, agents execute in order, with each agent receiving the combined output from all previous agents as part of its input.       |
| <a id="parallel"></a> `parallel`     | `"parallel"`   | Process all agents in parallel, merging the output of all agents. In parallel mode, all agents execute simultaneously, each receiving the same initial input. Their outputs are then combined based on output key ownership. |

## Classes

### TeamAgent\<I, O\>

TeamAgent coordinates a group of agents working together to accomplish tasks.

A TeamAgent manages a collection of agents (its skills) and orchestrates their
execution according to a specified processing mode. It provides mechanisms for
agents to work either sequentially (one after another) or in parallel (all at once),
with appropriate handling of their outputs.

TeamAgent is particularly useful for:

- Creating agent workflows where output from one agent feeds into another
- Executing multiple agents simultaneously and combining their results
- Building complex agent systems with specialized components working together

#### Example

Here's an example of creating a sequential TeamAgent:

```ts
const translatorAgent = FunctionAgent.from({
  name: "translator",
  process: (input: Message) => ({
    translation: `${input.text} (translation)`,
  }),
});

const formatterAgent = FunctionAgent.from({
  name: "formatter",
  process: (input: Message) => ({
    formatted: `[formatted] ${input.translation || input.text}`,
  }),
});

// Create a sequential TeamAgent with specialized agents
const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, formatterAgent],
});

const result = await teamAgent.invoke({ text: "Hello world" });

console.log(result);
// Expected output: {
//   translation: "Hello world (translation)",
//   formatted: "[formatted] Hello world (translation)"
// }
```

#### Extends

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

#### Constructors

##### Constructor

> **new TeamAgent**\<`I`, `O`\>(`options`): [`TeamAgent`](#teamagent)\<`I`, `O`\>

Create a new TeamAgent instance.

###### Parameters

| Parameter | Type                                                | Description                             |
| --------- | --------------------------------------------------- | --------------------------------------- |
| `options` | [`TeamAgentOptions`](#teamagentoptions)\<`I`, `O`\> | Configuration options for the TeamAgent |

###### Returns

[`TeamAgent`](#teamagent)\<`I`, `O`\>

###### Overrides

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

##### tag

> **tag**: `string` = `"TeamAgent"`

###### Overrides

[`Agent`](agent.md#agent).[`tag`](agent.md#agent#tag)

##### mode

> **mode**: [`ProcessMode`](#processmode)

The processing mode that determines how agents in the team are executed.

This can be either sequential (one after another) or parallel (all at once).

##### iterateOn?

> `optional` **iterateOn**: keyof `I`

The input field key to iterate over when processing array inputs.

When set, this property enables the TeamAgent to process array values iteratively,
where each array element is processed individually through the team's agent workflow.
The accumulated results are returned via streaming response chunks.

###### See

TeamAgentOptions.iterateOn for detailed documentation

##### iterateWithPreviousOutput?

> `optional` **iterateWithPreviousOutput**: `boolean`

Controls whether to merge the output from each iteration back into the array items
for subsequent iterations when using `iterateOn`.

###### See

TeamAgentOptions.iterateWithPreviousOutput for detailed documentation

###### Default

```ts
false;
```

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`TeamAgent`](#teamagent)\<`I`, `O`\>

Create a TeamAgent from the provided options.

###### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

###### Parameters

| Parameter | Type                                                | Description                             |
| --------- | --------------------------------------------------- | --------------------------------------- |
| `options` | [`TeamAgentOptions`](#teamagentoptions)\<`I`, `O`\> | Configuration options for the TeamAgent |

###### Returns

[`TeamAgent`](#teamagent)\<`I`, `O`\>

A new TeamAgent instance

###### Examples

Here's an example of creating a sequential TeamAgent:

```ts
const translatorAgent = FunctionAgent.from({
  name: "translator",
  process: (input: Message) => ({
    translation: `${input.text} (translation)`,
  }),
});

const formatterAgent = FunctionAgent.from({
  name: "formatter",
  process: (input: Message) => ({
    formatted: `[formatted] ${input.translation || input.text}`,
  }),
});

// Create a sequential TeamAgent with specialized agents
const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, formatterAgent],
});

const result = await teamAgent.invoke({ text: "Hello world" });

console.log(result);
// Expected output: {
//   translation: "Hello world (translation)",
//   formatted: "[formatted] Hello world (translation)"
// }
```

Here's an example of creating a parallel TeamAgent:

```ts
const googleSearch = FunctionAgent.from({
  name: "google-search",
  process: (input: Message) => ({
    googleResults: `Google search results for ${input.query}`,
  }),
});

const braveSearch = FunctionAgent.from({
  name: "brave-search",
  process: (input: Message) => ({
    braveResults: `Brave search results for ${input.query}`,
  }),
});

const teamAgent = TeamAgent.from({
  name: "parallel-team",
  mode: ProcessMode.parallel,
  skills: [googleSearch, braveSearch],
});

const result = await teamAgent.invoke({ query: "AI news" });

console.log(result);
// Expected output: {
//   googleResults: "Google search results for AI news",
//   braveResults: "Brave search results for AI news"
// }
```

##### process()

> **process**(`input`, `options`): `PromiseOrValue`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

Process an input message by routing it through the team's agents.

Depending on the team's processing mode, this will either:

- In sequential mode: Pass input through each agent in sequence, with each agent
  receiving the combined output from previous agents
- In parallel mode: Process input through all agents simultaneously and combine their outputs

###### Parameters

| Parameter | Type                                                | Description            |
| --------- | --------------------------------------------------- | ---------------------- |
| `input`   | `I`                                                 | The message to process |
| `options` | [`AgentInvokeOptions`](agent.md#agentinvokeoptions) | The invocation options |

###### Returns

`PromiseOrValue`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

A stream of message chunks that collectively form the response

###### Overrides

[`Agent`](agent.md#agent).[`process`](agent.md#agent#process)

## Interfaces

### TeamAgentOptions\<I, O\>

Configuration options for creating a TeamAgent.

These options extend the base AgentOptions and add team-specific settings.

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

#### Properties

| Property                                                            | Type                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="mode"></a> `mode?`                                           | [`ProcessMode`](#processmode) | The method to process the agents in the team. **Default** `{ProcessMode.sequential}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| <a id="iterateon"></a> `iterateOn?`                                 | keyof `I`                     | Specifies which input field should be treated as an array for iterative processing. When this property is set, the TeamAgent will iterate over the array values in the specified input field, processing each element individually through the team's agents. The results from each iteration are accumulated and returned as a streaming response. This is particularly useful for batch processing scenarios where you need to apply the same agent workflow to multiple similar data items. **Remarks** - The specified field must contain an array or array-like value - Each array element should be an object that can be merged with the base input - Non-array values will be treated as single-element arrays - The processing results are streamed incrementally as each iteration completes |
| <a id="iteratewithpreviousoutput"></a> `iterateWithPreviousOutput?` | `boolean`                     | Controls whether to merge the output from each iteration back into the array items for subsequent iterations when using `iterateOn`. When set to `true`, the output from processing each array element is merged back into that element, making it available for the next iteration. This creates a cumulative effect where each iteration builds upon the results of previous ones. When set to `false` or undefined, each array element is processed independently without any cross-iteration data sharing. This is particularly useful for scenarios where: - You need to progressively enrich data across iterations - Later iterations depend on the results of earlier ones - You want to build a chain of transformations on array data **Default** `false`                                    |
