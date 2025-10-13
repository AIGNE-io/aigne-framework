我已经生成了一张图表，以宏观概述 AIGNE 框架的架构。现在，我将继续为“AIGNE 核心概念”部分生成详细的文档。

# AIGNE 核心概念

欢迎了解 AIGNE 框架的核心概念。本文档为开发者提供了构成 AIGNE 架构的基本构建模块的概览。理解这些概念对于使用 AIGNE 构建稳健、智能的应用程序至关重要。

该框架围绕模块化和可扩展的架构设计，允许开发者为各种任务创建、组合和管理复杂的 AI Agent。此架构的核心是几个关键组件：**Agents**、**模型**、**技能**和**记忆**，所有这些都通过一个中央 **AIGNE 项目**配置进行编排。

```d2
direction: down

AIGNE-Project: {
  label: "AIGNE 项目\n(编排与配置)"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  Agent: {
    label: "Agent"
    shape: rectangle
  }

  Models: {
    label: "模型"
    shape: rectangle
  }

  Skills: {
    label: "技能"
    shape: rectangle
  }

  Memory: {
    label: "记忆"
    shape: cylinder
  }
}

AIGNE-Project.Agent -> AIGNE-Project.Models: "使用"
AIGNE-Project.Agent -> AIGNE-Project.Skills: "执行"
AIGNE-Project.Agent -> AIGNE-Project.Memory: "访问"
```

## AIGNE 项目

AIGNE 项目是 AI 应用程序的顶层容器。它由一个 `aigne.yaml` 文件定义，该文件是配置和编排的中心枢纽。您可以在此文件中定义和连接所有其他核心组件。

**`aigne.yaml` 的主要职责：**

*   **项目定义**：设置项目的名称和描述。
*   **模型配置**：指定默认的聊天模型以及 Agent 要使用的其他模型。
*   **Agent 组合**：列出项目中包含的所有 Agent。
*   **技能注册**：注册可供 Agent 使用的技能（工具）。
*   **服务集成**：配置与 MCP (消息控制协议) 服务器等服务的连接。
*   **CLI 配置**：定义如何通过命令行界面暴露项目的 Agent。

### 示例：`aigne.yaml`

以下是一个典型的 `aigne.yaml` 文件示例，说明了这些组件是如何组合在一起的：

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

## Agents

Agent 是 AIGNE 框架中的主要行动者。它们是专门设计的实体，用于执行任务、与用户互动以及与其他 Agent 协作。每个 Agent 都有特定的目的，并可以配备自己的模型、技能和记忆。

该框架提供了几种类型的 Agent，每种都有不同的角色：

*   **`AIAgent`**：最基础的 Agent，旨在与 AI 模型交互。它能理解用户输入，使用 AI 模型处理输入并生成响应。它还可以配备技能（工具）来执行特定操作。
*   **`ChatModel`**：一种直接与基于聊天的语言模型（例如 GPT-4、Claude）交互的专用 Agent。
*   **`TeamAgent`**：一个编排者 Agent，负责管理一组其他 Agent。它可以根据输入将任务委派给团队中最合适的 Agent，从而实现复杂的多步骤工作流。
*   **`UserAgent`**：在系统中代表人类用户，捕获用户输入并将其转发给其他 Agent。
*   **`ImageAgent`**：一种专门用于处理图像相关任务的 Agent，与图像生成或分析模型交互。
*   **`GuideRailAgent`**：充当验证层，确保另一个 Agent 的输出符合预定义的模式或规则集。
*   **`TransformAgent`**：一个实用工具 Agent，用于处理数据并将其从一种格式转换为另一种格式。
*   **`MCPAgent`**：促进与消息控制协议（MCP）服务器的通信，允许 Agent 与更广泛的服务和 Agent 网络进行交互。

这些 Agent 被设计为可组合的，允许您通过各种配置将它们组合起来，构建复杂的系统。

## 模型

模型是为 Agent 提供智能的引擎。AIGNE 被设计为模型无关的，支持来自不同提供商的各种语言和图像模型。这使您可以为特定任务和预算选择最佳模型。

Agent 使用模型来理解语言、生成响应、分析数据或创建图像。您可以在 `aigne.yaml` 的项目级别配置默认模型，也可以为单个 Agent 分配特定模型以进行更精细的控制。

该框架包含了许多流行模型提供商的适配器，例如：
*   OpenAI (GPT 系列)
*   Anthropic (Claude 系列)
*   Google (Gemini 系列)
*   Amazon Bedrock
*   等等...

## 技能

技能是可重用的工具或函数，可将 Agent 的能力扩展到简单的聊天之外。它们类似于其他 AI 框架中的“工具”。通过为 Agent 提供技能，您可以使其能够与外部系统交互、访问数据库、调用 API 或执行复杂的计算。

技能通常定义为 JavaScript 或 TypeScript 函数，并在 `aigne.yaml` 文件中注册。当 `AIAgent` 配备了技能时，底层的语言模型可以智能地决定何时使用技能来满足用户的请求。

例如，您可以创建技能来：
*   从天气 API 获取当前天气。
*   从 CRM 检索客户信息。
*   执行数据库查询。
*   执行文件系统操作。

## 记忆

记忆允许 Agent 在多次交互中持久化信息并维护上下文。这对于创建有状态的对话体验至关重要，在这种体验中，Agent 可以记住对话的过往部分并从中学习。

AIGNE 支持不同的记忆系统，允许您配置对话历史和其他数据的存储方式和位置。这可以从用于短期上下文的简单内存存储，到用于长期记忆的更持久的数据库解决方案。

通过利用记忆，您的 Agent 可以：
*   记住用户偏好。
*   跟踪对话历史以提供相关响应。
*   从以前的交互中学习以提高未来性能。

## 工作原理

1.  用户与应用程序交互，输入由 **UserAgent** 捕获。
2.  输入被路由到适当的 Agent，例如 **AIAgent** 或 **TeamAgent**。
3.  Agent 使用其配置的**模型**来处理输入并决定下一步操作。
4.  如果需要，Agent 会执行其一个或多个**技能**来收集信息或执行操作。
5.  在此过程中，Agent 从其**记忆**中读取和写入数据以维护上下文。
6.  最后，Agent 生成一个响应并将其发送回用户。

整个工作流在 **AIGNE 项目** (`aigne.yaml`) 中定义和配置，为管理您的 AI 应用程序提供了一种清晰、集中的方式。