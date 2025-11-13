# 工作流群聊

本文档提供了使用 AIGNE 框架构建和运行多 Agent 群聊应用程序的分步指南。您将学习如何协调多个 AI Agent——管理者、作者、编辑和插画师——以协作完成一项任务，展示复杂 Agent 工作流的实际应用。

## 概述

在此工作流中，`群组管理者` Agent 担任中心协调员。当用户提供指令时，管理者会将请求引导至合适的专业 Agent。然后，这些 Agent 通过在群组内共享消息来协作完成任务。

下图说明了此交互流程：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  Group-Manager: {
    label: "群组管理者"
  }

  Writer: {
    label: "作者"
  }

  Editor: {
    label: "编辑"
  }

  Illustrator: {
    label: "插画师"
  }

}

User -> AIGNE-Framework.Group-Manager: "1. 发送指令"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Writer: "2. 委派任务"
AIGNE-Framework.Writer -> AIGNE-Framework.Editor: "3. 共享草稿（群组消息）"
AIGNE-Framework.Writer -> AIGNE-Framework.Illustrator: "3. 共享草稿（群组消息）"
AIGNE-Framework.Writer -> User: "3. 共享草稿（群组消息）"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Illustrator: "4. 请求创建图像"
```

交互流程如下：

1.  **用户**向**群组管理者**发送一条指令。
2.  **群组管理者**将初始任务委派给**作者** Agent。
3.  **作者** Agent 起草内容并将其作为群组消息共享，使其可供**编辑**、**插画师**和**用户**查看。
4.  然后，**管理者**请求**插画师**根据故事创作一幅图像。
5.  这个协作过程会一直持续，直到最初的指令被完成。

## 先决条件

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：随您的 Node.js 安装一同提供。
*   **OpenAI API 密钥**：Agent 与 OpenAI 语言模型交互时需要。请从 [OpenAI 平台](https://platform.openai.com/api-keys)获取密钥。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需克隆仓库。

### 运行示例

该应用程序支持多种执行模式。

#### 一次性模式

在默认模式下，应用程序处理单个输入指令然后终止。

```bash 以一次性模式运行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

#### 交互式聊天模式

使用 `--chat` 标志以交互模式运行应用程序，以便进行连续对话。

```bash 以交互式聊天模式运行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

#### 管道输入

您也可以直接从终端通过管道输入。

```bash 使用管道输入 icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### 连接到 AI 模型

首次运行示例时，系统将提示您连接到 AI 模型提供商。

![连接到 AI 模型](https://assets.aig nej.com/content/docs/examples/workflow-group-chat/run-example.png)

您有以下几个选项：

1.  **AIGNE Hub (官方)**：推荐的方法。官方 Hub 为新用户提供免费的令牌。
2.  **自托管 AIGNE Hub**：通过提供其 URL 连接到您自己的 AIGNE Hub 实例。
3.  **第三方模型提供商**：通过设置适当的环境变量，直接连接到像 OpenAI 这样的提供商。对于 OpenAI，请按如下方式设置您的 API 密钥：

    ```bash 设置 OpenAI API 密钥 icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key-here"
    ```

配置完成后，再次运行 `npx` 命令。

## 从源代码运行

要检查或修改代码，您可以克隆仓库并在本地运行示例。

### 1. 克隆仓库

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例目录并使用 `pnpm` 安装所需的包。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令执行应用程序。命令行参数必须在 `--` 之后传递。

```bash 以一次性模式运行 icon=lucide:terminal
pnpm start
```

```bash 以交互式聊天模式运行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 使用管道输入 icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

## 命令行选项

可以使用以下命令行参数自定义应用程序的行为。

| 参数 | 描述 | 默认值 |
|---|---|---|
| `--chat` | 以交互式聊天模式运行 | 已禁用（一次性模式） |
| `--model <provider[:model]>` | 要使用的 AI 模型，格式为 'provider\[:model]'，其中 model 是可选的。示例：'openai' 或 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | 模型生成的温度 | 提供商默认值 |
| `--top-p <value>` | Top-p 采样值 | 提供商默认值 |
| `--presence-penalty <value>` | 存在惩罚值 | 提供商默认值 |
| `--frequency-penalty <value>` | 频率惩罚值 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别 (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | 直接指定输入 | 无 |

### 用法示例

以下命令以 `DEBUG` 日志级别运行应用程序：

```bash 设置日志级别 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## 调试

要检查和分析 Agent 的行为，请使用 `aigne observe` 命令。此工具会启动一个本地 Web 服务器，并提供一个界面用于查看执行跟踪、调用详情和其他运行时数据，这对于调试 Agent 工作流至关重要。

要启动观察服务器，请运行：

```bash 启动观察服务器 icon=lucide:terminal
aigne observe
```

![启动 aigne observe](https://assets.aig nej.com/content/docs/examples/images/aigne-observe-execute.png)

运行后，Web 界面将显示最近的 Agent 执行列表，让您可以深入了解每次运行的详细信息。

![查看最近的执行](https://assets.aig nej.com/content/docs/examples/images/aigne-observe-list.png)

## 总结

本指南演示了如何运行和配置一个协作式、多 Agent 的群聊。要探索其他高级工作流模式，请参考以下示例：

<x-cards data-columns="2">
  <x-card data-title="工作流：交接" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  学习如何在专业 Agent 之间创建无缝过渡，以解决复杂问题。
  </x-card>
  <x-card data-title="工作流：编排" data-href="/examples/workflow-orchestration" data-icon="lucide:network">
  在复杂的处理流水线中协调多个 Agent 协同工作。
  </x-card>
</x-cards>