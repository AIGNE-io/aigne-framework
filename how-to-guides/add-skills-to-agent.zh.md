# 为 Agent 添加技能

通过为 Agent 添加技能，您可以显著扩展其功能范围，使 Agent 能够执行更多专业任务。本指南将演示如何将 MCP Server 作为技能添加到 Agent，使其能够访问加密货币市场数据。

## 基本流程

为 Agent 添加技能的过程包括以下几个步骤：

1. **创建或获取技能 Agent** - 准备具有特定功能的 Agent 作为技能提供者
2. **配置主 Agent** - 创建主 Agent 并在 skills 数组中添加技能 Agent
3. **定义适当的指令** - 确保主 Agent 的指令能正确引导其使用添加的技能
4. **调用增强后的 Agent** - 使用具备新技能的 Agent 处理相关查询

让我们逐步了解各个环节的实现细节：

### 创建 MCP Agent 作为技能

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent-create-skill-agent" exclude_imports
const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});
```

**说明**：

* **技能来源**：使用 `MCPAgent.from()` 创建一个专门提供加密货币数据的技能 Agent
* **服务器选择**：`@mcpfun/mcp-server-ccxt` 包提供对全球多个交易所的加密货币数据访问能力
* **启动方式**：通过 npx 按需启动服务器，无需预先安装
* **实例化过程**：该方法是异步的，返回一个完全初始化并连接到服务器的 Agent 实例
* **能力范围**：此 MCP Agent 具备市场数据查询、交易操作和系统管理等多种技能

### 将技能添加到主 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent-add-skills" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
  skills: [ccxt],
});
```

**说明**：

* **技能集成**：通过 `skills` 数组参数将 ccxt MCP Agent 添加为主 Agent 的技能
* **配置结构**：
  * `skills`：接收一个 Agent 数组，每个元素都会成为可用技能
  * `instructions`：定义 Agent 的角色和行为准则，引导其正确使用技能
* **能力扩展**：集成后，主 Agent 继承了所有加密货币数据访问能力
* **知识分离**：主 Agent 负责自然语言理解，而技能 Agent 负责专业功能实现
* **自动路由**：框架会自动决定何时将请求路由到技能 Agent

### 调用带有技能的 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent-invoke-agent" exclude_imports
const result = await aigne.invoke(
  agent,
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message:"The current price of ABT/USD on Coinbase is $0.9684." }
```

**说明**：

* **使用方式**：调用方式与普通 Agent 完全相同，无需特殊处理
* **智能决策**：
  * Agent 分析用户问题涉及加密货币价格查询
  * 自动识别需要使用 ccxt 技能获取价格数据
  * 调用适当的技能方法获取 ABT/USD 在 Coinbase 的价格
* **结果处理**：将技术性的交易数据转换为用户友好的自然语言回复
* **无缝体验**：用户无需了解底层技能的存在或调用方式

## 示例代码

下面的示例展示了如何为 Agent 添加加密货币数据查询能力：

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-add-skills-to-agent"
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const ccxt = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@mcpfun/mcp-server-ccxt"],
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
  skills: [ccxt],
});

const result = await aigne.invoke(
  agent,
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message:"The current price of ABT/USD on Coinbase is $0.9684." }
```

## 提示

* **多技能支持**：可以添加多个不同类型的技能，只需在 `skills` 数组中包含多个技能 Agent
* **技能类型**：支持多种类型的技能 Agent：
  * **Function Agent**：提供编程函数能力
  * **MCP Agent**：提供专业领域服务
  * **AI Agent**：提供其他 AI 模型的能力
* **技能组合**：可以组合互补的技能创建多功能 Agent，如同时添加市场数据和新闻分析技能
