# MCP Blocklet

本文档介绍了如何利用 AIGNE 框架和模型上下文协议 (MCP) 与托管在 Blocklet 平台上的应用程序进行交互。该示例支持单次执行、交互式聊天模式，以及针对模型和 I/O 管道的自定义设置。

## 前置条件

在继续之前，请确保您的系统上已安装并配置好以下组件：

*   **Node.js**: 版本 20.0 或更高。
*   **npm**: 随 Node.js 安装一同提供。
*   **OpenAI API 密钥**: 与 OpenAI 模型交互时需要。您可以从 [OpenAI API 密钥页面](https://platform.openai.com/api-keys) 获取。

以下依赖项是可选的，仅当您打算从源代码运行该示例时才需要：

*   **Bun**: 一个 JavaScript 运行时，此处用于运行测试和示例。
*   **pnpm**: 一个包管理器。

## 快速上手

本节提供了直接运行该示例而无需本地安装的说明。

### 运行示例

首先，将您的目标 Blocklet 应用程序的 URL 设置为环境变量。

```bash 设置您的 Blocklet 应用 URL icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

您可以在多种模式下执行该示例：

*   **单次模式 (默认)**: 发送单个请求并接收响应。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-blocklet
    ```

*   **交互式聊天模式**: 启动一个持续的聊天会话。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-blocklet --chat
    ```

*   **管道输入**: 使用管道输入作为提示。

    ```bash icon=lucide:terminal
    echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
    ```

### 连接到 AI 模型

执行该示例需要连接到 AI 模型。在首次运行时，如果未配置连接，系统将提示您选择一种连接方法。

![首次连接 AI 模型设置提示](../../../examples/mcp-blocklet/run-example.png)

有多种方法可以建立连接：

#### 1. 通过官方 AIGNE Hub 连接

这是推荐的方法。选择此选项将在您的网络浏览器中打开官方 AIGNE Hub 的认证页面。按照屏幕上的说明完成连接。新用户将自动获得 400,000 个 token 供使用。

![授权 AIGNE CLI 连接到 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 通过自托管的 AIGNE Hub 连接

如果您运行自己的 AIGNE Hub 实例，请选择第二个选项。系统将提示您输入自托管 Hub 的 URL 以完成连接。

![输入您自托管的 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

要部署自托管的 AIGNE Hub，您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes) 安装。

#### 3. 通过第三方模型提供商连接

您可以通过设置适当的 API 密钥作为环境变量，直接连接到第三方模型提供商，例如 OpenAI。

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

有关各种提供商（例如 DeepSeek、Google Gemini）支持的环境变量的完整列表，请参阅示例源代码中的 `.env.local.example` 文件。配置环境变量后，再次运行示例命令。

### 调试

AIGNE 框架包含一个本地可观测性服务器，用于监控和分析 Agent 执行数据。该工具对于调试、性能调优和理解 Agent 行为至关重要。

要启动该服务器，请运行以下命令：

```bash 启动观测服务器 icon=lucide:terminal
aigne observe
```

![显示 aigne observe 命令正在运行的终端输出](../../../examples/images/aigne-observe-execute.png)

服务器运行后，您可以通过 `http://localhost:7893` 访问 Web 界面，查看最近的 Agent 追踪列表并检查详细的调用信息。

![显示追踪列表的 Aigne 可观测性 Web 界面](../../../examples/images/aigne-observe-list.png)

## 从源代码安装

出于开发目的，您可以从仓库的本地克隆运行该示例。

### 1. 克隆仓库

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装所需的包。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. 运行示例

执行启动脚本以运行应用程序。

```bash 以单次模式运行 icon=lucide:terminal
pnpm start
```

您也可以直接将 Blocklet 应用程序 URL 作为参数提供。

```bash icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## 运行选项

该应用程序支持多个命令行参数进行自定义。

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--chat` | 启用交互式聊天模式。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式为 `provider[:model]`。示例：`openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>`| 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>`| 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志记录级别。选项：`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 通过命令行直接提供输入。 | 无 |

使用 `pnpm` 从源代码运行时，您必须使用 `--` 将参数传递给脚本。

**示例：**

```bash 以交互式聊天模式运行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 将日志记录级别设置为 DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 使用管道输入 icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## 总结

本指南详细介绍了运行 MCP Blocklet 示例的流程，包括快速启动执行、模型配置、调试和本地安装。有关更高级的用例和相关概念，请参阅以下文档。

<x-cards data-columns="2">
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">
    了解如何将 AIGNE 框架 Agent 作为模型上下文协议 (MCP) 服务器运行。
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/mcp-agent">
    了解如何通过 MCP 连接到外部系统并与之交互。
  </x-card>
</x-cards>