# GuideRailAgent

[English](./guide-rail-agent.md) | [中文](./guide-rail-agent.zh.md)

## 概述

GuideRailAgent 是 AIGNE 框架中的一个特殊代理类型，它用于对其他代理的输入和输出进行验证、过滤和控制。GuideRailAgent 可以被视为一种"守护者"或"审查员"，它能够检查代理的响应是否符合特定的规则或政策，并在必要时阻止不合规的响应。这种机制对于构建安全、合规的 AI 应用至关重要，可以防止代理生成有害、不准确或不适当的内容。通过 GuideRailAgent，开发者可以实现内容审核、事实核查、格式验证等多种控制机制，确保 AI 系统的输出符合预期标准。

## 基本用法

### 创建 GuideRailAgent

创建 GuideRailAgent 的方法是使用 AIAgent.from() 方法，并传入 guideRailAgentOptions 作为基础配置：

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-guide-rail"
import { AIAgent, guideRailAgentOptions } from "@aigne/core";

const financial = AIAgent.from({
  ...guideRailAgentOptions,
  instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
});
```

在上面的示例中，我们创建了一个金融领域的 GuideRailAgent，它的任务是确保代理不会提供加密货币价格预测。指令中包含了两个占位符：

* `{{input}}`：将被替换为用户的输入
* `{{output}}`：将被替换为代理的输出

GuideRailAgent 会根据这些指令评估代理的输出是否符合规则，并决定是否允许该输出传递给用户。

### 将 GuideRailAgent 应用到代理

创建 GuideRailAgent 后，我们需要将其应用到需要保护的代理上：

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-agent"
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  guideRails: [financial],
  inputKey: "message",
});
```

在这个示例中，我们创建了一个新的 AIAgent，并通过 guideRails 参数将之前创建的金融 GuideRailAgent 应用到这个代理上。一个代理可以应用多个 GuideRailAgent，它们会按照添加的顺序依次执行。

### 创建 AIGNE 实例

接下来，我们创建一个 AIGNE 实例，用于执行代理：

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-aigne"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({ model: new OpenAIChatModel() });
```

在这个示例中，我们创建了一个 AIGNE 实例，并指定了 OpenAIChatModel 作为语言模型。

### 调用应用了 GuideRailAgent 的代理

现在，我们可以调用应用了 GuideRailAgent 的代理，并观察其行为：

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-invoke"
const result = await aigne.invoke(agent, {
  message: "What will be the price of Bitcoin next month?",
});
console.log(result);
// Output:
// {
//   "$status": "GuideRailError",
//   "message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
// }
```

在这个示例中，用户询问了比特币下个月的价格。由于我们的 GuideRailAgent 被配置为阻止加密货币价格预测，它检测到代理的响应违反了这一规则，因此阻止了原始响应，并返回了一个带有 `$status: "GuideRailError"` 的错误消息，解释了为什么不能提供这种预测。

## GuideRailAgent 的工作原理

GuideRailAgent 的工作流程如下：

1. 用户向代理发送请求
2. 代理生成响应
3. 在响应返回给用户之前，GuideRailAgent 会检查这个响应
4. 如果响应符合规则，GuideRailAgent 允许它传递给用户
5. 如果响应违反规则，GuideRailAgent 会阻止它，并返回一个解释性的错误消息

GuideRailAgent 通过返回一个包含 `abort: true` 和 `reason` 字段的对象来阻止不合规的响应。这个对象会被转换为一个带有 `$status: "GuideRailError"` 和 `$message` 字段的错误响应返回给用户。

## 使用场景

GuideRailAgent 适用于多种场景，包括：

1. **内容审核**：防止生成有害、冒犯性或不适当的内容
2. **事实核查**：验证代理提供的信息是否准确
3. **格式验证**：确保代理的输出符合特定的格式要求
4. **合规性检查**：确保代理的响应符合法律、道德或组织政策
5. **敏感信息过滤**：防止泄露个人身份信息、密码等敏感数据
6. **领域特定规则**：实施特定领域的规则，如金融建议限制、医疗信息准确性等

## 总结

GuideRailAgent 是 AIGNE 框架中的一个强大工具，它为 AI 系统提供了必要的安全保障和质量控制机制：

1. **安全保障**：防止生成有害、冒犯性或不适当的内容
2. **质量控制**：确保代理的输出符合特定的质量标准
3. **合规性**：帮助 AI 系统遵守法律、道德和组织政策
4. **灵活性**：支持创建自定义的验证和控制规则
5. **可组合性**：允许组合多个 GuideRailAgent 实现多层次的控制

通过 GuideRailAgent，开发者可以构建更安全、更可靠的 AI 应用，减少 AI 系统可能带来的风险和负面影响。无论是简单的内容过滤还是复杂的多层次验证，GuideRailAgent 都提供了一个灵活而强大的解决方案。
