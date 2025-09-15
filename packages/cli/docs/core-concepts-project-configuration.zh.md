---
labels: ["Reference"]
---

# 项目配置 (aigne.yaml)

`aigne.yaml` 文件是 AIGNE 项目的核心。它作为中央清单文件，定义了项目的元数据、语言模型设置以及 agents 和 skills 等核心组件之间的关系。结构良好的 `aigne.yaml` 文件是构建功能强大且条理清晰的 agent 的第一步。

该文件使用 YAML 格式，这种格式旨在方便人类阅读和编写。

## 核心配置项

接下来我们分解一个典型的 `aigne.yaml` 文件中的主要部分。

### 项目元数据

这些字段提供有关你的项目的基本信息。

<x-field data-name="name" data-type="string" data-required="true" data-desc="项目的唯一标识符。"></x-field>
<x-field data-name="description" data-type="string" data-required="false" data-desc="项目功能的简要概述。"></x-field>

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent
```

### 聊天模型 (`chat_model`)

这是一个关键部分，用于配置为你的 agents 提供支持的大语言模型 (LLM)。AIGNE 提供了一种灵活的方式来定义模型提供商、名称和其他参数。

| Key | Type | Description |
|---|---|---|
| `provider` | string | LLM 提供商（例如，`openai`）。也可以在 `model` 键中以前缀形式指定。 |
| `name` / `model` | string | 要使用的具体模型（例如，`gpt-4o-mini`）。 |
| `temperature` | number | 一个介于 0 和 2 之间的值，用于控制模型输出的随机性。值越高，响应越具创造性。 |

以下是两种配置模型的常见方法：

**示例 1：使用 `provider` 和 `name`**

这是一种清晰、明确地定义模型的方式。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

**示例 2：使用带前缀的 `model` 键**

这是一种更简洁的速记格式。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8
```

### Agents (`agents`)

`agents` 键列出了项目中包含的所有 agent 定义文件（`.yaml`）。此处列出的每个文件都为特定的 agent 定义了其行为、提示和工具使用方式。

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
agents:
  - chat.yaml
```

### Skills (`skills`)

`skills` 键列出了为 agents 提供工具和功能的可执行代码或定义。这些可以是包含函数的 JavaScript 文件（`.js`），也可以是定义复杂 skills 的其他 YAML 文件。

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
skills:
  - sandbox.js
  - filesystem.yaml
```

### 服务和 CLI 暴露

你还可以配置如何将 agents 暴露给外部世界，无论是通过服务器还是作为命令行工具。

- `mcp_server`：配置当你运行 `aigne serve-mcp` 命令时，哪些 agents 通过模型上下文协议（Model Context Protocol, MCP）提供服务。
- `cli`：配置哪些 agents 可以直接从命令行运行。

```yaml aigne.yaml icon=mdi:file-document
# ... other configurations
mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

## 完整示例

下面是一个完整的 `aigne.yaml` 文件，它将所有这些元素整合在一起：

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent

chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8

agents:
  - chat.yaml

skills:
  - sandbox.js

mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

有了这个配置文件，你的项目就有了一个坚实的基础。下一步是定义你的 agents 和 skills 的具体功能。

---

既然你已经了解了如何配置项目，让我们更详细地探讨核心组件。请继续阅读下一节，了解有关 [Agents and Skills](./core-concepts-agents-and-skills.md) 的内容。