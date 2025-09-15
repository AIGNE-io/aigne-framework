---
labels: ["Reference"]
---

# 核心概念

AIGNE 项目为开发、测试和部署 AI Agent 提供了结构化环境。项目的核心是一个目录，其中包含定义 Agent、其可用技能以及其连接的语言模型的配置文件。本节将详细介绍这些基本构建块。

## 项目结构

当你使用 `aigne create` 创建新项目时，它会搭建一个标准的目录结构以保持组件的组织性。一个典型的项目如下所示：

```text Project Structure icon=mdi:folder-open
my-agent-project/
├── aigne.yaml        # 主项目配置文件。
├── agents/           # Agent 定义文件目录。
│   └── chat.yaml     # Agent 定义示例。
└── skills/           # 技能实现文件目录。
    └── sandbox.js    # 技能实现示例。
```

这种结构将配置（`aigne.yaml`、`agents/`）与实现（`skills/`）分离开来，使你的项目模块化且易于管理。

## 整体工作原理

下图展示了 AIGNE 项目核心组件之间的关系。核心的 `aigne.yaml` 文件统筹全局，定义了存在的 Agent、它们可以使用的技能以及为其智能提供支持的 AI 模型。

```d2
direction: down

aigne-yaml: {
  label: "aigne.yaml"
  shape: rectangle
}

agent: {
  label: "Agent\n（例如，chat.yaml）"
  shape: rectangle
}

skill: {
  label: "技能\n（例如，sandbox.js）"
  shape: rectangle
}

chat-model: {
  label: "聊天模型\n（例如，gpt-4o-mini）"
  shape: cylinder
}

aigne-yaml -> agent: "定义"
aigne-yaml -> skill: "注册"
aigne-yaml -> chat-model: "配置"
agent -> skill: "使用"
agent -> chat-model: "与之通信"
```

要理解 AIGNE 项目的工作原理，必须掌握其两个主要组成部分：核心项目配置以及可执行的 Agent 和技能。下文将对它们进行更详细的探讨。

<x-cards>
  <x-card data-title="项目配置 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    这是项目的主清单文件。它定义了要使用的聊天模型，列出了可用的 Agent，并注册了这些 Agent 可以访问的技能。
  </x-card>
  <x-card data-title="Agent 和技能" data-icon="lucide:bot" data-href="/core-concepts/agents-and-skills">
    Agent 是执行任务的核心角色，由其指令和能力定义。技能是 Agent 使用的工具，实现为提供特定功能的函数（例如，JavaScript 模块）。
  </x-card>
</x-cards>

---

有了这些基础知识，你就可以深入了解如何配置项目了。

**下一步**：在[项目配置 (aigne.yaml)](./core-concepts-project-configuration.md) 指南中了解有关主配置文件的更多信息。