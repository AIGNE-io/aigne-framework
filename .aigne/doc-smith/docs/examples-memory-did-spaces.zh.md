本文档将指导您如何使用 DID Spaces 和 AIGNE 框架构建一个具有持久化内存的聊天机器人。您将学习如何利用 `DIDSpacesMemory` 插件，使您的 Agent 能够以安全、去中心化的方式跨多个会话保留对话历史。

# DID Spaces Memory

## 概述

本示例演示了如何将持久化内存集成到 AI Agent 中。与忘记过去交互的无状态聊天机器人不同，本示例展示了一个能够存储用户个人资料信息、从先前对话中回忆偏好，并根据存储的内存提供个性化响应的 Agent。

此功能通过使用来自 `@aigne/agent-library` 的 `DIDSpacesMemory` 插件实现，该插件连接到 DID Spaces 实例以存储和检索对话历史。

## 前置要求

在继续之前，请确保已安装并配置以下各项：

*   **Node.js**: 20.0 或更高版本。
*   **npm**: 包含在 Node.js 中。
*   **OpenAI API 密钥**: 语言模型所需。可从 [OpenAI 平台](https://platform.openai.com/api-keys)获取。
*   **DID Spaces 凭证**: 内存持久化所需。

## 快速入门

您可以使用 `npx` 直接在终端中运行此示例，无需本地安装。

### 1. 运行示例

在您的终端中执行以下命令：

```bash memory-did-spaces icon=lucide:terminal
npx -y @aigne/example-memory-did-spaces
```

### 2. 连接到 AI 模型

该 Agent 需要连接到一个大型语言模型。首次运行时，系统将提示您连接到一个模型提供商。

![连接到 AI 模型](https://static.AIGNE.io/aigne-docs/images/examples/run-example.png)

您有以下几种连接选项：

*   **AIGNE Hub (官方)**: 这是最简单的方法。您的浏览器将打开官方的 AIGNE Hub，您可以在那里登录。新用户会获得免费的 token，可以立即开始体验。

    ![连接到官方 AIGNE Hub](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-aigne-hub.png)

*   **AIGNE Hub (自托管)**: 如果您运行自己的 AIGNE Hub 实例，请选择此选项并输入其 URL。您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署自托管的 AIGNE Hub。

    ![连接到自托管 AIGNE Hub](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-self-hosted-aigne-hub.png)

*   **第三方模型提供商**: 您可以直接连接到 OpenAI 等提供商。为此，请在执行命令前将您的 API 密钥设置为环境变量。

    ```bash 导出 OpenAI 密钥 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    有关 DeepSeek 或 Google Gemini 等提供商的更多配置选项，请参阅源仓库中的 `.env.local.example` 文件。

配置模型连接后，再次运行 `npx` 命令以启动聊天机器人。

## 本地安装与执行

对于希望检查源代码或进行修改的开发者，请按照以下步骤在本地运行示例。

### 1. 克隆仓库

首先，克隆官方的 AIGNE 框架仓库：

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例目录并使用 pnpm 安装所需的依赖项。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/memory-did-spaces
pnpm install
```

### 3. 运行示例

通过执行 `start` 脚本来启动应用程序。

```bash 运行示例 icon=lucide:terminal
pnpm start
```

该脚本将运行一系列测试以展示内存功能，将结果保存到 Markdown 文件中，并在控制台中显示文件路径供您查看。

## 工作原理

本示例利用 `DIDSpacesMemory` 插件为 Agent 提供持久化和去中心化的内存。下图说明了此工作流程：

```d2
direction: down

User: {
  shape: c4-person
}

AI-Agent: {
  label: "AI Agent"
  shape: rectangle

  DIDSpacesMemory-Plugin: {
    label: "DIDSpacesMemory 插件"
  }
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

User -> AI-Agent: "2. 用户发送消息"
AI-Agent -> User: "7. Agent 发送具有上下文感知的响应"

AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "1. 使用凭证进行初始化"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "3. 检索对话历史"
DID-Spaces -> AI-Agent.DIDSpacesMemory-Plugin: "4. 为 Agent 提供上下文"
AI-Agent -> AI-Agent.DIDSpacesMemory-Plugin: "5. 处理新的交互"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "6. 保存更新后的历史"

```

流程如下：

1.  **初始化**: 使用 `DIDSpacesMemory` 插件对 Agent 进行初始化，该插件配置了 DID Spaces 实例的 URL 和身份验证凭证。
2.  **交互**: 当您与聊天机器人交谈时，每个用户输入和 Agent 响应都会被记录下来。
3.  **存储**: `DIDSpacesMemory` 插件会自动将对话历史保存到您指定的 DID Space 中。
4.  **检索**: 在后续会话中，该插件会检索过去的对话历史，为 Agent 提供记住先前交互所需的上下文。

这种去中心化的方法确保了内存在用户 DID 的控制下是安全、私密且可移植的。

## 配置

该示例包含一个预配置的 DID Spaces 端点用于演示。对于生产环境，您必须更新配置以指向您自己的实例。

此配置在实例化 `DIDSpacesMemory` 插件时应用：

```typescript memory-config.ts icon=logos:typescript
import { DIDSpacesMemory } from '@aigne/agent-library';

// ...

const memory = new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_AUTHENTICATION_TOKEN",
  },
});
```

请将 `"YOUR_DID_SPACES_URL"` 和 `"Bearer YOUR_AUTHENTICATION_TOKEN"` 替换为您的特定端点和凭证。

## 调试

要监控和分析 Agent 的行为，请使用 `aigne observe` 命令。该工具会启动一个本地 Web 服务器，提供 Agent 执行跟踪的详细视图。它是调试、理解信息流和优化性能的重要工具。

要启动观察服务器，请运行：

```bash aigne-observe icon=lucide:terminal
aigne observe
```

![AIGNE Observe 执行](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-execute.png)

Web 界面将显示最近执行的列表，允许您检查每次运行的输入、输出、工具调用和模型交互。

![AIGNE Observe 列表](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-list.png)

## 总结

本示例提供了一个功能性演示，展示了如何使用 AIGNE 框架和 DID Spaces 将持久化、去中心化的内存集成到 AI Agent 中。通过遵循本指南，您可以创建更智能、更具上下文感知能力的聊天机器人。

如需进一步阅读，请参阅以下部分：
<x-cards data-columns="2">
  <x-card data-title="内存概念" data-href="/developer-guide/core-concepts/memory" data-icon="lucide:book-open">了解更多关于内存如何在 AIGNE 框架中工作的信息。</x-card>
  <x-card data-title="框架示例" data-href="/examples" data-icon="lucide:layout-template">探索其他实际示例和用例。</x-card>
</x-cards>