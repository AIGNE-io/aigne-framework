# Nano Banana

本指南将演示如何构建并运行一个能够生成图像的聊天机器人。通过遵循这些步骤，您将学会如何执行一个预构建的 AIGNE 示例、将其连接到 AI 模型，并使用框架的可观测性工具来检查其行为。

## 前提条件

在继续之前，请确保满足以下要求：

*   **Node.js：** 必须安装 20.0 或更高版本。您可以从 [nodejs.org](https://nodejs.org) 下载。
*   **OpenAI API 密钥：** 需要一个来自 [OpenAI](https://platform.openai.com/api-keys) 的 API 密钥才能与其图像生成模型进行交互。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需在本地安装。

### 运行示例

在您的终端中执行以下命令，以单一输入运行聊天机器人。此命令将下载并运行示例包。

```bash 使用单一输入运行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --input 'Draw an image of a lovely cat'
```

要启动一个交互式会话，您可以与聊天机器人进行对话，请使用 `--interactive` 标志。

```bash 以交互模式运行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --interactive
```

### 连接到 AI 模型

首次运行时，应用程序将检测到没有配置 AI 模型，并会提示您连接一个。

![首次设置时连接 AI 模型的提示。](../../../examples/nano-banana/run-example.png)

您有三个主要选项来连接 AI 模型：

#### 1. 通过官方 AIGNE Hub 连接（推荐）

这是最简单的方法。选择此选项将打开您的网络浏览器，并引导您在官方 AIGNE Hub 上完成授权过程。新用户会获得免费的 token 配额，以便立即开始使用。

![AIGNE Hub 授权屏幕。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 通过自托管的 AIGNE Hub 连接

如果您运营自己的 AIGNE Hub 实例，请选择此选项。系统将提示您输入自托管 Hub 的 URL 以完成连接。您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署您自己的 AIGNE Hub。

![提示输入自托管 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 通过第三方模型提供商连接

您可以通过将必要的 API 密钥配置为环境变量，直接连接到像 OpenAI 这样的第三方提供商。例如，要使用 OpenAI，请在您的终端中设置 `OPENAI_API_KEY` 变量。

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

设置环境变量后，再次运行 `npx` 命令。有关不同模型提供商支持的变量的完整列表，请参阅源代码仓库中的示例环境文件。

### 使用可观测性 UI 进行调试

AIGNE 框架包含一个内置的可观测性工具，以帮助您监控和调试您的 Agent。`aigne observe` 命令会启动一个本地 Web 服务器，提供 Agent 执行跟踪的详细视图。

首先，在您的终端中运行以下命令来启动观测服务器：

```bash 启动可观测性服务器 icon=lucide:terminal
aigne observe
```

![终端输出显示 aigne observe 命令成功启动服务器。](../../../examples/images/aigne-observe-execute.png)

服务器运行后，您可以在浏览器中打开提供的 URL（通常是 `http://localhost:7893`）来查看最近的 Agent 执行列表。此界面允许您检查每次跟踪的输入、输出、延迟和 token 使用情况，为调试和优化提供关键见解。

![AIGNE 可观测性 UI 显示 Agent 执行跟踪列表。](../../../examples/images/aigne-observe-list.png)

## 本地安装与执行

为了开发目的，您可能更愿意克隆仓库并在本地运行示例。

### 1. 克隆仓库

从 GitHub 克隆官方 AIGNE 框架仓库。

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例目录，并使用 `pnpm` 安装所需的依赖项。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/nano-banana
pnpm install
```

### 3. 运行示例

安装完成后，您可以使用项目 `package.json` 中定义的 `start` 脚本来运行示例。

```bash 运行本地示例 icon=lucide:terminal
pnpm start
```

## 总结

本文档提供了运行“Nano Banana”示例的逐步指南，该示例演示了一个具备图像生成功能的人工智能聊天机器人。您已经学会了如何直接使用 `npx` 执行示例、连接各种 AI 模型提供商，以及使用 `aigne observe` 命令来调试 Agent 行为。

有关更高级的用例和对框架功能的更深入了解，请参阅以下部分：

<x-cards data-columns="2">
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    了解如何配置和使用 Agent 进行图像生成。
  </x-card>
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    探索用于与语言模型交互的主要 Agent。
  </x-card>
</x-cards>
