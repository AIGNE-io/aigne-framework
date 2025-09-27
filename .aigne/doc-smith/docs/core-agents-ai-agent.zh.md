# AI Agent

`AIAgent` 是 AIGNE 框架中的基础构建模块。你可以把它看作是你的主要工作单元，旨在与大语言模型（LLMs）进行通信，以理解任务、处理信息并生成智能响应。

它的主要工作是接收你提供的一组 `instructions`，与 AI 模型（如 OpenAI 的 GPT-4）进行交互，并以你的应用程序可以轻松使用的结构化格式返回结果。这非常适合用于总结文本、提取特定信息、回答问题或对内容进行分类等任务。

`AIAgent` 的两个关键特性使其功能强大且可靠：

1.  **指令，而非提示**：你为 `AIAgent` 提供的是一组清晰的 `instructions`，而不是简单的提示。这允许更详细和明确的任务定义，从而更有效地指导 AI。
2.  **结构化输出**：你可以使用 `outputSchema` 来精确定义输出的格式。这确保了 AI 的响应不仅仅是一段文本，而是一个可预测、机器可读的 JSON 对象，这对于构建可靠的应用程序至关重要。

## 工作原理

`AIAgent` 遵循一个简单而有效的流程：

1.  **初始化**：你通过为 `AIAgent` 提供与 AI 模型的连接和一组 `instructions` 来创建它。
2.  **执行**：当你使用某些输入运行 Agent 时，它会将你的指令和输入组合成一个对 AI 模型的请求。
3.  **响应生成**：AI 模型处理该请求并生成一个响应。
4.  **输出格式化**：`AIAgent` 接收模型的原始响应，并根据你定义的 `outputSchema` 对其进行格式化，返回一个干净的 JSON 对象。

## 基本用法

以下是一个如何创建和使用 `AIAgent` 根据主题生成创意故事标题的简单示例。

```typescript Creating an AIAgent icon=logos:typescript
import { AIAgent } from '@aigne/core';
import { OpenAI } from '@aigne/models/openai';
import { z } from 'zod';

// 1. 定义你想要的输出结构
const StorySchema = z.object({
  title: z.string().describe('一个富有创意且吸引人的故事标题'),
  tagline: z.string().describe('一句简短而引人入胜的宣传语'),
});

// 2. 初始化你想要使用的 AI 模型
const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
});

// 3. 使用指令和输出模式创建 AIAgent
const storyAgent = new AIAgent({
  model,
  instructions: '你是一位富有创造力的作家。为一个故事生成一个标题和宣传语。',
  outputSchema: StorySchema,
});

// 4. 使用特定输入运行 Agent
async function generateStoryTitle() {
  const result = await storyAgent.run({
    input: { theme: '一个发现了音乐的机器人' },
  });

  console.log('生成的故事情节：', result.title);
  console.log('宣传语：', result.tagline);
}

generateStoryTitle();
```

### 预期输出

运行以上代码将生成如下所示的结构化对象：

```json Response Example icon=mdi:code-json
{
  "title": "硅基交响曲",
  "tagline": "他的世界充满了逻辑。直到他听到了第一个音符。"
}
```

## 配置

当你创建一个新的 `AIAgent` 时，可以传递一个包含以下属性的配置对象：

<x-field-group>
  <x-field data-name="model" data-type="Model" data-required="true">
    <x-field-desc markdown>一个 AI 模型实例，例如 `OpenAI` 或 `Anthropic`。这是 Agent 用来思考的引擎。</x-field-desc>
  </x-field>
  <x-field data-name="instructions" data-type="string" data-required="true">
    <x-field-desc markdown>对 Agent 的任务和个性的清晰、详细的描述。这会指导 AI 的行为。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="ZodSchema" data-required="false">
    <x-field-desc markdown>一个来自 Zod 库的模式，用于定义输出的结构。这会强制 AI 以一致的 JSON 格式进行响应。</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agent 的唯一名称，用于日志记录和识别。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>关于此 Agent 功能的简要描述。</x-field-desc>
  </x-field>
  <x-field data-name="system_prompts" data-type="string[]" data-required="false">
    <x-field-desc markdown>一个系统级提示数组，用于进一步指导模型的行为，通常用于设置基调或约束。</x-field-desc>
  </x-field>
</x-field-group>

## 后续步骤

现在你已经了解了 `AIAgent`，你可能想知道如何赋予它与外部世界交互的工具，或者如何让多个 Agent 协同工作。

<x-cards>
  <x-card data-title="Function Agent" data-icon="lucide:function-square" data-href="/core/agents/function-agent">
    了解如何通过包装 JavaScript 函数来为你的 Agent 提供工具和能力。
  </x-card>
  <x-card data-title="Team Agent" data-icon="lucide:users" data-href="/core/agents/team-agent">
    探索如何编排多个 Agent 以协作解决复杂问题。
  </x-card>
</x-cards>