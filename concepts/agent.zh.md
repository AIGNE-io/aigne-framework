# Agent

Agent 是 AIGNE 框架的核心基石，它不仅仅是一个简单的类，而是整个 Agent 生态系统的灵魂。通过 Agent 类，您可以构建从简单对话助手到复杂决策系统的各种智能应用，它为所有 Agent 提供了定义输入/输出架构和实现处理逻辑的统一机制。

想象 Agent 为您的 AI 应用提供了一个强大而灵活的骨架，您可以通过扩展它来打造具有丰富能力的 Agent：

* 精确处理各种结构化的输入和输出数据
* 使用模式验证确保数据格式正确无误
* 创建代理之间的无缝通信渠道
* 灵活支持实时流式或一次性响应
* 构建有记忆的智能体，能够记住过去的交互
* 以多种格式（JSON/文本）灵活输出结果
* 实现智能任务分发，将特定任务转发给专业代理

## 内置支持的 Agents

AIGNE 提供了一系列预构建的强大代理类型，满足各种应用场景需求：

* [FunctionAgent](./agent-function-agent.zh.md) - 通过函数实现逻辑的轻量级代理，适合简单明确的任务
* [AIAgent](./agent-ai-agent.zh.md) - 融合大型语言模型能力的智能代理，适合复杂自然语言交互
* [TeamAgent](./agent-team-agent.zh.md) - 协调多个专家代理协同工作的团队管理者，解决复杂多步骤问题
* [MCPAgent](./agent-mcp-agent.zh.md) - 连接外部 MCP 服务器的桥梁代理，扩展系统能力边界
* [MemoryAgent](./agent-memory-agent.zh.md) - 具有上下文记忆能力的增强代理，实现持续对话和学习
* [GuideRailAgent](./agent-guide-rail-agent.zh.md) - 提供安全指导规则的监督代理，确保输出符合预期标准

## Agent 类详解

让我们深入探索 Agent 类的丰富特性和构建方法。

### 基础信息

每个代理都需要有自己的身份标识，就像团队中的每个成员都有自己的名字和职责：

* **name** - Agent 的独特名称，用于标识和日志记录。如不指定，系统会默认使用构造函数名称。
* **description** - 对 Agent 目的和能力的清晰描述，不仅是良好文档的基础，也是多 Agent 系统中 Agent 相互理解彼此角色的关键。

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-basic-info" exclude_imports
const chatbot = AIAgent.from({
  name: "chatbot",
  description: "A chatbot that answers questions.",
});
```

### 输入/输出结构

Agent 需要明确知道它期望接收什么样的输入，以及它将产生什么样的输出，这是通过模式定义实现的：

* **inputSchema** - 使用 Zod 模式定义 Agent 的输入消息结构，确保输入数据符合预期格式。
* **outputSchema** - 使用 Zod 模式定义 Agent 的输出消息结构，保证输出数据的一致性和可预测性。

这种结构化定义不仅提供了类型安全，还为 Agent 间的通信提供了清晰的契约：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-input-output-schema" exclude_imports
const textAnalyzer = AIAgent.from({
  inputSchema: z.object({
    text: z.string().describe("The text content to analyze"),
  }),
  outputSchema: z.object({
    summary: z.string().describe("A concise summary of the text"),
    points: z
      .array(z.string())
      .describe("List of important points from the text"),
    sentiment: z
      .enum(["positive", "neutral", "negative"])
      .describe("Overall sentiment of the text"),
  }),
});
```

**TypeScript 类型支持**

有了这些模式定义，您在调用 Agent 时可以享受完整的类型检查和自动补全功能：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-input-output-schema-invoke" exclude_imports
const result = await textAnalyzer.invoke({
  text: "The new AIGNE framework offers ...",
});
console.log(result);
// Output: { summary: "AIGNE is a framework for building AI agents.", points: ["AIGNE", "framework", "AI agents"], sentiment: "positive" }
```

### 生命周期 Hooks

生命周期钩子是 Agent 处理流程中的关键观测点，让您能够在不修改核心实现的情况下，注入自定义逻辑，如日志记录、性能监控、错误处理等：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-hooks" exclude_imports
const agent = AIAgent.from({
  hooks: {
    onStart(event) {
      console.log("Agent started:", event.input);
    },
    onEnd(event) {
      if (event.error) {
        console.error("Agent ended with error:", event.error);
      } else {
        console.log("Agent ended:", event.output);
      }
    },
    onSkillStart(event) {
      console.log("Skill started:", event.skill, event.input);
    },
    onSkillEnd(event) {
      if (event.error) {
        console.error("Skill ended with error:", event.error);
      } else {
        console.log("Skill ended:", event.output);
      }
    },
    onHandoff(event) {
      console.log("Handoff event:", event.source, event.target);
    },
  },
});
```

每个钩子都在 Agent 生命周期的特定阶段触发：

* **onStart**: Agent 开始处理前的准备阶段，适合进行初始化设置、日志记录或输入转换。
* **onEnd**: Agent 完成处理或遇到错误时的收尾阶段，适合清理资源、记录结果或处理错误。
* **onSkillStart**: Agent 即将调用技能（子 Agent）前的时刻，适合跟踪技能使用情况或调整传递给技能的输入。
* **onSkillEnd**: 技能执行完毕或失败后的回调，适合评估技能性能或处理特定技能的错误情况。
* **onHandoff**: Agent 将控制权转移给另一个 Agent 时的交接点，适合在多 Agent 系统中监控处理流程和追踪任务流转。

### Guide Rails（指导规则）

在 AI 应用中，确保 Agent 的行为符合预期至关重要。指导规则 Agent 充当守门员，通过以下机制验证、转换或控制消息流：

* 执行安全规则和公司政策
* 根据业务需求验证输入和输出
* 实现关键业务逻辑验证
* 监控和审计 Agent 行为，确保合规

每个指导规则 Agent 都能检查输入和预期输出，并有权在发现问题时中止处理并提供解释：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-create-guide-rail" exclude_imports
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

将指导规则应用到 Agent 上：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant that provides financial advice.",
  guideRails: [financial],
});
```

看看它如何保护用户免受不当建议：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-invoke" exclude_imports
const result = await aigne.invoke(
  agent,
  "What will be the price of Bitcoin next month?",
);
console.log(result);
// Output:
// {
//   "$message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
// }
```

### 记忆（Memory）

想象一个能记住您过去所有对话的助手，这就是 AIGNE 记忆功能的强大之处。Agent 可以配置记忆系统来存储和检索历史交互，这对于维持连贯对话或需要历史上下文的任务至关重要：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-enable-memory-for-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: true,
});
```

有了记忆，Agent 可以记住之前的对话内容，提供更加个性化和连贯的体验：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-enable-memory-invoke-1" exclude_imports
const result2 = await aigne.invoke(
  agent,
  "What is my favorite cryptocurrency?",
);
console.log(result2);
// Output: { $message: "Your favorite cryptocurrency is Bitcoin." }
```

### 技能（Skills）

就像人类可以学习各种技能一样，Agent 也可以"学习"和使用其他 Agent 或函数作为技能，从而扩展其能力范围。一个 Agent 可以添加多个专业技能，并在需要时智能地调用它们：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-add-skills" exclude_imports
const getCryptoPrice = FunctionAgent.from({
  name: "get_crypto_price",
  description: "Get the current price of a cryptocurrency.",
  inputSchema: z.object({
    symbol: z.string().describe("The symbol of the cryptocurrency"),
  }),
  outputSchema: z.object({
    price: z.number().describe("The current price of the cryptocurrency"),
  }),
  process: async ({ symbol }) => {
    console.log(`Fetching price for ${symbol}`);
    return {
      price: 1000, // Mocked price
    };
  },
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  skills: [getCryptoPrice],
});
```

这种技能组合机制使 Agent 能够分解复杂任务，将专业工作交给专门的子 Agent 处理，从而构建更强大的智能系统。

### invoke 方法

`invoke` 是调用 Agent 执行任务的主要接口，它支持两种强大的操作模式：

1. **常规模式** - 等待 Agent 完成所有处理并返回最终结果，适合需要一次性获取完整答案的场景：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-invoke" exclude_imports
const result = await agent.invoke("What is the price of ABT?");
console.log(result);
// Output: { $message: "ABT is currently priced at $1000." }
```

2. **流式模式** - 允许 Agent 以增量方式实时返回结果，非常适合需要即时反馈的交互场景，例如聊天机器人的打字效果：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-invoke-stream" exclude_imports
const stream = await agent.invoke("What is the price of ABT?", undefined, {
  streaming: true,
});
let response = "";
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "ABT is currently priced at $1000."
```

### process 方法

`process` 方法是每个 Agent 的核心引擎，所有子类必须实现这个方法以定义其特有的处理逻辑。这里是 Agent 真正的"思考"发生的地方，它可以返回多种类型的结果：

* 常规对象响应
* 流式响应序列
* 异步生成器
* 另一个 Agent 实例（实现处理转移）

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-custom-process" exclude_imports
class CustomAgent extends Agent {
  override process(
    input: Message,
    _context: Context,
  ): PromiseOrValue<AgentProcessResult<Message>> {
    console.log("Custom agent processing input:", input);
    return {
      $message: "AIGNE is a platform for building AI agents.",
    };
  }
}

const agent = new CustomAgent();

const result = await agent.invoke("What is the price of ABT?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

### shutdown 方法

`shutdown` 方法用于优雅地关闭 Agent 并释放资源，这在长时间运行的应用中尤为重要，可以防止内存泄漏和资源耗尽：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
});

await agent.shutdown();
```

现代 JavaScript 环境还支持通过 `using` 语句实现自动资源管理，让 Agent 使用更加优雅：

```ts file="../../docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown-by-using" exclude_imports
await using agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
});
```

通过这种方式，无论代码执行路径如何，Agent 都会在作用域结束时自动关闭，确保资源得到妥善清理。
