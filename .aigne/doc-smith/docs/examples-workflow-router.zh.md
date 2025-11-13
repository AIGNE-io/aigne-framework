# 工作流路由器

本指南演示如何构建一个智能工作流，该工作流能自动将用户请求路由到最合适的专用 Agent。您将学习如何创建一个“分诊” Agent，它充当智能调度器，分析传入的查询并根据查询内容将其转发给其他 Agent。

## 概述

在许多应用程序中，用户请求可能属于不同类别，例如产品支持、用户反馈或一般性问题。路由器工作流提供了一种有效处理这种情况的方法，即使用一个主 Agent 对请求进行分类，并将其委托给正确的下游 Agent。这种模式确保用户能够快速有效地连接到正确的资源。

该工作流由一个主 `triage` Agent 和几个专用 Agent 组成：

-   **分诊 Agent**：入口点。它分析用户的查询，并决定应由哪个专用 Agent 处理。
-   **产品支持 Agent**：处理与产品使用相关的问题。
-   **反馈 Agent**：管理用户反馈和建议。
-   **其他 Agent**：一个通用 Agent，用于处理不属于其他类别的查询。

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "工作流路由器"
  shape: rectangle

  Triage-Agent: {
    label: "分诊 Agent"
    shape: diamond
  }

  Specialized-Agents: {
    shape: rectangle
    grid-columns: 3

    Product-Support-Agent: {
      label: "产品支持 Agent"
      shape: rectangle
    }

    Feedback-Agent: {
      label: "反馈 Agent"
      shape: rectangle
    }

    Other-Agent: {
      label: "其他 Agent"
      shape: rectangle
    }
  }
}

User -> Workflow.Triage-Agent: "用户查询"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Product-Support-Agent: "路由至"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Feedback-Agent: "路由至"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Other-Agent: "路由至"
```

## 前置条件

在运行此示例之前，请确保您已安装并配置好以下内容：

-   **Node.js**：版本 20.0 或更高。
-   **npm**：随 Node.js 一起安装。
-   **OpenAI API 密钥**：您需要一个 OpenAI 的 API 密钥来连接其语言模型。您可以从 [OpenAI Platform](https://platform.openai.com/api-keys) 获取。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需任何本地安装。

### 运行示例

该示例可以在一次性模式、交互式聊天模式下运行，也可以通过管道直接输入。

1.  **一次性模式（默认）**
    此命令使用默认问题执行工作流然后退出。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router
    ```

2.  **交互式聊天模式**
    使用 `--chat` 标志启动一个交互式会话，您可以在其中提出多个问题。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router --chat
    ```

3.  **管道输入**
    您可以将问题直接通过管道输入到命令中。

    ```sh icon=lucide:terminal
    echo "How do I return a product?" | npx -y @aigne/example-workflow-router
    ```

### 连接到 AI 模型

当您首次运行该示例时，系统将提示您连接到一个 AI 模型。您有以下几个选项：

1.  **AIGNE Hub（官方）**：最简单的入门方式。浏览器将打开，您可以按照提示进行连接。新用户会获得免费的 token 赠款。
2.  **AIGNE Hub（自托管）**：如果您托管自己的 AIGNE Hub 实例，可以提供其 URL 进行连接。
3.  **第三方模型提供商**：您可以通过设置包含 API 密钥的环境变量，直接连接到像 OpenAI 这样的提供商。

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY="your_openai_api_key_here"
    ```

    设置密钥后，再次运行示例命令。

## 实现深究

此工作流的核心是 `triage` Agent，它将其他 Agent 用作“技能”或“工具”。通过将 `toolChoice` 设置为 `"router"`，您可以指示 `triage` Agent 从可用技能中精确选择一个来处理传入的请求。

### 代码示例

以下 TypeScript 代码演示了如何定义专用 Agent 和主路由 Agent。

```typescript router.ts icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化聊天模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定义专用 Agent
const productSupport = AIAgent.from({
  name: "product_support",
  description: "用于协助处理任何与产品相关问题的 Agent。",
  instructions: `你是一个能够处理任何与产品相关问题的 Agent。
  你的目标是提供关于产品的准确且有用的信息。
  请保持礼貌、专业，并确保用户感到获得了支持。`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "用于协助处理任何与反馈相关问题的 Agent。",
  instructions: `你是一个能够处理任何与反馈相关问题的 Agent。
  你的目标是倾听用户的反馈，确认他们的输入，并提供适当的回应。
  请表现出同理心和理解，并确保用户感到被倾听。`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "用于协助处理任何一般性问题的 Agent。",
  instructions: `你是一个能够处理任何一般性问题的 Agent。
  你的目标是就广泛的主题提供准确且有用的信息。
  请保持友好、知识渊博，并确保用户对所提供的信息感到满意。`,
  outputKey: "other",
});

// 3. 定义分诊（路由器）Agent
const triage = AIAgent.from({
  name: "triage",
  instructions: `你是一个能够将问题路由到相应 Agent 的 Agent。
  你的目标是理解用户的查询，并将其引导至最适合协助他们的 Agent。
  请保持高效、清晰，并确保用户能快速连接到正确的资源。`,
  skills: [productSupport, feedback, other],
  toolChoice: "router", // 这会启用路由器模式
});

// 4. 初始化 AIGNE 并调用工作流
const aigne = new AIGNE({ model });

// 示例 1：产品支持查询
const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);

// 示例 2：反馈查询
const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);

// 示例 3：一般性查询
const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
```

### 预期输出

当您运行代码时，`triage` Agent 将分析每个问题并将其路由到相应的专用 Agent。最终输出将是一个对象，其键为所选 Agent 的 `outputKey`。

**产品支持查询：**
```json
{
  "product_support": "I’d be happy to help you with that! However, I need to know which specific product you’re referring to. Could you please provide me with the name or type of product you have in mind?"
}
```

**反馈查询：**
```json
{
  "feedback": "Thank you for sharing your feedback! I'm here to listen. Please go ahead and let me know what you’d like to share about the app."
}
```

**一般性查询：**
```json
{
  "other": "I can't provide real-time weather updates. However, you can check a reliable weather website or a weather app on your phone for the current conditions in your area. If you tell me your location, I can suggest a few sources where you can find accurate weather information!"
}
```

## 从源代码运行（可选）

如果您希望从仓库的本地克隆运行该示例，请按照以下步骤操作。

1.  **克隆仓库**

    ```sh icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安装依赖**

    导航到示例目录并使用 `pnpm` 安装依赖项。

    ```sh icon=lucide:terminal
    cd aigne-framework/examples/workflow-router
    pnpm install
    ```

3.  **运行示例**

    使用 `pnpm start` 命令运行工作流。命令行参数必须在 `--` 之后传递。

    ```sh icon=lucide:terminal
    # 以一次性模式运行
    pnpm start

    # 以交互式聊天模式运行
    pnpm start -- --chat

    # 使用管道输入
    echo "How do I return a product?" | pnpm start
    ```

### 命令行选项

您可以使用以下参数自定义执行：

| 参数 | 描述 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--chat` | 以交互式聊天模式运行。 |
| `--model <provider[:model]>` | 要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 |
| `--temperature <value>` | 模型生成的温度。 |
| `--top-p <value>` | Top-p 采样值。 |
| `--presence-penalty <value>` | 存在惩罚值。 |
| `--frequency-penalty <value>` | 频率惩罚值。 |
| `--log-level <level>` | 设置日志级别：`ERROR`、`WARN`、`INFO`、`DEBUG` 或 `TRACE`。 |
| `--input`, `-i <input>` | 直接指定输入。 |

## 总结

此示例展示了一种用于构建复杂 AI 工作流的强大且常见的模式。通过创建一个路由器 Agent，您可以有效地管理任务并将其委托给专用 Agent，从而实现更准确、更高效的应用程序。

要继续探索，请考虑以下相关示例：

<x-cards data-columns="2">
  <x-card data-title="顺序工作流" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    学习如何构建 Agent 按特定有序序列执行任务的工作流。
  </x-card>
  <x-card data-title="交接工作流" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    在专用 Agent 之间创建无缝过渡，以逐步解决复杂问题。
  </x-card>
</x-cards>