# AIGNE 类

`AIGNE` 类是 AIGNE 框架中的核心协调器。它管理 Agent 的生命周期，促进它们之间的通信，并协调复杂的 AI 驱动工作流的执行。它作为主要的执行引擎，将模型、Agent 和技能整合在一起，以构建强大的应用程序。

## 核心概念

AIGNE 生态系统围绕几个关键组件进行交互以执行任务。理解这些组件对于有效使用该框架至关重要。

# AIGNE 类

`AIGNE` 类是 AIGNE 框架中的核心协调器。它管理 Agent 的生命周期，促进它们之间的通信，并协调复杂的 AI 驱动工作流的执行。它作为主要的执行引擎，将模型、Agent 和技能整合在一起，以构建强大的应用程序。

## 核心概念

AIGNE 生态系统围绕几个关键组件进行交互以执行任务。理解这些组件对于有效使用该框架至关重要。

```d2
direction: down

AIGNE-Engine: {
  label: "AIGNE 引擎\n(中央协调器)"
  shape: rectangle
  style.fill: "#f0f8ff"
}

Core-Components: {
  label: "核心组件"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 3

  Models
  Agents
  Skills
}

AI-driven-Workflows: {
  label: "AI 驱动的工作流"
  shape: rectangle
}

AIGNE-Engine -> Core-Components: "汇集"

AIGNE-Engine -> AI-driven-Workflows: "协调与执行"

AIGNE-Engine -> Core-Components.Agents: "管理生命周期与\n促进通信" {
  style.stroke-dash: 2
}

Core-Components.Agents -> Core-Components.Skills: "使用"
Core-Components.Agents -> Core-Components.Models: "利用"

```

- **AIGNE 引擎**：负责管理 Agent 和协调工作流的中央协调器。
- **Agents**：系统中执行特定任务的基本行动者。
- **模型**：为 Agent 提供智能的 AI 模型。
- **技能**：可附加到 Agent 以扩展其功能的可重用能力。

## 构造函数

`AIGNE` 类通过一组定义其行为和资源的选项进行初始化。

```typescript
constructor(options?: AIGNEOptions)
```

**参数**

<x-field-group>
  <x-field data-name="options" data-type="AIGNEOptions" data-required="false" data-desc="AIGNE 实例的配置选项。"></x-field>
</x-field-group>

<x-field-group>
    <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE 实例的名称。"></x-field>
    <x-field data-name="description" data-type="string" data-required="false" data-desc="AIGNE 实例用途的描述。"></x-field>
    <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="未指定模型的 Agent 的默认模型。"></x-field>
    <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="用于图像处理任务的模型。"></x-field>
    <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="由 AIGNE 实例管理的 Agent 列表。"></x-field>
    <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="可供 Agent 使用的技能列表。"></x-field>
    <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="AIGNE 实例的使用限制，例如超时和令牌计数。"></x-field>
    <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="用于监控和记录活动的观察者。"></x-field>
</x-field-group>

**示例**

```typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A simple chat agent",
});

const aigne = new AIGNE({
  model,
  agents: [agent],
  name: "MyAIGNE",
  description: "An example AIGNE instance",
});
```

## 方法

### invoke

`invoke` 方法用于与 Agent 交互，可以通过向其发送消息，或创建一个 `UserAgent` 以进行持续交互。

```typescript
invoke<I extends Message, O extends Message>(agent: Agent<I, O>, message?: I, options?: InvokeOptions<U>): UserAgent<I, O> | Promise<AgentResponse<O>>
```

**参数**

<x-field-group>
    <x-field data-name="agent" data-type="Agent" data-required="true" data-desc="要调用的 Agent。"></x-field>
    <x-field data-name="message" data-type="Message" data-required="false" data-desc="要发送给 Agent 的输入消息。"></x-field>
    <x-field data-name="options" data-type="InvokeOptions" data-required="false" data-desc="调用的附加选项，例如启用流式传输。"></x-field>
</x-field-group>

**返回值**

- 如果未提供 `message`，则返回一个 `UserAgent` 实例，用于与指定的 Agent 进行持续交互。
- 如果提供了 `message`，则返回一个 `Promise`，该 Promise 会解析为 Agent 的响应。如果选项中启用了 `streaming`，响应可以是单个对象或一个流。

**示例：简单调用**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 创建 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 创建 AI Agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// AIGNE：AIGNE 框架的主要执行引擎。
const aigne = new AIGNE({ model });

// 使用 AIGNE 调用 Agent
const userAgent = await aigne.invoke(agent);

// 向 Agent 发送消息
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

**示例：流式响应**

```typescript
import { AIAgent, AIGNE, isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

// AIGNE：AIGNE 框架的主要执行引擎。
const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

let text = "";

const stream = await aigne.invoke(agent, { message: "hello" }, { streaming: true });
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk) && chunk.delta.text?.message) {
    text += chunk.delta.text.message;
  }
}

console.log(text); // 输出: Hello, How can I assist you today?
```

### publish

`publish` 方法向指定主题发送消息，允许 Agent 之间进行事件驱动的通信。

```typescript
publish(topic: string | string[], payload: Omit<MessagePayload, "context"> | Message, options?: InvokeOptions<U>)
```

**参数**

<x-field-group>
    <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要将消息发布到的主题。"></x-field>
    <x-field data-name="payload" data-type="Message" data-required="true" data-desc="要发送的消息负载。"></x-field>
    <x-field data-name="options" data-type="InvokeOptions" data-required="false" data-desc="发布的附加选项。"></x-field>
</x-field-group>

**示例**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  subscribeTopic: "test_topic",
  publishTopic: "result_topic",
  inputKey: "message",
});

// AIGNE：AIGNE 框架的主要执行引擎。
const aigne = new AIGNE({
  model,
  // 将 Agent 添加到 AIGNE
  agents: [agent],
});

const subscription = aigne.subscribe("result_topic");

aigne.publish("test_topic", { message: "hello" });

const { message } = await subscription;

console.log(message); // { message: "Hello, How can I assist you today?" }
```

### subscribe

`subscribe` 方法允许您监听特定主题上的消息。

```typescript
subscribe(topic: string | string[], listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>
```

**参数**

<x-field-group>
    <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要订阅的主题。"></x-field>
    <x-field data-name="listener" data-type="MessageQueueListener" data-required="false" data-desc="一个可选的回调函数，用于处理传入的消息。"></x-field>
</x-field-group>

**返回值**

- 如果提供了 `listener`，则返回一个 `Unsubscribe` 函数以停止监听。
- 如果未提供 `listener`，则返回一个 `Promise`，该 Promise 会解析为主题上的下一条消息负载。

**示例**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  subscribeTopic: "test_topic",
  publishTopic: "result_topic",
  inputKey: "message",
});

// AIGNE：AIGNE 框架的主要执行引擎。
const aigne = new AIGNE({
  model,
  // 将 Agent 添加到 AIGNE
  agents: [agent],
});

const unsubscribe = aigne.subscribe("result_topic", ({ message }) => {
  console.log(message); // { message: "Hello, How can I assist you today?" }
  unsubscribe();
});

aigne.publish("test_topic", { message: "hello" });
```

### shutdown

`shutdown` 方法会平稳地终止 `AIGNE` 实例及其所有关联的 Agent 和技能，确保正确的资源清理。

```typescript
async shutdown(): Promise<void>
```

**示例**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

// AIGNE：AIGNE 框架的主要执行引擎。
const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

await aigne.invoke(agent, { message: "hello" });

await aigne.shutdown();
```

### load

静态 `load` 方法从包含 `aigne.yaml` 配置文件的目录中初始化一个 `AIGNE` 实例。

```typescript
static async load(path: string, options?: Omit<AIGNEOptions, keyof LoadOptions> & LoadOptions): Promise<AIGNE>
```

**参数**

<x-field-group>
    <x-field data-name="path" data-type="string" data-required="true" data-desc="包含 aigne.yaml 文件的目录路径。"></x-field>
    <x-field data-name="options" data-type="LoadOptions" data-required="false" data-desc="用于覆盖已加载配置的选项。"></x-field>
</x-field-group>

### addAgent

向 `AIGNE` 实例添加一个或多个 Agent，使其可供调用。

```typescript
addAgent(...agents: Agent[]): void
```

**参数**

<x-field-group>
    <x-field data-name="agents" data-type="Agent[]" data-required="true" data-desc="要添加的一个或多个 Agent 实例。"></x-field>
</x-field-group>

### newContext

创建一个新的执行上下文，这对于隔离不同的对话或工作流非常有用。

```typescript
newContext(options?: Partial<Pick<Context, "userContext" | "memories">>): AIGNEContext
```

**参数**

<x-field-group>
    <x-field data-name="options" data-type="object" data-required="false" data-desc="用于初始化新上下文的可选用户上下文和记忆。"></x-field>
</x-field-group>

## 属性

- **name**: `string` - AIGNE 实例的名称。
- **description**: `string` - 实例的描述。
- **model**: `ChatModel` - 默认的聊天模型。
- **imageModel**: `ImageModel` - 默认的图像模型。
- **limits**: `ContextLimits` - 使用限制。
- **skills**: `Agent[]` - 可用技能的集合。
- **agents**: `Agent[]` - 受管 Agent 的集合。
- **observer**: `AIGNEObserver` - 可观察性实例。