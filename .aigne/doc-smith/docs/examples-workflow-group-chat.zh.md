# 工作流群聊

本指南将演示如何使用 AIGNE 框架构建和运行一个多 Agent 群聊工作流。您将学习如何协调包括一个管理者在内的多个 Agent 来协同完成一项任务，模拟一个团队环境，其中 Agent 共享信息并共同努力实现一个共同目标。

## 概述

群聊工作流示例展示了一个复杂的多 Agent 系统，其中具有不同专业角色的 Agent 协同工作以完成用户的请求。该过程由一个 `Group Manager` Agent 管理，它负责指导其他 Agent（如 `Writer`、`Editor` 和 `Illustrator`）之间的对话和任务执行。

此示例支持两种主要操作模式：
*   **单次模式 (One-shot mode)**：工作流根据单个输入一次性运行至完成。
*   **交互模式 (Interactive mode)**：工作流进行持续对话，允许后续提问和动态交互。

核心交互模型如下：

```d2
direction: down

User: {
  shape: c4-person
}

GroupChat: {
  label: "群聊工作流"
  shape: rectangle

  Group-Manager: {
    label: "群组管理器"
    shape: rectangle
  }

  Collaborators: {
    label: "协作者"
    shape: rectangle
    grid-columns: 3

    Writer: {
      shape: rectangle
    }
    Editor: {
      shape: rectangle
    }
    Illustrator: {
      shape: rectangle
    }
  }
}

User -> GroupChat.Group-Manager: "1. 用户请求"
GroupChat.Group-Manager -> GroupChat.Collaborators.Writer: "2. 委派任务"
GroupChat.Collaborators.Writer <-> GroupChat.Collaborators.Editor: "3. 协作"
GroupChat.Collaborators.Editor <-> GroupChat.Collaborators.Illustrator: "4. 协作"
GroupChat.Collaborators.Writer -> GroupChat.Group-Manager: "5. 发送结果"
GroupChat.Group-Manager -> User: "6. 最终输出"
```

## 前提条件

在继续之前，请确保您的开发环境满足以下要求：
*   **Node.js**：版本 20.0 或更高。
*   **npm**：随 Node.js 一起提供。
*   **OpenAI API 密钥**：默认模型配置所需。您可以从 [OpenAI 平台](https://platform.openai.com/api-keys)获取。

## 快速入门

您可以使用 `npx` 直接运行此示例，而无需克隆代码仓库。

### 运行示例

在您的终端中执行以下命令之一：

要在默认的单次模式下运行工作流：
```bash 在单次模式下运行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

要启动交互式聊天会话：
```bash 在交互模式下运行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

您也可以通过管道直接提供输入：
```bash 使用管道输入运行 icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### 连接到 AI 模型

首次运行该示例时，由于尚未配置任何 API 密钥，它会提示您连接到一个 AI 模型提供商。

![连接到 AI 模型的初始设置提示。](../../../examples/workflow-group-chat/run-example.png)

您有以下几种选择：

#### 1. 连接到 AIGNE Hub (推荐)

这是最简单的入门方式，并且为新用户提供免费额度。

1.  选择第一个选项：`Connect to the Arcblock official AIGNE Hub`。
2.  您的网络浏览器将打开一个页面以授权 AIGNE CLI。
3.  点击“Approve”以授予必要的权限。CLI 将自动配置。

![AIGNE Hub 连接的授权对话框。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 连接到自托管的 AIGNE Hub

如果您正在运行自己的 AIGNE Hub 实例：

1.  选择第二个选项：`Connect to your self-hosted AIGNE Hub`。
2.  在提示时输入您的 AIGNE Hub 实例的 URL。
3.  按照浏览器中的说明完成连接。

![提示输入自托管 AIGNE Hub URL 的界面。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 配置第三方模型提供商

您可以通过设置环境变量直接连接到像 OpenAI 这样的提供商。

1.  退出交互式提示。
2.  在您的终端中设置 `OPENAI_API_KEY` 环境变量：

    ```bash 配置 OpenAI API 密钥 icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

3.  再次运行示例命令。

对于其他提供商，如 Google Gemini 或 DeepSeek，请参阅项目中的 `.env.local.example` 文件以获取正确的环境变量名称。

## 本地安装和使用

出于开发目的，您可以克隆代码仓库并在本地运行示例。

### 1. 克隆代码仓库

```bash 克隆框架代码仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装所需的包。

```bash 安装依赖项 icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令来运行工作流。命令行参数必须在 `--` 之后传递。

要在单次模式下运行：
```bash 在单次模式下运行 icon=lucide:terminal
pnpm start
```

要在交互式聊天模式下运行：
```bash 在交互模式下运行 icon=lucide:terminal
pnpm start -- --chat
```

要使用管道输入：
```bash 使用管道输入运行 icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

### 命令行选项

该示例接受几个命令行参数来自定义其行为：

| 参数 | 描述 | 默认值 |
|-----------|-------------|---------|
| `--chat` | 以交互式聊天模式运行 | 禁用 (单次模式) |
| `--model <provider[:model]>` | 要使用的 AI 模型，格式为 'provider\[:model]'，其中 model 是可选的。例如：'openai' 或 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | 模型生成的温度值 | 提供商默认值 |
| `--top-p <value>` | Top-p 采样值 | 提供商默认值 |
| `--presence-penalty <value>` | 存在惩罚值 | 提供商默认值 |
| `--frequency-penalty <value>` | 频率惩罚值 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别 (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | 直接指定输入 | 无 |

#### 示例

```bash 设置日志级别 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 使用特定模型 icon=lucide:terminal
pnpm start -- --model openai:gpt-4o-mini
```

## 使用 AIGNE Observe 进行调试

要检查执行流程并调试 Agent 的行为，您可以使用 `aigne observe` 命令。该工具会启动一个本地 Web 服务器，提供 Agent 追踪的详细视图。

首先，在另一个终端中启动可观测性服务器：
```bash 启动可观测性服务器 icon=lucide:terminal
aigne observe
```
![显示 AIGNE Observe 服务器启动的终端输出。](../../../examples/images/aigne-observe-execute.png)

运行工作流示例后，在浏览器中打开 `http://localhost:7893` 查看追踪信息。您可以检查每个 Agent 在整个执行过程中的输入、输出和内部状态。

![AIGNE Observe Web 界面显示追踪列表。](../../../examples/images/aigne-observe-list.png)

## 总结

本指南提供了运行工作流群聊示例的逐步演练。您学习了如何使用 `npx` 执行工作流、连接到各种 AI 模型提供商以及在本地安装以进行开发。您还了解了如何使用 `aigne observe` 来调试 Agent 交互。

要了解更复杂的模式，请浏览 AIGNE 框架文档中的其他示例。

<x-cards data-columns="2">
  <x-card data-title="工作流：切换" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    学习如何在专业 Agent 之间创建无缝过渡以解决复杂问题。
  </x-card>
  <x-card data-title="工作流：编排" data-icon="lucide:network" data-href="/examples/workflow-orchestration">
    探索如何协调多个 Agent 在复杂的处理管道中协同工作。
  </x-card>
</x-cards>