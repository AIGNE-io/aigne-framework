本文档详细介绍了 `AIGNE` 类，它是 AIGNE 框架中的核心协调器。您将学习如何初始化、配置和使用 `AIGNE` 类来管理 Agent、处理消息传递以及执行复杂的 AI 工作流。

### 系统架构

为了理解 `AIGNE` 类如何融入更广泛的生态系统，让我们将其核心组件及其交互可视化。`AIGNE` 类作为中心枢纽，管理 Agent、技能和通信渠道。

本文档详细介绍了 `AIGNE` 类，它是 AIGNE 框架中的核心协调器。您将学习如何初始化、配置和使用 `AIGNE` 类来管理 Agent、处理消息传递以及执行复杂的 AI 工作流。

### 系统架构

为了理解 `AIGNE` 类如何融入更广泛的生态系统，让我们将其核心组件及其交互可视化。`AIGNE` 类作为中心枢纽，管理 Agent、技能和通信渠道。

```d2
direction: down

AIGNE-Ecosystem: {
  label: "AIGNE 系统架构"
  shape: rectangle

  AIGNE-Class: {
    label: "AIGNE 类\n(协调器)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Agents: {
    label: "Agents"
    shape: rectangle
    Agent-1: "Agent 1"
    Agent-2: "Agent 2"
    Agent-N: "..."
  }

  Skills: {
    label: "技能"
    shape: rectangle
    Skill-A: "技能 A"
    Skill-B: "技能 B"
  }

  Communication-Channels: {
    label: "通信渠道"
    shape: rectangle
    Messaging: {}
    API: {}
  }
}

AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Agents: "管理"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Skills: "利用"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Communication-Channels: "处理"

```

## 初始化和配置

`AIGNE` 类可以直接实例化，也可以从配置文件加载。这为编程和声明式设置提供了灵活性。

### 构造函数

构造函数允许您使用指定的配置创建 `AIGNE` 实例。

**参数**

<x-field-group>
  <x-field data-name="options" data-type="AIGNEOptions" data-required="false" data-desc="AIGNE 实例的配置选项。"></x-field>
</x-field-group>

**`AIGNEOptions`**

<x-field-group>
  <x-field data-name="rootDir" data-type="string" data-required="false" data-desc="用于解析 Agent 和技能相对路径的根目录。"></x-field>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE 实例的名称。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="AIGNE 实例的描述。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="全局聊天模型，适用于未指定模型的 Agent。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="用于图像处理任务的图像模型。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="AIGNE 实例要使用的技能列表。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="AIGNE 实例要使用的 Agent 列表。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="AIGNE 实例的使用限制，例如超时和令牌计数。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="用于监控 AIGNE 实例的观察者。"></x-field>
</x-field-group>

**示例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const travelAgent = new AIAgent({
  name: 'TravelAgent',
  description: 'An agent that helps with travel planning.',
  model: yourChatModel, // 假设 yourChatModel 是 ChatModel 的一个实例
});

const aigne = new AIGNE({
  name: 'MyAIGNE',
  description: 'A simple AIGNE instance.',
  agents: [travelAgent],
});

console.log('AIGNE instance created:', aigne.name);
```

### `load()`

静态 `load` 方法提供了一种便捷的方式，可以从包含 `aigne.yaml` 文件和 Agent 定义的目录中初始化 `AIGNE` 系统。

**参数**

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="true" data-desc="包含 aigne.yaml 文件的目录路径。"></x-field>
  <x-field data-name="options" data-type="Omit<AIGNEOptions, keyof LoadOptions> & LoadOptions" data-required="false" data-desc="用于覆盖已加载配置的选项。"></x-field>
</x-field-group>

**返回值**

<x-field data-name="Promise<AIGNE>" data-type="Promise" data-desc="一个完全初始化的 AIGNE 实例，包含已配置的 Agent 和技能。"></x-field>

**示例**

```typescript
import { AIGNE } from '@aigne/core';

async function loadAIGNE() {
  try {
    const aigne = await AIGNE.load('./path/to/your/aigne/config');
    console.log('AIGNE instance loaded:', aigne.name);
  } catch (error) {
    console.error('Error loading AIGNE instance:', error);
  }
}

loadAIGNE();
```

## 核心组件

`AIGNE` 类由几个关键组件组成，这些组件协同工作以创建一个强大的人工智能系统。

### `agents`

`agents` 属性是 `AIGNE` 实例管理的主要 Agent 的集合。它提供按 Agent 名称的索引访问。

<x-field data-name="agents" data-type="AccessorArray<Agent>" data-desc="主要 Agent 的集合。"></x-field>

### `skills`

`skills` 属性是 `AIGNE` 实例可用的技能 Agent 的集合。它提供按技能名称的索引访问。

<x-field data-name="skills" data-type="AccessorArray<Agent>" data-desc="技能 Agent 的集合。"></x-field>

### `model`

`model` 属性是全局聊天模型，用于所有未指定自有模型的 Agent。

<x-field data-name="model" data-type="ChatModel" data-desc="全局聊天模型。"></x-field>

## Agent 管理

`AIGNE` 类提供了管理系统中 Agent 的方法。

### `addAgent()`

`addAgent` 方法允许您向 `AIGNE` 实例添加一个或多个 Agent。每个 Agent 都会附加到 `AIGNE` 实例上，从而可以访问其资源。

**参数**

<x-field-group>
  <x-field data-name="...agents" data-type="Agent[]" data-required="true" data-desc="要添加的一个或多个 Agent 实例。"></x-field>
</x-field-group>

**示例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const aigne = new AIGNE();

const weatherAgent = new AIAgent({
  name: 'WeatherAgent',
  description: 'An agent that provides weather forecasts.',
  model: yourChatModel, // 假设 yourChatModel 是 ChatModel 的一个实例
});

aigne.addAgent(weatherAgent);
console.log('Agent added:', aigne.agents[0].name);
```

## 调用

`invoke` 方法是与 Agent 交互的主要方式。它有多个重载以支持不同的调用模式。

### `invoke(agent)`

此重载会创建一个 `UserAgent`，它是对 Agent 的封装，用于重复调用。

**参数**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="要封装的目标 Agent。"></x-field>
</x-field-group>

**返回值**

<x-field data-name="UserAgent<I, O>" data-type="UserAgent" data-desc="一个 UserAgent 实例。"></x-field>

### `invoke(agent, message, options)`

这是使用消息调用 Agent 并接收响应的标准方式。

**参数**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="要调用的目标 Agent。"></x-field>
  <x-field data-name="message" data-type="I & Message" data-required="true" data-desc="发送给 Agent 的输入消息。"></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="调用的可选配置参数。"></x-field>
</x-field-group>

**返回值**

<x-field data-name="Promise<O>" data-type="Promise" data-desc="一个 promise，它会解析为 Agent 的完整响应。"></x-field>

**示例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // 假设 yourChatModel 是 ChatModel 的一个实例
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const response = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' });
    console.log('Agent response:', response.content);
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeAgent();
```

### 流式传输

`invoke` 方法还支持通过将 `streaming` 选项设置为 `true` 来实现流式响应。

**示例**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeStreamingAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // 假设 yourChatModel 是 ChatModel 的一个实例
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const stream = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' }, { streaming: true });
    for await (const chunk of stream) {
      console.log('Stream chunk:', chunk.content);
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeStreamingAgent();
```

## 消息传递

`AIGNE` 类为 Agent 间通信提供了一个消息队列。

### `publish()`

`publish` 方法将消息广播到指定主题的所有订阅者。

**参数**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要将消息发布到的一个或多个主题。"></x-field>
  <x-field data-name="payload" data-type="Omit<MessagePayload, 'context'> | Message" data-required="true" data-desc="消息负载。"></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="可选的配置参数。"></x-field>
</x-field-group>

### `subscribe()`

`subscribe` 方法允许您监听特定主题上的消息。它可以与监听器回调函数一起使用，也可以作为一个 promise 使用，该 promise 会解析为下一条消息。

**参数**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要订阅的主题。"></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="false" data-desc="一个可选的回调函数，用于处理传入的消息。"></x-field>
</x-field-group>

**返回值**

<x-field data-name="Unsubscribe | Promise<MessagePayload>" data-type="Function | Promise" data-desc="如果提供了监听器，则返回一个取消订阅的函数，否则返回一个解析为下一条消息的 promise。"></x-field>

### `unsubscribe()`

`unsubscribe` 方法从主题中移除先前注册的监听器。

**参数**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="要取消订阅的主题。"></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="true" data-desc="要移除的监听器函数。"></x-field>
</x-field-group>

**示例**

```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

const listener = (payload) => {
  console.log('Received message:', payload.content);
};

aigne.subscribe('news', listener);
aigne.publish('news', { content: 'AIGNE version 2.0 released!' });
aigne.unsubscribe('news', listener);
```

## 生命周期管理

`AIGNE` 类提供了一个 `shutdown` 方法，用于平稳地终止实例及其所有的 Agent 和技能。

### `shutdown()`

`shutdown` 方法确保在终止前正确清理资源。

**返回值**

<x-field data-name="Promise<void>" data-type="Promise" data-desc="一个 promise，在关闭完成后解析。"></x-field>

**示例**

```typescript
import { AIGNE } from '@aigne/core';

async function shutdownAIGNE() {
  const aigne = new AIGNE();
  // ... 你的 AIGNE 逻辑 ...
  await aigne.shutdown();
  console.log('AIGNE instance shut down.');
}

shutdownAIGNE();
```