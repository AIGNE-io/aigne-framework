# 创建第一个 Agent

在 aigne 框架中，创建一个基本的 AI Agent 非常直观且高效。本指南将引导您从零开始构建并运行您的第一个智能 Agent。

## 基本流程

创建和使用一个基本 Agent 主要包括以下几个关键步骤：

1. **导入必要的模块** - 引入框架核心组件和模型接口
2. **创建 AIGNE 实例** - 配置框架运行环境和底层模型
3. **配置并创建 Agent** - 定义 Agent 角色和行为指南
4. **使用 Agent 处理用户输入** - 调用 Agent 并获取响应结果

让我们逐步了解每个环节的实现细节：

### 导入必要的模块

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent" only_imports
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
```

这里我们导入了三个关键组件：

* **AIAgent** - 用于创建和管理 AI Agent 的核心类，它封装了 Agent 的行为和能力
* **AIGNE** - 框架的主入口，负责协调 Agent 的工作流程和生命周期管理
* **OpenAIChatModel** - 提供与 OpenAI 模型交互的接口，使 Agent 能够访问强大的 LLM 能力

### 创建 AIGNE 实例

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

这一步骤的关键点：

* AIGNE 实例作为核心运行时环境，连接 Agent 与底层 LLM 模型
* 我们选择了 OpenAI 的 "gpt-4o-mini" 模型作为 Agent 核心，它提供了良好的性能与成本平衡
* API 密钥从环境变量中安全读取，符合开发最佳实践
* 框架支持灵活切换不同提供商的模型，如 Anthropic Claude、Google Gemini 等

### 配置并创建 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
});
```

在这个简洁但强大的配置中：

* 使用 `AIAgent.from()` 工厂方法创建 Agent 实例，简化了初始化过程
* 通过 `instructions` 参数定义 Agent 的专业领域和行为边界
* 这个看似简单的配置实际上足以创建一个专注于加密货币市值信息的智能助手
* 框架将自动处理底层的提示工程和上下文管理，让您专注于业务逻辑

### 使用 Agent 处理用户输入

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent-invoke-agent" exclude_imports
const result = await aigne.invoke(agent, "What is crypto?");
console.log(result);
// Output: { $message: "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security" }
```

这个调用过程展示了：

* 使用 `aigne.invoke()` 方法将用户问题传递给 Agent 处理
* 该方法返回 Promise，需要使用 `await` 等待响应完成
* 输入参数包括 Agent 实例和用户的问题文本
* 响应结果采用标准化的格式，其中 `$message` 字段包含 Agent 生成的回答

## 示例代码

下面是一个完整的示例，展示了如何创建一个基本的 Agent 并使用它来响应用户的问题：

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
});

const result = await aigne.invoke(agent, "What is crypto?");
console.log(result);
// Output: { $message: "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security" }
```

## 提示

* **精确的指令设计**：Agent 的性能和行为很大程度上取决于 `instructions` 参数，明确、具体的指令能够显著提升响应质量
* **模型选择策略**：不同模型在能力、速度和成本上各有权衡，应根据具体应用场景选择最适合的模型
* **安全与隐私保障**：
  * 始终通过环境变量或安全服务管理 API 密钥
  * 实施适当的访问控制和权限边界
  * 对用户输入进行验证和过滤，防止潜在的注入攻击
* **统一的响应处理**：aigne 框架返回标准化的响应格式 `{ $message: "..." }`，便于在应用中进行一致处理
