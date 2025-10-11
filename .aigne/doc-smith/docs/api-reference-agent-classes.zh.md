# Agent 类

`Agent` 类是 AIGNE 框架中的基本构建块。它作为所有专门化 Agent 的基类，为定义处理逻辑、管理输入/输出模式以及与 AIGNE 生态系统交互提供了一致的结构。本文档为基础 `Agent` 类及其各种子类提供了详细的 API 参考。

每个 Agent 都旨在执行特定类型的任务。通过扩展 `Agent` 类，您可以创建具有不同功能的自定义 Agent，从与 AI 模型交互到编排复杂的工作流。

## 基础 `Agent` 类

`Agent` 类是一个抽象类，为所有 Agent 提供核心功能。您通常会使用其子类之一而不是直接扩展它，但理解其接口对于使用任何 Agent 都至关重要。

### AgentOptions

创建任何 Agent 时，您可以向其构造函数传递一个 `options` 对象。以下属性在基础 `Agent` 类上可用。

<x-field-group>
  <x-field data-name="name" data-type="string" data-desc="Agent 的唯一名称，用于识别和记录。默认为类构造函数名称。"></x-field>
  <x-field data-name="description" data-type="string" data-desc="对 Agent 的用途和功能的人性化描述。"></x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-desc="Agent 将监听传入消息的一个或多个主题。"></x-field>
  <x-field data-name="publishTopic" data-type="string | string[] | (output: O) => string | string[]" data-desc="将发送 Agent 输出消息的一个或多个主题。可以是一个静态值，也可以是输出的函数。"></x-field>
  <x-field data-name="inputSchema" data-type="ZodType" data-desc="用于验证输入消息结构的 Zod 模式。"></x-field>
  <x-field data-name="outputSchema" data-type="ZodType" data-desc="用于验证输出消息结构的 Zod 模式。"></x-field>
  <x-field data-name="defaultInput" data-type="Partial<I>" data-desc="一个提供 Agent 输入默认值的部分输入对象。"></x-field>
  <x-field data-name="includeInputInOutput" data-type="boolean" data-desc="如果为 true，Agent 会自动将输入字段合并到其输出对象中。"></x-field>
  <x-field data-name="skills" data-type="(Agent | FunctionAgentFn)[]" data-desc="此 Agent 可以调用以执行子任务的其他 Agent 或函数的列表。"></x-field>
  <x-field data-name="memory" data-type="MemoryAgent | MemoryAgent[]" data-desc="此 Agent 可用于存储和检索信息的一个或多个内存 Agent。"></x-field>
  <x-field data-name="guideRails" data-type="GuideRailAgent[]" data-desc="用于验证或控制 Agent 消息流的 GuideRail Agent 列表。"></x-field>
  <x-field data-name="hooks" data-type="AgentHooks | AgentHooks[]" data-desc="用于在 Agent 执行期间跟踪、记录或添加自定义行为的生命周期钩子。"></x-field>
  <x-field data-name="retryOnError" data-type="boolean | object" data-desc="用于在失败时自动重试 Agent 的 process 方法的配置。设置为 true 表示默认重试，或提供一个对象进行自定义设置。"></x-field>
  <x-field data-name="disableEvents" data-type="boolean" data-desc="如果为 true，Agent 将不会发出 agentStarted、agentSucceed 或 agentFailed 等生命周期事件。"></x-field>
</x-field-group>

### 核心方法

- **`process(input, options)`**：Agent 的抽象核心逻辑。每个子类都必须实现此方法以定义其行为。
- **`invoke(input, options)`**：执行 Agent 的主要方法。它处理输入验证、生命周期钩子、错误处理和流式传输。
- **`attach(context)`**：通过订阅其指定的主题，将 Agent 连接到 AIGNE 引擎的消息总线。
- **`shutdown()`**：清理资源，例如取消订阅主题，以防止内存泄漏。

---

## `AIAgent`

`AIAgent` 是一种强大的 Agent，它利用 `ChatModel` 来理解和生成语言。它是构建对话式 AI、执行复杂推理和使用工具（函数）的主要 Agent。

### `AIAgentOptions`

除了基本的 `AgentOptions`，`AIAgent` 还接受以下属性：

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-desc="指导 AI 模型行为的系统提示或指令。"></x-field>
  <x-field data-name="inputKey" data-type="string" data-desc="指定输入消息中的哪个字段应被视为主用户查询。"></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-desc="AI 的文本响应将放置在输出对象中的键。"></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-desc="控制 Agent 如何使用工具。可以是 'auto'、'none'、'required'、'router'，或指定一个 Agent 来强制使用它。"></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-desc="启用对模型流式响应中嵌入的结构化数据（例如 JSON、YAML）的解析。"></x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-desc="如果为 true，内存 Agent 将作为可调用工具暴露给 AI 模型。"></x-field>
</x-field-group>

### 示例

```javascript 简单的 AI Agent icon=logos:javascript
import { AIAgent, ChatModel } from '@aigne/core';
import { FakeChatModel } from '@aigne/mock';

// 假设已配置聊天模型
const model = new FakeChatModel({ response: 'The capital of France is Paris.' });

const researcher = new AIAgent({
  name: 'Researcher',
  model,
  instructions: 'You are a helpful research assistant. Answer the user question.',
  inputKey: 'question',
  outputKey: 'answer',
});

async function run() {
  const result = await researcher.invoke({
    question: 'What is the capital of France?',
  });
  console.log(result.answer); // 输出：The capital of France is Paris.
}

run();
```

---

## `TeamAgent`

`TeamAgent` 协调一组其他 Agent（其技能）以执行多步骤工作流。它可以按顺序运行 Agent，其中一个的输出成为下一个的输入，也可以并行运行以同时执行多个任务。

### `TeamAgentOptions`

<x-field-group>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-desc="决定执行流程。可以是 `ProcessMode.sequential` 或 `ProcessMode.parallel`。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-desc="用于迭代审查过程的配置，其中“审查员”Agent 会批准或请求更改团队的输出。"></x-field>
  <x-field data-name="iterateOn" data-type="string" data-desc="如果指定，团队将迭代输入消息中的数组，为每个项目运行工作流。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-desc="在使用 `iterateOn` 时设置并行操作的数量。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-desc="在顺序模式下，如果为 true，最终输出将包括所有中间步骤的输出，而不仅仅是最后一个。"></x-field>
</x-field-group>

### 示例

```javascript 顺序团队 icon=logos:javascript
import { TeamAgent, FunctionAgent } from '@aigne/core';

const translator = FunctionAgent.from({
  name: 'Translator',
  process: async (input) => ({
    french: `Le mot pour "${input.english}" est "bonjour".`,
  }),
});

const synthesizer = FunctionAgent.from({
  name: 'Synthesizer',
  process: async (input) => ({
    summary: `The translation is: ${input.french}`,
  }),
});

const translationTeam = new TeamAgent({
  name: 'TranslationTeam',
  skills: [translator, synthesizer],
  mode: 'sequential',
});

async function run() {
  const result = await translationTeam.invoke({
    english: 'hello',
  });
  console.log(result.summary); // 输出：The translation is: Le mot pour "hello" est "bonjour".
}

run();
```

---

## `FunctionAgent`

`FunctionAgent` 是封装任何 JavaScript 或 TypeScript 函数的最简单方法，使其成为 AIGNE 生态系统中一个功能完备的成员。这使您可以轻松地将自定义逻辑、第三方 API 或任何现有代码集成到您的 Agent 工作流中。

### `FunctionAgentOptions`

<x-field data-name="process" data-type="FunctionAgentFn" data-required="true" data-desc="实现 Agent 逻辑的函数。它接收输入消息和调用选项。"></x-field>

### 示例

```javascript 计算器 Agent icon=logos:javascript
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

const calculator = new FunctionAgent({
  name: 'Calculator',
  description: 'Performs addition on two numbers.',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  outputSchema: z.object({
    result: z.number(),
  }),
  process: async (input) => ({
    result: input.a + input.b,
  }),
});

async function run() {
  const output = await calculator.invoke({ a: 5, b: 10 });
  console.log(output.result); // 输出：15
}

run();
```

---

## `ImageAgent`

`ImageAgent` 是一种专门用于与 `ImageModel` 交互以根据文本描述生成图像的 Agent。

### `ImageAgentOptions`

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true" data-desc="用于生成图像的提示或指令。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-desc="一组直接传递给图像模型的键值对，例如 `quality`、`size` 或 `style`。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-desc="指定生成图像所需的目标输出格式，例如 'url'、'base64' 或 'buffer'。"></x-field>
</x-field-group>

### 示例

```javascript 图像生成 Agent icon=logos:javascript
import { ImageAgent } from '@aigne/core';
import { FakeImageModel } from '@aigne/mock';

// 假设已配置图像模型
const model = new FakeImageModel();

const artist = new ImageAgent({
  name: 'Artist',
  imageModel: model,
  instructions: 'A photorealistic image of a cat wearing a spacesuit, digital art.',
});

async function run() {
  const result = await artist.invoke({});
  // result.files 将包含生成的图像数据
  console.log(result.files[0].content_type); // 例如 'image/png'
}

run();
```

---

## `TransformAgent`

`TransformAgent` 使用 [JSONata](https://jsonata.org/)（一种灵活的查询和转换语言）来重塑 JSON 数据。这是一种声明式的方式，可以在其他 Agent 之间映射、过滤和重构消息，而无需编写命令式代码。

### `TransformAgentOptions`

<x-field data-name="jsonata" data-type="string" data-required="true" data-desc="定义数据转换的 JSONata 表达式。"></x-field>

### 示例

```javascript 数据转换器 icon=logos:javascript
import { TransformAgent } from '@aigne/core';

const dataMapper = new TransformAgent({
  name: 'DataMapper',
  jsonata: `{ 
    "productId": product_id,
    "productName": details.name,
    "price": cost
  }`,
});

async function run() {
  const input = {
    product_id: 'abc-123',
    cost: 49.99,
    details: {
      name: 'Wireless Mouse',
      color: 'Black',
    },
  };
  const result = await dataMapper.invoke(input);
  console.log(result);
  // 输出：
  // {
  //   productId: 'abc-123',
  //   productName: 'Wireless Mouse',
  //   price: 49.99
  // }
}

run();
```

---

## 其他 Agent 类型

### `UserAgent`

代表系统中的人类用户。它用于向 Agent 生态系统发送输入并流式传回最终响应。它通常没有自己的处理逻辑，而是将消息发布到其他 Agent 订阅的主题。

### `MCPAgent`

充当模型上下文协议 (MCP) 的客户端。它可以连接到 MCP 服务器，以动态发现并使用其提供的工具、提示和资源作为技能。

### `GuideRailAgent`

一种特殊类型的 Agent，在另一个 Agent 的 `guideRails` 选项中使用。它拦截 Agent 的 `process` 调用的输入和输出，以对其进行验证、强制执行策略，甚至通过返回 `{ "abort": true }` 来阻止操作。