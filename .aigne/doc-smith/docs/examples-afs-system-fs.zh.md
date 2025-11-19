# AFS System FS

本指南演示了如何构建一个能够与本地文件系统交互的聊天机器人。通过遵循以下步骤，您将创建一个 Agent，该 Agent 能使用 AIGNE 文件系统（AFS）和 `SystemFS` 模块在您的机器上列出、读取、写入和搜索文件。

## 概述

本示例展示了如何通过 AIGNE 框架将本地文件系统与 AI Agent 集成。`SystemFS` 模块充当桥梁，将指定的本地目录挂载到 AIGNE 文件系统（AFS）中。这使得 AI Agent 能够使用一套标准化的工具执行文件操作，从而能够根据本地文件的内容回答问题和完成任务。

下图说明了 `SystemFS` 模块如何将本地文件系统连接到 AI Agent：

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AFS: {
    label: "AIGNE 文件系统 (AFS)"
    shape: rectangle

    SystemFS-Module: {
      label: "SystemFS 模块"
      shape: rectangle
    }
  }
}

Local-File-System: {
  label: "本地文件系统"
  shape: rectangle

  Local-Directory: {
    label: "本地目录\n(/path/to/your/project)"
    shape: cylinder
  }
}

AI-Agent <-> AIGNE-Framework.AFS: "3. 执行文件操作\n(列出、读取、写入、搜索)"
AIGNE-Framework.AFS.SystemFS-Module <-> Local-File-System.Local-Directory: "2. 挂载目录"

```

## 前提条件

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js**: 20.0 或更高版本。
*   **npm**: Node.js 自带。
*   **OpenAI API 密钥**: 用于连接语言模型。您可以从 [OpenAI API 密钥页面](https://platform.openai.com/api-keys)获取。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需本地安装。

### 运行示例

在您的终端中执行以下命令以挂载目录并与聊天机器人交互。

挂载当前目录并启动一个交互式聊天会话：

```bash 安装 aigne 依赖 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

挂载特定目录，例如您的“文稿”文件夹：

```bash 安装 aigne 依赖 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

提出一次性问题，而不进入交互模式：

```bash 安装 aigne 依赖 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### 连接到 AI 模型

首次运行该示例时，由于尚未配置 API 密钥，CLI 将提示您连接到 AI 模型。

![AIGNE Hub 的初始连接提示](../../../examples/afs-system-fs/run-example.png)

您有三个选项可以继续：

1.  **连接到官方 AIGNE Hub**
    这是推荐给新用户的选项。您的浏览器将打开 AIGNE Hub，您可以在其中授权连接。新用户会获得免费的令牌赠款，以便立即开始使用。

    ![AIGNE Hub 中 AIGNE CLI 的授权对话框](../../../examples/images/connect-to-aigne-hub.png)

2.  **通过自托管的 AIGNE Hub 连接**
    如果您有自托管的 AIGNE Hub 实例，请选择此选项并输入其 URL 以完成连接。您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署自己的 AIGNE Hub。

    ![提示输入自托管 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **通过第三方模型提供商连接**
    您可以直接配置来自 OpenAI 等提供商的 API 密钥。在终端中设置相应的环境变量，然后再次运行该示例。

    ```bash 设置 OpenAI API 密钥 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    对于与其他提供商（如 DeepSeek 或 Google Gemini）的配置，请参阅项目源代码中的 `.env.local.example` 文件。

### 使用 AIGNE Observe 进行调试

要监控和分析 Agent 的行为，请使用 `aigne observe` 命令。这将启动一个本地 Web 服务器，提供执行跟踪、工具调用和模型交互的详细视图，这对于调试和性能调优非常有价值。

首先，启动观察服务器：

```bash 启动 Observe 服务器 icon=lucide:terminal
aigne observe
```

终端将确认服务器正在运行并提供一个本地 URL。

![显示 AIGNE Observe 服务器已启动的终端输出](../../../examples/images/aigne-observe-execute.png)

运行您的 Agent 后，您可以在 Web 界面中查看最近执行的列表。

![显示跟踪列表的 AIGNE 可观察性 Web 界面](../../../examples/images/aigne-observe-list.png)

## 本地安装

出于开发目的，您可以克隆仓库并在本地运行该示例。

1.  **克隆仓库**

    ```bash 克隆仓库 icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安装依赖**
    导航到示例目录并使用 pnpm 安装必要的包。

    ```bash 安装依赖 icon=lucide:terminal
    cd aigne-framework/examples/afs-system-fs
    pnpm install
    ```

3.  **运行示例**
    使用 `pnpm start` 命令并带上所需的标志。

    使用当前目录运行：
    ```bash 使用当前目录运行 icon=lucide:terminal
    pnpm start --path .
    ```

    以交互式聊天模式运行：
    ```bash 以聊天模式运行 icon=lucide:terminal
    pnpm start --path . --chat
    ```

## 工作原理

本示例使用 `SystemFS` 模块通过 AIGNE 文件系统（AFS）向 AI Agent 暴露一个本地目录。这个沙盒环境允许 Agent 使用标准化的接口与您的文件进行交互，确保安全和可控。

### 核心逻辑

1.  **挂载目录**：使用本地 `path` 和 AFS 内的虚拟 `mount` 点实例化 `SystemFS` 类。
2.  **Agent 初始化**：使用 AFS 实例配置一个 `AIAgent`，使其能够访问文件系统工具，如 `afs_list`、`afs_read`、`afs_write` 和 `afs_search`。
3.  **工具调用**：当用户提问时（例如，“这个项目的目的是什么？”），Agent 会决定使用哪个 AFS 工具。它可能首先调用 `afs_list` 查看目录内容，然后调用 `afs_read` 检查像 `README.md` 这样的相关文件。
4.  **构建上下文**：从文件系统检索到的内容被添加到 Agent 的上下文中。
5.  **生成响应**：Agent 使用丰富的上下文为用户的原始问题制定一个全面的答案。

以下代码片段展示了如何将本地目录挂载到 AFS 中，并提供给 `AIAgent`。

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

AIAgent.from({
  // ... 其他配置
  afs: new AFS().use(
    new SystemFS({ mount: '/source', path: '/PATH/TO/YOUR/PROJECT', description: '项目的代码库' }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### SystemFS 的主要特性

*   **文件操作**：标准的列出、读取、写入和搜索功能。
*   **递归遍历**：通过深度控制导航嵌套目录。
*   **快速内容搜索**：利用 `ripgrep` 实现高性能文本搜索。
*   **元数据访问**：提供文件大小、类型和时间戳等详细信息。
*   **路径安全**：将文件访问限制在仅已挂载的目录内。

## 用法示例

聊天机器人运行后，您可以使用自然语言命令与您的文件进行交互。

### 基本命令

尝试使用这些命令来执行简单的文件操作。

列出挂载目录中的所有文件：
```bash 列出文件 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

读取特定文件的内容：
```bash 读取文件 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

在所有文件中搜索内容：
```bash 搜索内容 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### 交互式聊天提示

启动一个交互式会话以获得更具对话性的体验：

```bash 启动交互模式 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

进入聊天模式后，尝试询问以下问题：

*   “这个目录里有哪些文件？”
*   “给我看看 README 文件的内容。”
*   “找出所有的 TypeScript 文件。”
*   “在代码库中搜索函数。”
*   “创建一个名为 `notes.txt` 的新文件，并写入一些内容。”
*   “以 2 的深度限制递归列出所有文件。”

## 总结

本示例提供了一个实际演示，说明如何扩展 AI Agent 的能力以包括本地文件系统交互。通过使用 `SystemFS` 模块，您可以创建功能强大的聊天机器人，根据自然语言命令自动执行任务、检索信息和组织文件。

有关更高级的示例和工作流，您可以探索其他文档部分。

<x-cards data-columns="2">
  <x-card data-title="记忆" data-href="/examples/memory" data-icon="lucide:brain-circuit">
  了解如何为您的聊天机器人赋予持久记忆。
  </x-card>
  <x-card data-title="工作流编排" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">
  探索如何在复杂的工作流中协调多个 Agent。
  </x-card>
</x-cards>