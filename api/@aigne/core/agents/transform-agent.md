# agents/transform-agent

## Classes

### TransformAgent\<I, O\>

TransformAgent - A specialized agent for data transformation using JSONata expressions

This agent provides a declarative way to transform structured data without writing
custom processing logic. It leverages the power of JSONata, a lightweight query and
transformation language, to handle complex data manipulations through simple expressions.

Common Use Cases:

- API response normalization and field mapping
- Database query result transformation
- Configuration data restructuring
- Data format conversion (snake_case ↔ camelCase)
- Aggregation and calculation operations
- Filtering and conditional data processing

#### Extends

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  |
| ------------------------------------------- | ----------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) |

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

#### Constructors

##### Constructor

> **new TransformAgent**\<`I`, `O`\>(`options`): [`TransformAgent`](#transformagent)\<`I`, `O`\>

Create a new TransformAgent instance

###### Parameters

| Parameter | Type                                                          | Description                                            |
| --------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| `options` | [`TransformAgentOptions`](#transformagentoptions)\<`I`, `O`\> | Configuration options including the JSONata expression |

###### Returns

[`TransformAgent`](#transformagent)\<`I`, `O`\>

###### Overrides

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

##### type

> `static` **type**: `string` = `"TransformAgent"`

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`TransformAgent`](#transformagent)\<`I`, `O`\>

Factory method to create a new TransformAgent instance

Provides a convenient way to create TransformAgent instances with proper typing

###### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

###### Parameters

| Parameter | Type                                                          | Description                                  |
| --------- | ------------------------------------------------------------- | -------------------------------------------- |
| `options` | [`TransformAgentOptions`](#transformagentoptions)\<`I`, `O`\> | Configuration options for the TransformAgent |

###### Returns

[`TransformAgent`](#transformagent)\<`I`, `O`\>

A new TransformAgent instance

##### process()

> **process**(`input`): `Promise`\<`O`\>

Process input data using the configured JSONata expression

This method compiles the JSONata expression and evaluates it against the input data.

###### Parameters

| Parameter | Type | Description                    |
| --------- | ---- | ------------------------------ |
| `input`   | `I`  | The input message to transform |

###### Returns

`Promise`\<`O`\>

Promise resolving to the transformed output message

###### Overrides

[`Agent`](agent.md#agent).[`process`](agent.md#agent#process)

## Interfaces

### TransformAgentOptions\<I, O\>

Configuration options for TransformAgent

TransformAgent is a specialized agent that transforms input data to output data
using [JSONata](https://jsonata.org/) expressions. It's particularly useful for:

- Data format conversion (e.g., snake_case to camelCase)
- Field mapping and renaming
- Data structure transformation
- Simple data processing without complex logic
- API response normalization
- Configuration data transformation

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

#### Properties

| Property                       | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="jsonata"></a> `jsonata` | `string` | JSONata expression string for data transformation JSONata is a lightweight query and transformation language for JSON data. The expression defines how input data should be transformed into output data. Common JSONata patterns: - Field mapping: `{ "newField": oldField }` - Array transformation: `items.{ "name": product_name, "price": price }` - Calculations: `$sum(items.price)`, `$count(items)` - Conditional logic: `condition ? value1 : value2` - String operations: `$uppercase(name)`, `$substring(text, 0, 10)` **See** - https://jsonata.org/ for complete JSONata syntax documentation - https://try.jsonata.org/ for interactive JSONata playground |
