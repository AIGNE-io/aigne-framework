# orchestrator

## Classes

### OrchestratorAgent\<I, O\>

Orchestrator Agent Class

This Agent is responsible for:

1. Generating an execution plan based on the objective
2. Breaking down the plan into steps and tasks
3. Coordinating the execution of steps and tasks
4. Synthesizing the final result

Workflow:

- Receives input objective
- Uses planner to create execution plan
- Executes tasks and steps according to the plan
- Synthesizes final result through completer

#### Extends

- [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                                             | Default type                                 |
| ---------------------------------------------------------- | -------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) | [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) | [`Message`](../core/agents/agent.md#message) |

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

#### Constructors

##### Constructor

> **new OrchestratorAgent**\<`I`, `O`\>(`options`): [`OrchestratorAgent`](#orchestratoragent)\<`I`, `O`\>

Creates an OrchestratorAgent instance

###### Parameters

| Parameter | Type                                                                | Description                                      |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `options` | [`OrchestratorAgentOptions`](#orchestratoragentoptions)\<`I`, `O`\> | Configuration options for the Orchestrator Agent |

###### Returns

[`OrchestratorAgent`](#orchestratoragent)\<`I`, `O`\>

###### Overrides

[`Agent`](../core/agents/agent.md#agent).[`constructor`](../core/agents/agent.md#agent#constructor)

#### Properties

##### maxIterations?

> `optional` **maxIterations**: `number`

Maximum number of iterations
Prevents infinite execution loops

##### tasksConcurrency?

> `optional` **tasksConcurrency**: `number`

Number of concurrent tasks
Controls how many tasks can be executed simultaneously

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`OrchestratorAgent`](#orchestratoragent)\<`I`, `O`\>

Factory method to create an OrchestratorAgent instance

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                | Description                                      |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `options` | [`OrchestratorAgentOptions`](#orchestratoragentoptions)\<`I`, `O`\> | Configuration options for the Orchestrator Agent |

###### Returns

[`OrchestratorAgent`](#orchestratoragent)\<`I`, `O`\>

A new OrchestratorAgent instance

##### process()

> **process**(`input`, `options`): `Promise`\<`O`\>

Process input and execute the orchestrator workflow

Workflow:

1. Extract the objective
2. Loop until plan completion or maximum iterations:
   a. Generate/update execution plan
   b. If plan is complete, synthesize result
   c. Otherwise, execute steps in the plan

###### Parameters

| Parameter | Type                                                               | Description                            |
| --------- | ------------------------------------------------------------------ | -------------------------------------- |
| `input`   | `I`                                                                | Input message containing the objective |
| `options` | [`AgentInvokeOptions`](../core/agents/agent.md#agentinvokeoptions) | Agent invocation options               |

###### Returns

`Promise`\<`O`\>

Processing result

###### Overrides

[`Agent`](../core/agents/agent.md#agent).[`process`](../core/agents/agent.md#agent#process)

## Interfaces

### OrchestratorAgentOptions\<I, O\>

Configuration options for the Orchestrator Agent

#### Extends

- [`AgentOptions`](../core/agents/agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                                             | Default type                                 |
| ---------------------------------------------------------- | -------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) | [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) | [`Message`](../core/agents/agent.md#message) |

#### Properties

| Property                                          | Type     | Description                                                        |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| <a id="maxiterations"></a> `maxIterations?`       | `number` | Maximum number of iterations to prevent infinite loops Default: 30 |
| <a id="tasksconcurrency"></a> `tasksConcurrency?` | `number` | Number of concurrent tasks Default: 5                              |
