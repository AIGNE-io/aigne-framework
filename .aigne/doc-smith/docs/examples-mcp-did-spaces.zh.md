# MCP DID Spaces

本文档为通过模型上下文协议（MCP）构建与 DID Spaces 集成的聊天机器人提供全面指南。遵循这些说明，您将能够创建一个 AI Agent，利用 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 的能力，在去中心化存储环境中安全地访问和管理文件。

## 先决条件

为确保此示例成功执行，请确认已安装并配置以下组件：

*   **Node.js**：版本 20.0 或更高版本。
*   **OpenAI API 密钥**：AI 模型需要一个有效的 API 密钥。密钥可从 [OpenAI 平台](https://platform.openai.com/api-keys) 获取。
*   **DID Spaces MCP 服务器凭证**：与您指定的 DID Space 交互需要身份验证详情。

## 快速入门

此示例可使用 `npx` 直接在您的终端中执行，无需本地安装。

### 1. 设置环境变量

首先，使用您的 DID Spaces 服务器凭证配置环境变量。您空间的 URL 和访问密钥可以从您的 Blocklet 的管理设置中生成。

```bash 设置 DID Spaces 凭证 icon=lucide:terminal
# 替换为您的 DID Spaces 应用 URL
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"

# 在 个人资料 -> 设置 -> 访问密钥 中创建一个密钥，将 Auth Type 设置为 "Simple"
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. 运行示例

设置环境变量后，执行以下命令以初始化聊天机器人。

```bash 运行示例 icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

### 3. 连接到 AI 模型

聊天机器人需要连接到一个大语言模型（LLM）才能运行。首次运行时，将出现一个提示，引导您完成连接设置。

![首次运行提示 AI 模型连接](../../../examples/mcp-did-spaces/run-example.png)

建立连接主要有三种方法：

#### 选项 1：AIGNE Hub（推荐）

这是最直接的方法。官方 AIGNE Hub 为新用户提供免费的代币。要使用此选项，请在提示中选择第一个选项。您的网络浏览器将打开 AIGNE Hub 授权页面，您可以在其中批准连接请求。

![授权 AIGNE Hub 连接](../../../examples/images/connect-to-aigne-hub.png)

#### 选项 2：自托管的 AIGNE Hub

对于运行私有 AIGNE Hub 实例的用户，请选择第二个选项。系统将提示您输入自托管中心的 URL。有关部署个人 AIGNE Hub 的说明，请参见 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ)。

![连接到自托管的 AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 选项 3：第三方模型提供商

还支持与第三方 LLM 提供商（如 OpenAI）直接集成。将相应的 API 密钥配置为环境变量，然后再次执行运行命令。

```bash 配置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

有关其他配置示例，包括 DeepSeek 和 Google Gemini 等提供商，请参阅源存储库中的 `.env.local.example` 文件。

连接 AI 模型后，该示例将对您的 DID Space 执行一系列测试操作，将结果记录到控制台，并生成一个总结结果的 Markdown 文件。

## 工作原理

此示例使用一个 `MCPAgent`，通过模型上下文协议（MCP）与 DID Spaces 服务器进行交互。该协议使 Agent 能够动态发现和利用“技能”，这些技能是 DID Spaces 功能的直接映射。

下图说明了操作流程：

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle
}

DID-Spaces-Server: {
  label: "DID Spaces MCP 服务器"
  shape: rectangle

  Skills: {
    label: "可用技能"
    shape: rectangle
    list-objects: "list_objects"
    write-object: "write_object"
    read-object: "read_object"
    head-space: "head_space"
    delete-object: "delete_object"
  }
}

DID-Space: {
  label: "DID Space"
  shape: cylinder
}

AI-Agent -> MCPAgent: "3. 执行命令\n(例如 'list files')"
MCPAgent -> DID-Spaces-Server: "1. 连接与认证"
DID-Spaces-Server -> MCPAgent: "2. 提供技能"
MCPAgent -> DID-Space: "4. 通过技能执行操作"

```

操作流程如下：
1.  `MCPAgent` 连接到指定的 DID Spaces MCP 服务器端点。
2.  它使用提供的授权凭证进行身份验证。
3.  服务器向 Agent 提供一组技能，例如 `list_objects` 和 `write_object`。
4.  `MCPAgent` 集成这些技能，允许主 AI Agent 根据用户输入或编程逻辑在 DID Space 内执行文件和数据管理任务。

### 可用技能

该集成将几个关键的 DID Spaces 操作作为 Agent 可以利用的技能暴露出来：

| 技能 | 描述 |
| --------------- | ---------------------------------------------- |
| `head_space` | 检索有关 DID Space 的元数据。 |
| `read_object` | 读取指定对象（文件）的内容。 |
| `write_object` | 将新内容写入对象（文件）。 |
| `list_objects` | 列出目录中的所有对象（文件）。 |
| `delete_object` | 删除指定的对象（文件）。 |

## 配置

对于生产部署，应更新 Agent 配置以指定您的特定 MCP 服务器并使用安全的身份验证令牌。`MCPAgent` 使用服务器 URL 和适当的授权标头进行实例化。

```typescript agent-config.ts icon=logos:typescript
const mcpAgent = await MCPAgent.from({
  url: "YOUR_MCP_SERVER_URL",
  transport: "streamableHttp",
  opts: {
    requestInit: {
      headers: {
        Authorization: "Bearer YOUR_TOKEN",
      },
    },
  },
});
```

## 调试

`aigne observe` 命令提供了一个用于监控和分析 Agent 运行时行为的工具。它会启动一个本地 Web 服务器，该服务器可视化执行跟踪，提供对输入、输出、工具交互和性能指标的深入了解。

1.  **启动观察服务器：**

    ```bash aigne observe icon=lucide:terminal
    aigne observe
    ```

    ![AIGNE Observe 服务器在终端中启动](../../../examples/images/aigne-observe-execute.png)

2.  **查看执行跟踪：**

    访问 `http://localhost:7893` 的 Web 界面，以查看最近的 Agent 执行列表。可以检查每个跟踪以详细分析 Agent 的操作。

    ![AIGNE Observe 跟踪列表](../../../examples/images/aigne-observe-list.png)

## 本地安装与测试

对于打算修改源代码的开发人员，以下步骤概述了本地设置和测试的过程。

### 1. 克隆存储库

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

切换到示例目录，并使用 `pnpm` 安装所需的包。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. 运行示例

执行启动脚本以从本地源运行应用程序。

```bash icon=lucide:terminal
pnpm start
```

### 4. 运行测试

要验证集成和功能，请执行测试套件。

```bash icon=lucide:terminal
pnpm test:llm
```

测试过程将建立与 MCP 服务器的连接，枚举可用的技能，并执行基本的 DID Spaces 操作以确认集成按预期工作。