本文档详细介绍了 AIGNE 加载器系统，该系统负责加载和解析配置文件以构建和初始化 Agent。加载器是定义和配置 AI Agent 行为及其交互的主要入口点。

## 概述

AIGNE 加载器系统旨在解释一组配置文件，从根 `aigne.yaml` 文件开始，以构建完整的运行时环境。此过程涉及解析项目级设置、发现所有指定的 Agent 和技能，并将其具象化为可执行对象。加载器支持使用 YAML（为了简洁）和 JavaScript/TypeScript（用于更复杂的编程逻辑）来定义 Agent。

加载过程可视图化如下：

```d2
direction: down

Config-Sources: {
  label: "配置源"
  shape: rectangle

  aigne-yaml: "aigne.yaml\n(根入口点)"
  
  definitions: {
    label: "Agent 与技能定义"
    shape: rectangle
    grid-columns: 2

    yaml-files: "YAML 文件\n(.yml)"
    ts-js-files: "TypeScript/JavaScript\n(.ts, .js)"
  }
}

Loader: {
  label: "AIGNE 加载器系统"
  shape: rectangle
}

Runtime: {
  label: "已初始化的运行时环境"
  shape: rectangle
  
  Objects: {
    label: "内存中的活动对象"
    shape: rectangle
    grid-columns: 2

    Agent-Instances: "Agent 实例"
    Skill-Instances: "技能实例"
  }
}

Config-Sources.aigne-yaml -> Loader: "1. 读取"
Config-Sources.definitions -> Loader: "2. 发现"
Loader -> Loader: "3. 解析与构建"
Loader -> Runtime.Objects: "4. 实例化"
```

## 核心功能

加载器系统由几个关键函数协调，这些函数负责处理项目配置的发现、解析和实例化。

### `load` 函数

这是加载器系统的主入口点。它接收项目目录的路径（或特定的 `aigne.yaml` 文件）和一个选项对象，然后返回一个完全解析好的、可供使用的 `AIGNEOptions` 对象。

```typescript
// 来自：packages/core/src/loader/index.ts

export async function load(path: string, options: LoadOptions = {}): Promise<AIGNEOptions> {
  // ... implementation
}
```

### `loadAgent` 函数

此函数负责从文件中加载单个 Agent。它会自动检测文件类型（YAML 或 JavaScript/TypeScript）并使用相应的解析器。

```typescript
// 来自：packages/core/src/loader/index.ts

export async function loadAgent(
  path: string,
  options?: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  // ... implementation
}
```

## 项目配置：`aigne.yaml`

`aigne.yaml`（或 `aigne.yml`）文件是项目配置的根。加载器会在提供的路径中搜索此文件以开始加载过程。

### `aigne.yaml` 模式

以下是您可以在 `aigne.yaml` 文件中定义的顶层属性：

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | 项目名称。 |
| `description` | `string` | 项目的简要描述。 |
| `model` | `string` or `object` | 所有 Agent 的默认聊天模型配置。可被单个 Agent 覆盖。 |
| `imageModel` | `string` or `object` | 所有 Agent 的默认图像模型配置。 |
| `agents` | `string[]` | 要加载的 Agent 定义文件的路径列表。 |
| `skills` | `string[]` | 全局可用的技能定义文件的路径列表。 |
| `mcpServer` | `object` | MCP（多 Agent 通信协议）服务器的配置，包括要暴露的 Agent 列表。 |
| `cli` | `object` | 命令行界面的配置，定义聊天 Agent 和 Agent 命令结构。 |

### `aigne.yaml` 示例

此示例演示了一个典型的项目设置，定义了默认模型，并列出了要加载的各种 Agent 和技能。

```yaml
# 来源：packages/core/test-agents/aigne.yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
  - image.yaml
  - agents/test-relative-prompt-paths.yaml
skills:
  - sandbox.js
mcp_server:
  agents:
    - chat.yaml
cli:
  agents:
    - chat.yaml
    - test-cli-agents/b.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
      description: A agent from a.yaml
      alias: ["a", "a-agent"]
      agents:
        - url: test-cli-agents/a-1.yaml
          agents:
            - url: test-cli-agents/a-1-1.yaml
            - url: test-cli-agents/a-1-2.yaml
              name: a12-renamed
              description: A agent from a-1-2.yaml
        - test-cli-agents/a-2.yaml
```

## Agent 配置 (YAML)

Agent 是 AIGNE 平台的基本构建块。您可以在 YAML 文件中以声明式且易于阅读的格式定义它们。

### 通用 Agent 属性

所有 Agent 类型共享一组通用属性：

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Agent 的唯一名称。 |
| `description` | `string` | 关于 Agent 用途和能力的描述。 |
| `model` | `string` or `object` | 覆盖此特定 Agent 的默认聊天模型。 |
| `inputSchema` | `string` or `object` | 指向 JSON 模式文件的路径或定义预期输入的内联模式。 |
| `outputSchema` | `string` or `object` | 指向 JSON 模式文件的路径或定义预期输出的内联模式。 |
| `skills` | `(string or object)[]` | 此 Agent 可用的技能（工具）列表。可以是技能文件的路径或嵌套的 Agent 定义。 |
| `memory` | `boolean` or `object` | 为 Agent 启用记忆功能。可以是一个简单的 `true`，也可以是用于高级配置的对象。 |
| `hooks` | `object` or `object[]` | 定义在生命周期的不同点（例如 `onStart`、`onSuccess`）触发其他 Agent 的钩子。 |

### Agent 类型

`type` 属性决定了 Agent 的核心行为。

#### 1. AI Agent (`type: "ai"`)

最常见的类型，用于通用 AI 任务。它使用大型语言模型来处理指令并与技能交互。

-   **`instructions`**: 定义 Agent 的提示。可以是一个字符串、一个包含 `role` 和 `content` 的对象，或使用 `url` 对文件的引用。
-   **`inputKey`**: 输入对象中应被视为主用户消息的键。
-   **`toolChoice`**: 控制 Agent 如何使用工具（例如 `auto`、`required`）。

**示例：**

```yaml
# 来源：packages/core/test-agents/chat-with-prompt.yaml
name: chat-with-prompt
description: Chat agent
instructions:
  url: chat-prompt.md
input_key: message
memory: true
skills:
  - sandbox.js
```

#### 2. Image Agent (`type: "image"`)

专门用于根据提示生成图像。

-   **`instructions`**: （必需）用于图像生成的提示。
-   **`modelOptions`**: 特定于图像生成模型的选项字典。

#### 3. Team Agent (`type: "team"`)

协调一组 Agent（技能）共同完成一项任务。

-   **`mode`**: 处理模式，例如 `parallel` 或 `sequential`。
-   **`iterateOn`**: 在使用技能进行处理时，用来迭代的输入中的键。
-   **`reflection`**: 配置一个审查流程，其中 `reviewer` Agent 批准或请求更改输出。

#### 4. Transform Agent (`type: "transform"`)

使用 JSONata 表达式转换输入数据。

-   **`jsonata`**: （必需）一个包含要应用于输入的 JSONata 表达式的字符串。

#### 5. MCP Agent (`type: "mcp"`)

作为外部 Agent 或服务的客户端。

-   **`url`**: 外部 Agent 的 URL。
-   **`command`**: 要执行的 shell 命令。

#### 6. Function Agent (`type: "function"`)

在 JavaScript/TypeScript 文件中以编程方式定义。此类型在 JS/TS 文件本身中指定，而不是在 YAML 中。