---
labels: ["Reference"]
---

# 核心概念

要高效地使用 AIGNE 进行构建，理解项目的基本组件至关重要。本节将介绍几个关键概念：以 `aigne.yaml` 为核心的项目结构，以及被称为 Agents 和技能的可执行单元。这些元素共同协作，以创建模块化且功能强大的 AI 应用程序。

```d2
direction: down

AIGNE-Project: {
  shape: package
  label: "AIGNE 项目"

  aigne-yaml: {
    shape: document
    label: "aigne.yaml\n(项目清单)"
  }

  Agents: {
    shape: package
    chat-yaml: {
      shape: document
      label: "chat.yaml"
    }
  }

  Skills: {
    shape: package
    sandbox-js: {
      shape: document
      label: "sandbox.js"
    }
  }

  aigne-yaml -> Agents.chat-yaml: "注册"
  aigne-yaml -> Skills.sandbox-js: "注册"
  Agents.chat-yaml -> Skills.sandbox-js: "使用"
}
```

## 项目结构与配置

`aigne.yaml` 文件是每个 AIGNE 项目的核心清单。它作为配置的唯一真实来源，用于定义项目元数据、指定默认聊天模型以及注册所有的 Agents 和技能。通过在单一文件中管理这些关系，`aigne.yaml` 为复杂的项目提供了清晰且有组织的结构。

要了解所有可用属性和配置选项的完整说明，请参阅 [项目配置 (aigne.yaml)](./core-concepts-project-configuration.md) 文档。

## Agents 与技能

Agents 和技能是 AIGNE 项目中的主要可执行组件，代表了 AI 应用程序的逻辑和功能。

### Agents
**Agent** 是一个旨在执行任务的实体。它由一组指令定义，能够记录交互历史，并利用一项或多项技能来实现其目标。Agents 通常在各自的 YAML 文件（例如 `chat.yaml`）中定义，用于指定其行为和可供使用的工具。

### 技能
**技能** 是 Agent 可以调用的可复用工具或函数。技能提供具体、封装的功能，例如执行 JavaScript 代码 (`sandbox.js`) 或与文件系统交互。这种模块化的方法使你能够通过组合简单、可复用且可测试的组件来构建复杂的 Agent 行为。

以下是默认 `chat` agent 运行的示例，它使用其技能来响应用户输入：

![一个在聊天模式下运行的 agent](../assets/run/run-default-template-project-in-chat-mode.png)

若要了解如何定义和组织这些组件，请参阅详细的 [Agents 与技能](./core-concepts-agents-and-skills.md) 指南。

## 后续步骤

掌握了这些核心概念后，你就可以开始探索项目配置的具体细节，并学习如何构建自己的 Agents 和技能。以下各节将为每个组件提供深入的讲解。

<x-cards data-columns="2">
  <x-card data-title="项目配置 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    深入了解主项目配置文件的详细信息及其属性。
  </x-card>
  <x-card data-title="Agents 与技能" data-icon="lucide:bot" data-href="/core-concepts/agents-and-skills">
    了解如何具体定义和创建项目的核心可执行组件。
  </x-card>
</x-cards>