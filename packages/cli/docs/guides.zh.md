---
labels: ["Reference"]
---

# 指南

本节提供实用的分步教程，帮助您使用 `@aigne/cli` 完成常见的开发任务。这些指南旨在让您亲身体验关键工作流程，从创建您的第一个 Agent 到将其部署用于生产环境。

建议您在深入学习之前，对 [核心概念](./core-concepts.md) 部分涵盖的主题有基本的了解。

<x-cards>
  <x-card data-title="创建自定义 Agent" data-href="/guides/creating-a-custom-agent" data-icon="lucide:file-plus-2">
    学习如何从零开始构建自定义 Agent。本指南涵盖使用 `aigne create` 构建新项目、在 JavaScript 中定义 Agent 逻辑，以及将其作为一项技能集成到您的 `aigne.yaml` 配置中。
  </x-card>
  <x-card data-title="运行远程 Agent" data-href="/guides/running-remote-agents" data-icon="lucide:globe">
    了解如何直接从远程 URL（如 Git 仓库或 tarball）执行 AIGNE 项目。本指南涵盖 `aigne run --url` 命令，该命令对于在没有本地设置的情况下测试和运行 Agent 非常有用。
  </x-card>
  <x-card data-title="部署 Agent" data-href="/guides/deploying-agents" data-icon="lucide:rocket">
    将您的 AIGNE 应用程序从开发阶段推向生产环境。本指南将引导您完成使用 `aigne deploy` 命令将项目作为 Blocklet 部署到指定端点的过程，从而使您的 Agent 可作为服务进行访问。
  </x-card>
</x-cards>

遵循这些指南后，您将更加熟悉 `@aigne/cli` 的核心功能。有关所有命令及其选项的全面概述，请参阅 [命令参考](./command-reference.md)。