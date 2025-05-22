[Documentation](../README.md) / @aigne/bedrock

# @aigne/bedrock

## Classes

### BedrockChatModel

#### Extends

* `ChatModel`

#### Constructors

##### Constructor

> **new BedrockChatModel**(`options?`): [`BedrockChatModel`](#bedrockchatmodel)

###### Parameters

| Parameter  | Type                                                  |
| ---------- | ----------------------------------------------------- |
| `options?` | [`BedrockChatModelOptions`](#bedrockchatmodeloptions) |

###### Returns

[`BedrockChatModel`](#bedrockchatmodel)

###### Overrides

`ChatModel.constructor`

#### Properties

##### options?

> `optional` **options**: [`BedrockChatModelOptions`](#bedrockchatmodeloptions)

#### Accessors

##### client

###### Get Signature

> **get** **client**(): `BedrockRuntimeClient`

###### Returns

`BedrockRuntimeClient`

##### modelOptions

###### Get Signature

> **get** **modelOptions**(): `undefined` | `ChatModelOptions`

###### Returns

`undefined` | `ChatModelOptions`

#### Methods

##### process()

> **process**(`input`): `PromiseOrValue`<[`AgentProcessResult`](core/agents/agent.md#agentprocessresult)<`ChatModelOutput`>>

Process the input using Bedrock's chat model

###### Parameters

| Parameter | Type             | Description          |
| --------- | ---------------- | -------------------- |
| `input`   | `ChatModelInput` | The input to process |

###### Returns

`PromiseOrValue`<[`AgentProcessResult`](core/agents/agent.md#agentprocessresult)<`ChatModelOutput`>>

The processed output from the model

###### Overrides

`ChatModel.process`

## Interfaces

### BedrockChatModelOptions

#### Properties

| Property                                        | Type               |
| ----------------------------------------------- | ------------------ |
| <a id="accesskeyid"></a> `accessKeyId?`         | `string`           |
| <a id="secretaccesskey"></a> `secretAccessKey?` | `string`           |
| <a id="region"></a> `region?`                   | `string`           |
| <a id="model"></a> `model?`                     | `string`           |
| <a id="modeloptions"></a> `modelOptions?`       | `ChatModelOptions` |
