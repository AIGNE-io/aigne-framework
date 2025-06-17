```markdown
# AIGNE 框架 Agent 文档：设计与使用

AIGNE 框架提供了一个强大的范式，用于创建和管理 AI agents，提供了输入/输出验证、生命周期钩子和Guide Rails (行为导轨) 强制等基本功能，以支持构建可靠、可扩展的多智能体系统。无论是设计简单的聊天机器人还是复杂的、具有丰富记忆的智能体，开发人员都可以利用这些功能以确保在各种领域和用例中的操作效率、可追溯性和适应性。

## 创建具有可识别特征的基本 AI Agent

在 AIGNE 框架中，agents 是通过消息处理和响应处理实现复杂行为的基本构建块。每个 agent 都有名称和描述，作为其在系统中的身份和目的。这个基础特征对于记录、日志记录和管理大型多智能体系统中的智能体至关重要。开发人员可以为 agents 指定有意义的名称和描述，以增强系统的可追溯性和可维护性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-basic-info"
const chatbot = AIAgent.from({
  name: "chatbot",
  description: "回答问题的聊天机器人。"
});
```

## 为 AI Agents 构建输入和输出结构

在 AIGNE 框架中，AI Agents 可以使用 Zod 库定义输入和输出结构。这些结构的主要作用是验证数据格式，确保接收到的输入和生成的输出符合预期的结构。这一特性对于维护数据完整性和在复杂的智能体系统中进行调试任务至关重要。通过可靠的数据结构强制执行，agents 可以有效处理结构化数据，同时最大限度地减少运行时错误。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-input-output-schema"
const textAnalyzer = AIAgent.from({
  inputSchema: z.object({
    text: z.string().describe("要分析的文本内容"),
  }),
  outputSchema: z.object({
    summary: z.string().describe("文本的简要概述"),
    points: z.array(z.string()).describe("文本中的重要点列表"),
    sentiment: z
      .enum(["positive", "neutral", "negative"])
      .describe("文本的整体情感"),
  }),
});
```

## 在 AI Agents 中实现生命周期钩子

在 AIGNE agents 中的生命周期钩子提供了一种结构化机制，用于截获agent执行过程中的不同点。这些钩子允许开发人员在不改变核心处理逻辑的情况下注入自定义行为，例如日志记录、监控和错误处理。钩子增强了智能体操作的灵活性和可观察性，支持与外部系统的集成以提高诊断和操作洞察力。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-hooks"
const agent = AIAgent.from({
  hooks: {
    onStart(event) {
      console.log("Agent 开始：", event.input);
    },
    onEnd(event) {
      if (event.error) {
        console.error("Agent 结束时出现错误：", event.error);
      } else {
        console.log("Agent 结束：", event.output);
      }
    },
    onSkillStart(event) {
      console.log("技能开始：", event.skill, event.input);
    },
    onSkillEnd(event) {
      if (event.error) {
        console.error("技能结束时出现错误：", event.error);
      } else {
        console.log("技能结束：", event.output);
      }
    },
    onHandoff(event) {
      console.log("交接事件：", event.source, event.target);
    },
  },
});
```

## 集成 Guide Rail Agents 以实施政策

Guide Rail agents 是 AIGNE 框架中专门设计用于实施规则和安全政策的角色。它们执行输入/输出验证和业务逻辑检查，以确保遵守指定的约束条件。Guide Rail agents 可以在检测到违规时中止流程，从而实现稳健的错误处理和政策实施，在 agent 交互中尤为重要。这种集成对于维护敏感应用领域的操作的完整性和安全性至关重要。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-guide-rails-create-guide-rail"
const financial = AIAgent.from({
  ...guideRailAgentOptions,
  instructions: `您是一位金融助手。您必须确保不提供加密货币价格预测或预测。
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
});
```

## 启用智能体的持久信息记忆

在 AIGNE agents 中集成记忆功能，允许智能体保留和利用过去的交互，从而实现个性化和情境感知响应。通过记忆智能体，可以存储和检索用户偏好或历史数据，创造出更智能和自适应的 agent 行为。此功能对于开发需要长期上下文保留和动态交互能力的 agent 至关重要。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-enable-memory-for-agent"
const agent = AIAgent.from({
  instructions: "您是加密市场分析的有帮助的助手",
  memory: new DefaultMemory(),
});
```

## 添加技能以增强Agent能力

在 AIGNE agents 中，技能允许模块化和可扩展的功能，agent 可以将特定任务委托给其他 agents 或函数。每个技能都封装了一个特定的能力，例如获取数据或进行专业计算，从而有效地拓宽了 agent 的能力。通过采用基于技能的架构，agents 可以利用可重用的组件，提高多智能体系统中的效率和可扩展性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-add-skills"
const getCryptoPrice = FunctionAgent.from({
  name: "get_crypto_price",
  description: "获取加密货币的当前价格。",
  inputSchema: z.object({
    symbol: z.string().describe("加密货币的符号"),
  }),
  outputSchema: z.object({
    price: z.number().describe("加密货币的当前价格"),
  }),
  process: async ({ symbol }) => {
    console.log(`正在获取 ${symbol} 的价格`);
    return {
      price: 1000, // 模拟价格
    };
  },
});

const agent = AIAgent.from({
  instructions: "您是加密市场分析的有帮助的助手",
  skills: [getCryptoPrice],
});
```

## 用于任务的无缝Agent调用

在 AIGNE 框架中，agent 可以调用来执行基于提供的输入数据的任务，支持常规模式和流式模式。调用过程可以处理复杂查询并返回结构化响应，使其适用于实时应用。此操作灵活性允许开发人员高效管理和执行多种场景下的agent任务，从简单查询到复杂的长时间运行的过程。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-invoke"
spyOn(agent.model, "process").mockReturnValueOnce({
  text: "ABT 当前的价格是 $1000。",
});

const result = await agent.invoke("ABT 的价格是多少?");
console.log(result);
// 输出: { $message: "ABT 当前的价格是 $1000。" }
expect(result).toEqual({ $message: "ABT 当前的价格是 $1000。" });
```

## 开发具有专门处理逻辑的自定义Agent

在 AIGNE 框架中，自定义 agents 通过扩展基本 Agent 类设计，提供了实现定制处理逻辑的灵活性。这种能力推动了创新，使开发人员能够构建满足独特要求或领域特定功能的智能体。自定义 agents 能够创建与整体智能体系统无缝对接的高度专业化和优化的解决方案。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-custom-process"
class CustomAgent extends Agent {
  override process(
    input: Message,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<Message>> {
    console.log("自定义智能体处理输入：", input);
    return {
      $message: "AIGNE 是一个用于构建 AI agents 的平台。",
    };
  }
}

const agent = new CustomAgent();

const result = await agent.invoke("ABT 的价格是多少?");
console.log(result);
// 输出: { $message: "AIGNE 是一个用于构建 AI agents 的平台。" }
expect(result).toEqual({ $message: "AIGNE 是一个用于构建 AI agents 的平台。" });
```

## 优雅的Agent关停以进行资源管理

在 AIGNE 框架中，智能体可以优雅地关闭以释放资源并防止内存泄漏。此过程涉及取消订阅消息主题和清除内存使用，确保系统保持最佳性能和稳定性。适当的关停机制在并发高和资源受限的环境中特别关键。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown"
await agent.shutdown();
```

## 使用 'using' 语句自动处理Agent

AIGNE 框架中的 'using' 语句简化了资源管理，通过允许自动处置 agents。它提供了一种语法结构，以确保智能体实例在使用后正确关闭，促进现代资源管理实践，减少在以智能体为中心的应用中资源泄漏的可能性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/agent.test.ts" region="example-agent-shutdown-by-using"
await using agent = AIAgent.from({
  instructions: "您是加密市场分析的有帮助的助手",
});

expect(agent).toBeInstanceOf(AIAgent);
```

总之，本手册提供了有关 AIGNE 框架各个方面的全面指南，从建立基本特征和输入/输出结构到高级功能如Guide Rail集成、记忆使用和Agent技能。通过了解和应用这些功能，开发人员能够构建高效、可维护和适应性强的多样化 AI 系统，以满足专门需求的同时保持强大整体架构。
```