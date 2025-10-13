本指南全面概述了 AIGNE 框架，旨在帮助开发者在 30 分钟内上手并运行。我们将涵盖核心概念、项目结构以及配置和运行您的第一个 AI Agent 的基本步骤。

### 核心概念

AIGNE 是一个用于构建、组合和运行 AI Agent 的强大框架。它使用声明式方法，通过 YAML 文件来定义项目结构和单个 Agent 的行为。

*   **项目 (Project)：** 一个 AIGNE 项目由一个 `aigne.yaml` 文件定义，该文件作为中央清单，用于指定 Agent、技能和默认配置。
*   **Agent：** Agent 是基本构建块。它是一个能够执行任务、使用工具并与其他 Agent 交互的实体。AIGNE 支持多种类型的 Agent，包括 `ai`、`team`、`function` 等。
*   **技能 (Skill)：** 技能是一种可复用的工具或函数，可以附加到 Agent 上，赋予其特定能力。

### 项目结构

该框架以 `aigne.yaml` 文件为中心。该文件负责编排项目中的所有不同组件。

```yaml
# aigne.yaml - 主项目配置文件

name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
skills:
  - sandbox.js
cli:
  agents:
    - chat.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
```

#### 关键配置部分

*   **`name` & `description`**：项目的基本元数据。
*   **`chat_model`**：为项目中所有 Agent 定义默认的语言模型及其设置（例如 `temperature`）。这可以在单个 Agent 的配置中被覆盖。
*   **`agents`**：一个 YAML 或 JS 文件列表，每个文件定义一个 Agent。
*   **`skills`**：定义可复用技能的文件列表。这些通常是导出函数的 JavaScript 文件。
*   **`cli`**：配置哪些 Agent 作为命令行界面中的命令暴露出来，使其可以直接从终端执行。

### 加载过程

当您运行一个 AIGNE 项目时，框架会执行以下步骤来加载和初始化您的 Agent：

1.  **查找 `aigne.yaml`**：它会在指定目录中搜索 `aigne.yaml` 或 `aigne.yml` 文件。
2.  **解析配置**：解析主 `aigne.yaml` 文件，以获取项目设置以及 Agent 和技能的列表。
3.  **加载 Agent 和技能**：框架会遍历 `agents` 和 `skills` 部分中定义的路径。它读取每个文件，并根据其扩展名（`.yaml` 或 `.js`）解析 Agent/技能的定义。
4.  **构建 Agent**：使用解析后的定义，构建 Agent 实例，并将它们与指定的模型、技能和任何其他配置相关联。
5.  **暴露 Agent**：最后，根据 `aigne.yaml` 中的定义，通过 `cli` 或 `mcp_server` 等接口使 Agent 可用。

这种加载机制非常灵活，允许您通过简单的、可复用的部分来组合复杂的 Agent 行为。该过程的核心逻辑可以在 `packages/core/src/loader/index.ts` 中找到。

```d2
direction: down

Developer: {
  shape: c4-person
  label: "开发者"
}

Project-Files: {
  label: "项目配置"
  style.stroke-dash: 2
  shape: rectangle

  aigne-yaml: {
    label: "aigne.yaml\n(项目清单)"
    shape: rectangle
  }

  Agent-Definitions: {
    label: "Agent 定义"
    shape: rectangle
    agent1: "chat.yaml"
    agent2: "team.yaml"
  }

  Skill-Definitions: {
    label: "技能定义"
    shape: rectangle
    skill1: "sandbox.js"
  }
}

AIGNE-Loader: {
  label: "AIGNE 核心加载器"
  shape: rectangle
}

Constructed-Agents: {
  label: "已构建的 Agent 实例\n(内存中)"
  shape: rectangle
}

Execution-Interfaces: {
  label: "执行接口"
  style.stroke-dash: 2
  shape: rectangle
  CLI
  MCP-Server
}


AIGNE-Loader -> Project-Files.aigne-yaml: "1. 查找并解析清单"
Project-Files.aigne-yaml -> Project-Files.Agent-Definitions: "引用" {
  style.stroke-dash: 2
}
Project-Files.aigne-yaml -> Project-Files.Skill-Definitions: "引用" {
  style.stroke-dash: 2
}
AIGNE-Loader -> Project-Files.Agent-Definitions: "2. 加载定义"
AIGNE-Loader -> Project-Files.Skill-Definitions: "2. 加载定义"
AIGNE-Loader -> Constructed-Agents: "3. 构建 Agent 并链接技能"
Constructed-Agents -> Execution-Interfaces: "4. 暴露 Agent"
Developer -> Execution-Interfaces.CLI: "通过命令执行 Agent"
```

### 定义 Agent

Agent 通常在它们各自的 YAML 文件中定义。`type` 属性决定了 Agent 的核心行为。

#### Agent 类型

AIGNE 支持多种 Agent 类型，每种类型都有不同的用途：

*   **`ai`**：最常见的类型。一种使用语言模型处理指令并生成响应的 AI Agent。它可以使用技能（工具）来执行操作。
*   **`image`**：专门根据提示生成图像的 Agent。
*   **`team`**：一个强大的 Agent，可以协调一组其他 Agent 来完成一个复杂的任务。
*   **`mcp`**：可以执行 shell 命令或连接到远程 MCP 服务器的 Agent。
*   **`transform`**：使用 JSONata 表达式转换输入数据的 Agent。
*   **`function`**：执行 JavaScript 函数的 Agent。

#### AI Agent 示例

以下是在 `chat.yaml` 中定义的一个 `ai` Agent 的基本示例：

```yaml
# chat.yaml

type: ai
name: "Chat Agent"
description: "一个简单的对话式 Agent。"

# 为 AI 模型定义提示和上下文
instructions:
  - role: system
    content: "你是一个乐于助人的助手。"
  - role: user
    content: "嗨，我的任务需要帮助。"

# 覆盖 aigne.yaml 中的默认模型
model:
  name: gpt-4
  temperature: 0.7

# 将技能附加到 Agent
skills:
  - "sandbox.js"
```

*   **`type: ai`**：指定这是一个 AI Agent。如果省略，则默认为 `ai`。
*   **`instructions`**：为语言模型提供上下文和提示。它可以是一个简单的字符串，也可以是一个包含 `role` 和 `content` 的消息对象列表。您还可以使用 `url` 从外部文件加载指令。
*   **`model`**：允许您为此特定 Agent 指定不同的模型或设置，从而覆盖项目级别的默认设置。
*   **`skills`**：Agent 可以用作工具的技能文件列表。

### 快速入门：您的第一个“Greeter” Agent

让我们创建一个简单的项目，看看一切是如何运作的。

#### 步骤 1：创建项目文件

首先，在一个新目录中创建一个名为 `aigne.yaml` 的文件。

```yaml
# aigne.yaml
name: "Greeter Project"
description: "一个用于演示 AIGNE 的简单项目。"

# 定义该项目包含的 Agent
agents:
  - "greeter.yaml"

# 使 'greeter' Agent 可以从命令行运行
cli:
  agents:
    - "greeter.yaml"
```

#### 步骤 2：创建 Agent 定义

接下来，在同一目录中创建 Agent 文件 `greeter.yaml`。

```yaml
# greeter.yaml
name: "Greeter"
description: "一个会问候用户的友好 Agent。"

# 给 AI 的指令
instructions: "你是一个友好的 Agent。根据用户的名字向他们打招呼。"

# 定义此 Agent 的预期输入
inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "要问候的人的姓名。"
  required:
  - name
```

*   **`instructions`**：我们为 Agent 提供了一个简单的角色和目标。
*   **`inputSchema`**：我们定义了此 Agent 需要一个 `name` 作为输入。如果未提供此输入，AIGNE 将自动提示用户输入。

#### 步骤 3：运行 Agent

现在，您可以使用 AIGNE CLI 从终端运行您的 Agent。

```bash
aigne run greeter --name "World"
```

**预期输出：**

```
> Hello, World! It's a pleasure to meet you.
```

您也可以在不提供姓名的情况下运行它，它会提示您输入：

```bash
aigne run greeter
```

**预期交互：**

```
? What is the name of the person to greet? › World
> Hello, World! It's a pleasure to meet you.
```

### 接下来做什么？

恭喜！您已成功创建并运行了您的第一个 AIGNE Agent。从这里开始，您可以探索更高级的主题：

*   **创建技能**：通过编写自定义 JavaScript 函数，为您的 Agent 赋予新能力。
*   **构建团队**：协调多个 Agent 来解决复杂的多步骤问题。
*   **使用记忆**：为您的 Agent 提供长期记忆，以回忆过去的交互。