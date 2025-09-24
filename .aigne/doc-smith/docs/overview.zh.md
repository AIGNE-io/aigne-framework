# 概述

AIGNE 框架是一个完整的工具包，旨在帮助您轻松构建、运行和管理强大的 AI Agent。无论您是希望简化工作流程的开发者，还是渴望将 AI 创意变为现实的创造者，AIGNE 都提供了您快速入门所需的工具。

它简化了 Agent 开发的整个过程，从创建新项目到部署功能齐全的应用程序。通过处理 AI 集成的复杂部分，AIGNE 让您专注于使您的 Agent 与众不同的地方：它的技能和目的。

## 关键组件

该框架建立在三个核心支柱之上，它们协同工作以提供无缝的开发体验。

<x-cards data-columns="3">
  <x-card data-title="核心框架" data-icon="lucide:box" data-href="/core">
    您的 AI Agent 的基础引擎。它管理状态、协调技能，并为 Agent 逻辑提供必要的构建块。
  </x-card>
  <x-card data-title="命令行 (CLI)" data-icon="lucide:terminal" data-href="/cli">
    您的开发指挥中心。使用简单的命令来创建项目、在本地运行 Agent、运行测试和部署您的应用程序。
  </x-card>
  <x-card data-title="AI 模型" data-icon="lucide:brain-circuit" data-href="/models">
    操作的大脑。轻松将您的 Agent 连接到来自 OpenAI、Anthropic 和 Google 等提供商的各种强大语言模型。
  </x-card>
</x-cards>

## 工作原理

从高层次来看，您使用 AIGNE 命令行界面 (CLI) 来构建一个在核心框架上运行的 Agent。然后，核心框架连接到您选择的 AI 模型，为您的 Agent 的智能和对话能力提供动力。

```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  CLI: {
    label: "命令行 (CLI)"
    shape: rectangle
  }

  Core: {
    label: "核心框架"
    shape: rectangle
  }
}

AI-Models: {
  label: "AI 模型"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  OpenAI: { label: "OpenAI" }
  Anthropic: { label: "Anthropic" }
  Google: { label: "Google Gemini" }
  More: { label: "以及更多..." }
}

Developer -> AIGNE-Framework.CLI: "用于创建和管理 Agent"
AIGNE-Framework.CLI -> AIGNE-Framework.Core: "在此之上构建 Agent"
AIGNE-Framework.Core -> AI-Models: "连接以获取智能"
```

## 开始使用

准备好构建您的第一个 AI Agent 了吗？我们的入门指南将引导您在几分钟内安装 CLI 并运行一个 Agent。

<x-card data-title="5 分钟入门" data-icon="lucide:rocket" data-href="/cli/getting-started" data-cta="开始构建">
  遵循我们的分步指南，安装 AIGNE CLI，创建一个新项目，并与您的第一个 AI Agent 进行对话。
</x-card>