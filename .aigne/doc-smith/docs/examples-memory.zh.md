# 记忆

想构建一个能记住您的聊天机器人吗？本指南演示了如何使用 AIGNE 框架和 `FSMemory` 插件创建一个具有持久记忆功能的聊天机器人。您将学习如何使 Agent 能够回忆起之前对话中的信息，从而实现更连续和更具上下文感知能力的交互。

## 概述

为了让聊天机器人真正有效，它需要记住过去的交互。本示例展示了如何使用 `FSMemory` 插件实现这一点，该插件将对话数据保存到本地文件系统。这使得聊天机器人能够在不同会话之间保持状态，提供更加个性化的用户体验。

本文档将指导您运行该示例、将其连接到 AI 模型，并理解记忆是如何被记录和检索的。有关使用去中心化存储的替代持久化方法，请参阅 [DID Spaces 记忆](./examples-memory-did-spaces.md)示例。

## 前提条件

在开始之前，请确保您具备以下条件：

*   **Node.js**：版本 20.0 或更高。
*   **OpenAI API 密钥**：需要 API 密钥才能连接到 OpenAI 模型。您可以从 [OpenAI Platform](https://platform.openai.com/api-keys) 获取。

## 快速开始

得益于 `npx`，您可以直接从终端运行此示例，无需本地安装。

### 运行示例

执行以下命令。第一个命令给予聊天机器人一条信息，第二个命令测试其回忆信息的能力。

```sh 运行带记忆功能的聊天机器人 icon=lucide:terminal
npx -y @aigne/example-memory --input 'I like blue color'
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

为了进行更自然的、一来一回的对话，您可以以交互模式启动聊天机器人。

```sh 以交互式聊天模式运行 icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### 连接到 AI 模型

Agent 需要连接到 AI 模型才能正常工作。首次运行该示例时，系统会提示您选择一种连接方法。

#### 1. AIGNE Hub (推荐)

最简单的方法是通过官方的 AIGNE Hub 连接。选择第一个选项，您的浏览器将打开进行身份验证。新用户会自动获得充足的代币分配以供入门。

![连接到 AIGNE Hub](../images/connect-to-aigne-hub.png)

#### 2. 自托管 AIGNE Hub

如果您的组织使用自托管的 AIGNE Hub，请选择第二个选项并提供您实例的 URL 进行连接。

![连接到自托管的 AIGNE Hub](../images/connect-to-self-hosted-aigne-hub.png)

#### 3. 第三方模型提供商

您也可以直接连接到像 OpenAI 这样的第三方提供商。为此，请在运行示例前将您的 API 密钥配置为环境变量。

```sh 设置您的 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

设置密钥后，再次运行 `npx` 命令。更多配置示例，请参见项目源代码中的 `.env.local.example` 文件。

## 本地安装

如果您希望检查代码或进行修改，可以在本地设置项目。

### 1. 克隆仓库

首先从 GitHub 克隆 `aigne-framework` 仓库。

```sh 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

进入示例的目录并使用 `pnpm` 安装所需的包。

```sh 安装依赖项 icon=lucide:terminal
cd aigne-framework/examples/memory
pnpm install
```

### 3. 运行示例

安装依赖项后，您可以使用 `start` 脚本执行示例。

```sh 在本地运行示例 icon=lucide:terminal
pnpm start
```

## 记忆的工作原理

记忆功能由 AIGNE 框架的增强文件系统（AFS）中的两个核心模块提供支持：`history` 和 `UserProfileMemory`。

### 记录对话

1.  **历史记录日志**：当用户发送消息且 AI 回复时，这个对话对会保存到 AFS 的 `history` 模块中。
2.  **个人资料提取**：`UserProfileMemory` 模块分析对话并提取关于用户的关键细节，例如他们的姓名或偏好。然后，这些信息会单独存储在 AFS 的 `user_profile` 模块中。

### 检索对话

当用户发送新消息时，框架会检索存储的信息，为 AI 模型提供必要的上下文。

1.  **注入用户个人资料**：系统首先加载用户的个人资料，并将其直接注入到系统提示的 `<related-memories>` 块中。这确保了 Agent 能立即知晓关键事实。

    ```text 带记忆的系统提示
    You are a friendly chatbot
    
    <related-memories>
    - |
      name:
        - name: Bob
      interests:
        - content: likes blue color
    
    </related-memories>
    ```

2.  **注入对话历史**：接下来，最近的对话历史被格式化为一系列消息。这段历史连同系统提示一起发送给 AI 模型。

    ```json 注入的聊天消息
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..." 
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "I'm Bob and I like blue color" }]
      },
      {
        "role": "agent",
        "content": [{ "type": "text", "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?" }]
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "What is my favorite color?" }]
      }
    ]
    ```

3.  **生成响应**：AI 模型处理整个负载——系统提示、用户个人资料和聊天历史——以生成一个符合上下文的适当响应。

    **AI 响应：**
    ```text
    You mentioned earlier that you like the color blue
    ```

## 调试

要检查 Agent 的行为，请使用 `aigne observe` 命令。该命令会启动一个本地 Web 服务器，提供一个详细且用户友好的界面来查看执行跟踪。这是调试、性能调优和理解您的 Agent 如何处理信息的重要工具。

![执行 aigne observe](../images/aigne-observe-execute.png)

运行后，您可以访问 Web UI 查看最近的执行列表，并深入了解每次调用的详细信息。

![aigne observe 中的最近执行列表](../images/aigne-observe-list.png)

## 总结

本示例展示了如何使用 AIGNE 框架构建一个具有持久记忆功能的聊天机器人。通过利用 `FSMemory` 插件，Agent 可以存储和回忆对话历史及用户个人资料，从而创建更智能、更个性化的交互。

如需进一步阅读，请探索以下相关主题：

<x-cards data-columns="2">
  <x-card data-title="DID Spaces 记忆" data-icon="lucide:database" data-href="/examples/memory-did-spaces">
    了解如何使用 DID Spaces 进行去中心化存储以实现记忆持久化。
  </x-card>
  <x-card data-title="核心概念：记忆" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/memory">
    深入了解 AIGNE 框架中记忆背后的架构概念。
  </x-card>
</x-cards>