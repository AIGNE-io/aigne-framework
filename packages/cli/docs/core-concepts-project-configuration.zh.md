---
labels: ["Reference"]
---

# 项目配置 (aigne.yaml)

`aigne.yaml` 文件是 AIGNE 项目的核心清单文件。它定义了核心组件，包括聊天模型、agents 和技能，并提供项目级元数据。该文件对于 AIGNE CLI 理解如何运行、服务和管理您的 agents 至关重要。

下图说明了 `aigne.yaml` 清单文件如何引用和编排其他项目文件，如 agent 和技能定义：

```d2
direction: right

aigne-yaml: "aigne.yaml (清单文件)" {
  shape: document

  sections: {
    shape: package
    grid-columns: 2

    metadata: { label: "元数据\n(name, description)" }
    chat_model: { label: "chat_model\n(provider, name)" }
    agents_list: { label: "agents:\n- chat.yaml" }
    skills_list: { label: "skills:\n- sandbox.js" }
    exposure: { label: "暴露\n(mcp_server, cli)" }
  }
}

referenced_files: "项目文件" {
  shape: package
  grid-columns: 1

  agent_def: "chat.yaml (Agent)" {
    shape: document
  }
  skill_js: "sandbox.js (JS 技能)" {
    shape: code
  }
  skill_yaml: "filesystem.yaml (工具技能)" {
    shape: document
  }
}

aigne-yaml.sections.agents_list -> referenced_files.agent_def: "引用"
aigne-yaml.sections.skills_list -> referenced_files.skill_js: "引用"
aigne-yaml.sections.skills_list -> referenced_files.skill_yaml: "引用"

referenced_files.agent_def -> referenced_files.skill_js: "使用"
referenced_files.agent_def -> referenced_files.skill_yaml: "使用"
```

## 关键配置部分

配置使用几个顶级键进行组织。下面详细介绍您将用于定义项目的主要部分。

### 项目元数据

您可以为项目提供可选的元数据，以帮助识别和描述它。

| Key         | Type   | Description                                  |
|-------------|--------|----------------------------------------------|
| `name`      | String | 项目的唯一名称。              |
| `description` | String | 项目功能的简要描述。 |

**示例：**
```yaml
name: test_aigne_project
description: A test project for the aigne agent
```

### `chat_model`

此部分指定您的 agents 将用于生成响应的 AI 模型。您可以定义提供商、模型名称以及控制模型行为的参数。

| Key                | Type   | Description                                                                                                                                                             |
|--------------------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `provider`         | String | 模型提供商的名称，例如 `openai`。                                                                                                                       |
| `name`             | String | 模型的特定标识符，例如 `gpt-4o-mini`。                                                                                                                |
| `model`            | String | 提供商和名称的备用组合格式，例如 `openai:gpt-4o-mini`。                                                                                      |
| `temperature`      | Number | 一个介于 0.0 和 2.0 之间的值，用于控制输出的随机性。值越高，响应越具创造性。                                                  |
| `topP`             | Number | 控制 nucleus sampling。模型仅考虑具有最高 P 概率质量的词元。                                                                          |
| `presencePenalty`  | Number | 一个介于 -2.0 和 2.0 之间的值。正值会根据新词元是否已在文本中出现来对其进行惩罚，从而增加模型谈论新话题的可能性。 |
| `frequencyPenalty` | Number | 一个介于 -2.0 和 2.0 之间的值。正值会根据新词元在文本中已有的频率来对其进行惩罚，从而降低模型逐字重复同一行的可能性。 |

**示例：**
```yaml
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

### `agents`

这是项目中包含的 agent 定义文件列表。每个条目都是一个 YAML 文件的路径，该文件指定了 agent 的配置，例如其系统提示和可访问的技能。有关定义 agents 的更多详细信息，请参阅 [Agents 和技能](./core-concepts-agents-and-skills.md)部分。

**示例：**
```yaml
agents:
  - chat.yaml
```

### `skills`

此列表定义了项目中 agents 可用的技能。技能是可重用的工具或函数，允许 agents 执行操作，例如访问文件系统或调用外部 API。技能可以在 YAML 中定义，也可以作为 JavaScript 模块定义。

**示例：**
```yaml
skills:
  - sandbox.js
  - filesystem.yaml
```

### 专业化配置

对于更高级的用例，您可以添加部分来控制如何通过不同接口暴露 agents。

- **`mcp_server`**：指定在运行 `aigne serve-mcp` 时暴露哪些 agents。这对于将您的 agents 与支持模型上下文协议的外部系统集成非常有用。
- **`cli`**：定义哪些 agents 可以使用 `aigne run` 命令直接从命令行运行。

当您配置 `mcp_server` 部分并运行 `aigne serve-mcp` 命令时，指定的 agents 将通过本地服务器可用，如下所示：

![运行 MCP 服务器](../assets/run-mcp-service.png)

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

以下是两个 `aigne.yaml` 文件的示例，从基本配置到更具体的配置。

### 默认项目配置

这是创建新 AIGNE 项目时生成的标准配置文件。它定义了一个聊天模型、一个默认 agent 和几个内置技能。

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

使用 `aigne run --chat` 在聊天模式下运行此默认项目中的 agent 将启动一个交互式会话：

![在聊天模式下运行默认项目](../assets/run/run-default-template-project-in-chat-mode.png)

### 包含元数据和服务配置的项目

此示例包括项目元数据（`name`、`description`），并指定了哪些 agents 可用于 MCP 服务器和 CLI。

```yaml
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

正确配置 `aigne.yaml` 后，您就为项目奠定了坚实的基础。下一步是定义您的 agents 和技能的行为和能力。继续阅读 [Agents 和技能](./core-concepts-agents-and-skills.md)指南以了解更多信息。