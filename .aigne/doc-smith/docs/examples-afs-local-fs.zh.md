# AFS 本地文件系统

本指南将演示如何构建一个能够与本地文件系统交互的聊天机器人。通过利用 AIGNE 文件系统 (AFS) 和 `SystemFS` 模块，您可以让 AI Agent 能够搜索、读取和管理您机器上的文件，将其转变为一个强大的本地数据专家。

## 概述

AIGNE 文件系统 (AFS) 提供了一个虚拟文件系统层，为 AI Agent 访问各种存储系统提供了一种标准化的方式。本示例重点介绍 `SystemFS` 模块，该模块将 AFS 连接到您的本地文件系统。

当用户提问时，Agent 会智能地执行以下操作：
1.  **搜索：** 根据用户的查询，使用 `afs_search` 工具在指定目录中查找相关文件。
2.  **读取：** 从搜索结果中识别出最有可能的文件，并使用 `afs_read` 工具访问其内容。
3.  **整合：** 处理文件内容，以形成一个全面而准确的回答。

这使得 Agent 能够在没有手动指导的情况下，回答关于您的文档、代码或任何其他基于文本的文件的问题。

## 前置条件

在开始之前，请确保您已安装并配置好以下各项：
- [Node.js](https://nodejs.org) (版本 20.0 或更高)
- 一个 [OpenAI API 密钥](https://platform.openai.com/api-keys)

## 快速入门

您可以使用 `npx` 直接运行此示例，无需本地安装。

1.  **设置您的 OpenAI API 密钥：**
    ```bash icon=lucide:terminal
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **运行聊天机器人：**
    您可以挂载任何本地目录。在本示例中，我们将克隆 AIGNE 框架，并将其文档作为知识库。

    ```bash icon=lucide:terminal
    # 克隆仓库以使用其文档
    git clone https://github.com/AIGNE-io/aigne-framework
    
    # 以交互模式启动聊天机器人，并指向文档目录
    npx -y @aigne/example-afs-local-fs --path ./aigne-framework --chat
    ```

    或者，您也可以只问一个具体的、单一的问题：
    ```bash icon=lucide:terminal
    npx -y @aigne/example-afs-local-fs --path ./aigne-framework --input "What is AIGNE?"
    ```

### 交互示例

以下是当被问及“什么是 AIGNE？”时，Agent 的处理过程示例：

```
👤 您：“什么是 AIGNE？”

🤖 Agent 思考：我需要在提供的文件中查找有关 AIGNE 的信息。我将从搜索开始。
   → 调用：afs_search(query: "AIGNE")

📁 找到 15 个匹配文件：
   • docs/getting-started/what-is-aigne.md ⭐ (最相关)
   • README.md
   • docs/core-concepts/overview.md
   ...

🤖 Agent 思考：第一个结果似乎最相关。我将阅读它来回答用户的问题。
   → 调用：afs_read("docs/getting-started/what-is-aigne.md")

📄 文件已加载 (2.4 KB)

🤖 AI：“AIGNE 是一个用于构建由 LLM 驱动的应用程序和 AI Agent 的框架和运行时引擎。它提供：

       • 统一的 Agentic 文件系统 (AFS) 接口
       • 支持多种 LLM 提供商（OpenAI、Anthropic 等）
       • 用于构建自主 Agent 的工具
       • 通过 MCP 与外部服务集成

       您是想让我带您过一遍快速入门教程，还是想看一些具体的例子？”
```
Agent 成功找到了正确的文件，读取了其内容，并提供了一个总结性的、有帮助的回复。

## 连接到 AI 模型

Agent 需要连接到大型语言模型 (LLM) 才能正常工作。如果您在未提供 API 密钥的情况下运行示例，系统将提示您选择一种连接方式。

![未找到 API 密钥时的初始设置提示。](../../../examples/afs-local-fs/run-example.png)

您有三个选项：

1.  **连接到 AIGNE Hub (推荐)：** 这是最简单的入门方式。您的浏览器将打开一个授权页面。新用户会获得免费积分来使用该服务。

    ![授权 AIGNE CLI 连接到 AIGNE Hub。](../../../examples/images/connect-to-aigne-hub.png)

2.  **连接到自托管的 AIGNE Hub：** 如果您正在运行自己的 AIGNE Hub 实例，请选择此选项并输入其 URL。

    ![输入自托管 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **使用第三方模型提供商：** 您可以通过设置相应的环境变量，直接连接到像 OpenAI 这样的提供商。

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```
    有关支持的提供商及其所需环境变量的列表，请参阅源代码中的示例 `.env.local.example` 文件。

## 工作原理

其实现可分为三个主要步骤，如下图所示：

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![AFS 本地文件系统](assets/diagram/examples-afs-local-fs-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

### 1. 创建一个 LocalFS 模块

首先，实例化 `LocalFS` 模块，指定您希望 Agent 访问的目录的本地路径，以及一个可选的描述。

```typescript create-local-fs.ts
import { LocalFS } from "@aigne/afs-local-fs";

const localFS = new LocalFS({
  localPath: './aigne-framework',
  description: 'AIGNE framework documentation'
});
```

### 2. 在 AFS 中挂载模块

接下来，创建一个 `AFS` 实例并 `mount` (挂载) `localFS` 模块。这使得本地目录对于任何有权访问此 AFS 实例的 Agent 都可用。

```typescript mount-module.ts
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(localFS);  // 挂载到默认路径 /modules/local-fs
```

### 3. 创建并配置 AI Agent

最后，创建一个 `AIAgent` 并为其提供 `afs` 实例。该 Agent 会自动获得用于文件系统交互的 AFS 工具。

```typescript create-agent.ts
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "Help users find and read files from the local file system.",
  inputKey: "message",
  afs,  // Agent 继承了 afs_list、afs_read、afs_write 和 afs_search
});
```

### 可用的 AFS 工具

通过将 Agent 连接到 AFS，它可以使用以下沙箱化的工具来操作挂载的目录：
-   `afs_list`：列出文件和子目录。
-   `afs_read`：读取特定文件的内容和元数据。
-   `afs_write`：创建一个新文件或覆盖一个现有文件。
-   `afs_search`：在目录中的所有文件里执行全文搜索。

## 安装与本地执行

如果您希望从源代码运行该示例，请按照以下步骤操作。

1.  **克隆仓库：**
    ```bash icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安装依赖：**
    导航到示例目录并使用 `pnpm` 安装必要的软件包。
    ```bash icon=lucide:terminal
    cd aigne-framework/examples/afs-local-fs
    pnpm install
    ```

3.  **运行示例：**
    使用 `pnpm start` 命令运行聊天机器人。
    ```bash icon=lucide:terminal
    # 挂载当前目录
    pnpm start --path .

    # 挂载特定目录并附带自定义描述
    pnpm start --path ~/Documents --description "My Documents"

    # 以交互式聊天模式运行
    pnpm start --path . --chat
    ```

## 使用场景

本示例为多种实际应用提供了基础。

### 文档聊天
挂载您项目的文档文件夹，创建一个可以回答用户关于您项目问题的聊天机器人。
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: './docs', description: 'Project documentation' }));
```

### 代码库分析
允许 AI Agent 访问您的源代码，以帮助进行分析、重构或解释复杂逻辑。
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: './src', description: 'Source code' }));
```

### 文件整理
构建一个可以帮助您在目录中（例如“下载”文件夹）排序和管理文件的 Agent。
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: '~/Downloads', description: 'Downloads folder' }));
```

### 多目录访问
挂载多个目录，为 Agent 提供更广阔的上下文，使其能够同时搜索您的源代码、文档和测试。
```typescript
const afs = new AFS()
  .mount("/docs", new LocalFS({ localPath: './docs' }))
  .mount("/src", new LocalFS({ localPath: './src' }))
  .mount("/tests", new LocalFS({ localPath: './tests' }));
```

## 总结

您已经学习了如何使用 AIGNE 框架创建一个能与本地文件系统交互的聊天机器人。这一强大功能催生了广泛的应用，从智能文档搜索到自动化代码分析。

如需进一步阅读，请探索以下相关示例和软件包：

<x-cards data-columns="2">
  <x-card data-title="Memory 示例" data-href="/examples/memory" data-icon="lucide:brain-circuit">
    学习如何为您的聊天机器人添加对话记忆。
  </x-card>
  <x-card data-title="MCP 服务器示例" data-href="/examples/mcp-server" data-icon="lucide:server">
    探索如何使用 MCP 将您的 Agent 与外部服务集成。
  </x-card>
</x-cards>