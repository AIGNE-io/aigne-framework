# Nano Banana

本文档提供了如何使用 AIGNE 框架创建和运行具有图像生成功能的聊天机器人的分步指南。您将学习如何直接从命令行执行该示例，将其连接到各种 AI 模型提供商，以及调试其操作。

## 概述

“Nano Banana” 示例通过将语言模型与图像生成模型相结合，展示了 AIGNE 框架的实际应用。AI agent 被配置为解释用户的文本提示并生成相应的图像。该示例专为快速入门而设计，无需任何本地安装即可运行。

下图说明了 Nano Banana 示例的工作流程，从用户输入到图像生成：

```d2
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "CLI"
}

Nano-Banana-Example: {
  label: "Nano Banana 示例\n(AI Agent)"
  shape: rectangle

  Language-Model: {
    label: "语言模型\n(提示词解释)"
    shape: rectangle
  }

  Image-Generation-Model: {
    label: "图像生成模型\n(图像创建)"
    shape: rectangle
  }
}

AI-Model-Provider: {
  label: "AI 模型提供商\n(例如 OpenAI)"
  shape: cylinder
}

User -> CLI: "1. 执行命令\n(例如 npx ... --input '...a cat')"
CLI -> Nano-Banana-Example: "2. 使用文本提示运行 Agent"
Nano-Banana-Example.Language-Model -> AI-Model-Provider: "3. 处理提示词"
AI-Model-Provider -> Nano-Banana-Example.Image-Generation-Model: "4. 根据处理后的提示词生成图像"
Nano-Banana-Example -> User: "5. 返回生成的图像"

```

## 前提条件

为了成功运行此示例，您的系统上必须具备以下组件：

*   **Node.js**: 20.0 或更高版本。从 [nodejs.org](https://nodejs.org) 下载。
*   **npm**: Node 包管理器，包含在 Node.js 安装中。
*   **AI 模型提供商 API 密钥**：与 AI 服务交互所必需。需要来自 [OpenAI](https://platform.openai.com/api-keys) 等提供商的 API 密钥。

## 快速入门（无需安装）

此示例可使用 `npx` 直接从您的终端执行，无需本地安装。

### 使用单个输入运行

若要根据特定文本提示生成图像，请使用 `--input` 标志。该命令将执行一次并输出结果。

```bash 使用单个输入运行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --input 'Draw an image of a lovely cat'
```

### 在交互式聊天模式下运行

如需进行连续的对话会话，请使用 `--chat` 标志。这将启动一个交互模式，您可以在其中提交多个提示。

```bash 在交互模式下运行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --chat
```

## 连接到 AI 模型

首次执行时，应用程序将提示您连接到 AI 模型。有几种方法可以建立此连接。

![终端提示用户为 AI 模型选择连接方法。](/media/examples/nano-banana/run-example.png)

### 1. 通过 AIGNE Hub（官方）连接

这是推荐给新用户的方法。

1.  选择第一个选项，通过官方 AIGNE Hub 连接。
2.  您的默认网络浏览器将打开 AIGNE Hub 连接页面。
3.  按照屏幕上的说明完成连接。新用户将获得一定数量的免费令牌用于试用。

![AIGNE Hub 连接页面显示在网络浏览器中。](/media/examples/images/connect-to-aigne-hub.png)

### 2. 通过自托管的 AIGNE Hub 连接

如果您或您的组织运营着一个私有的 AIGNE Hub 实例，请使用此选项。

1.  在终端中选择第二个选项。
2.  在提示时输入您自托管的 AIGNE Hub 的 URL。
3.  按照后续提示完成连接。

要部署自托管的 AIGNE Hub，您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安装它。

![终端提示输入自托管 AIGNE Hub 的 URL。](/media/examples/images/connect-to-self-hosted-aigne-hub.png)

### 3. 通过第三方模型提供商连接

您可以通过将 API 密钥配置为环境变量，直接连接到第三方模型提供商，例如 OpenAI。

例如，要使用 OpenAI，请在您的 shell 中设置 `OPENAI_API_KEY` 变量：

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

设置环境变量后，再次执行运行命令。有关配置其他提供商的详细信息，请参阅 [模型配置](./models-configuration.md) 指南。

## 安装和本地执行

对于希望检查或修改源代码的用户，可以从仓库的本地副本运行该示例。

### 1. 克隆仓库

使用 `git` 将 AIGNE 框架仓库克隆到您的本地计算机。

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例的目录，并使用 `pnpm` 安装所需的依赖项。

```bash 安装依赖项 icon=lucide:terminal
cd aigne-framework/examples/nano-banana
pnpm install
```

### 3. 运行示例

执行项目中定义的 `start` 脚本来运行应用程序。

```bash 运行本地示例 icon=lucide:terminal
pnpm start
```

## 调试

AIGNE 框架包含 `aigne observe`，这是一个命令行工具，可以启动一个本地 Web 服务器，用于监控和分析 agent 的执行情况。

1.  **启动观察服务器**：在您的终端中，运行 `aigne observe` 命令。

    ![在终端中执行 'aigne observe' 命令。](/media/examples/images/aigne-observe-execute.png)

2.  **查看执行情况**：该命令将输出一个 URL。在浏览器中打开此 URL 以访问观察界面，该界面列出了最近的 agent 运行情况。

    ![AIGNE Observe Web 界面显示了最近的 agent 执行列表。](/media/examples/images/aigne-observe-list.png)

3.  **检查执行详情**：点击一次执行，可以查看其详细的跟踪信息，包括对模型和工具的调用。这个界面对于调试、性能分析和理解 agent 行为非常有价值。

## 总结

本指南详细介绍了使用 AIGNE 框架运行一个图像生成聊天机器人的过程。您已经学会了如何使用 `npx` 执行示例、连接到 AI 模型、从源代码运行以及利用 `aigne observe` 工具进行调试。

有关相关主题的更多信息，请查阅以下文档：

<x-cards data-columns="2">
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    了解有关生成图像的特定配置的更多信息。
  </x-card>
  <x-card data-title="AIGNE CLI" data-icon="lucide:terminal" data-href="https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md">
    探索 AIGNE 命令行界面的全部功能。
  </x-card>
</x-cards>