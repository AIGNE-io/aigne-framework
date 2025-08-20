# 项目配置 (aigne.yaml)

`aigne.yaml` 文件是 AIGNE 项目的核心清单文件。它定义了核心组件，包括聊天模型、Agent 和技能，并提供项目级元数据。该文件对于 AIGNE CLI 理解如何运行、服务和管理你的 Agent至关重要。

## 主要配置部分

该配置使用几个顶级键进行组织。下面详细介绍用于定义项目的主要部分。

### `chat_model`

此部分指定你的 Agent 将用于生成响应的 AI 模型。你可以定义提供商、模型名称以及控制模型行为的参数。

| 键 | 类型 | 描述 |
|---|---|---|
| `provider` | String | 模型提供商的名称，例如 `openai`。通常可以从模型 `name` 推断出来。 |
| `name` | String | 模型的特定标识符，如 `gpt-4o-mini`。 |
| `temperature` | Number | 一个介于 0.0 和 2.0 之间的值，用于控制输出的随机性。值越高，响应越具创造性。 |
| `topP` | Number | 控制 nucleus sampling。模型仅考虑具有最高 P 概率质量的 token。 |
| `presencePenalty` | Number | 一个介于 -2.0 和 2.0 之间的值。正值会根据新 token 是否已在文本中出现而对其进行惩罚，从而增加模型谈论新主题的可能性。 |
| `frequencyPenalty` | Number | 一个介于 -2.0 和 2.0 之间的值。正值会根据新 token 在文本中已有的频率对其进行惩罚，从而降低模型逐字重复同一行的可能性。 |

**示例：**
```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

### `agents`

这是一个项目中的 Agent 定义文件列表。每个文件路径都指向一个 YAML 文件，该文件指定了 Agent 的配置，例如其系统提示和可访问的技能。有关定义 Agent 的更多详细信息，请参阅 [Agent 与技能](./core-concepts-agents-and-skills.md) 部分。

**示例：**
```yaml
agents:
  - chat.yaml
```

### `skills`

此列表定义了项目中可供 Agent 使用的技能。技能是可重用的工具或函数，允许 Agent 执行操作，例如访问文件系统或调用外部 API。技能可以在 YAML 或 JavaScript 模块中定义。

**示例：**
```yaml
skills:
  - sandbox.js
  - filesystem.yaml
```

### 专业化配置

对于更高级的用例，你可以添加部分来控制 Agent 如何通过不同接口暴露。

- **`mcp_server`**：指定运行 `aigne serve-mcp` 时暴露的 Agent。这对于将你的 Agent 与支持 Model Context Protocol 的外部系统集成非常有用。
- **`cli`**：定义哪些 Agent 可以使用 `aigne run` 命令直接从命令行运行。

**示例：**
```yaml
mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

## 完整示例

以下是两个 `aigne.yaml` 文件示例，从基础到复杂。

### 默认项目配置

这是一个标准的配置文件，在创建新 AIGNE 项目时生成。它定义了一个聊天模型、一个默认 Agent 和一些内置技能。

```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
```

### 包含元数据和服务配置的项目

此示例包含项目元数据（`name`、`description`），并指定哪些 Agent 可用于 MCP 服务器和 CLI。

```yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
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

正确配置 `aigne.yaml` 后，你就为项目奠定了坚实的基础。下一步是定义你的 Agent 和技能的行为与能力。继续阅读 [Agent 与技能](./core-concepts-agents-and-skills.md) 指南以了解更多信息。