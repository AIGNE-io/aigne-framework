---
labels: ["Reference"]
---

# 指南

本节提供了实用的分步教程，帮助您使用 `@aigne/cli` 完成常见的开发任务。这些指南旨在让您亲身体验关键工作流程，从创建您的第一个 Agent 到将其部署用于生产环境。

我们建议您在深入学习之前，对 [核心概念](./core-concepts.md) 部分涵盖的主题有基本的了解。

---

### [创建自定义 Agent](./guides-creating-a-custom-agent.md)

学习如何从头开始构建一个自定义 Agent。本指南涵盖了使用 `aigne create` 搭建新项目、在 JavaScript 中定义 Agent 逻辑，以及将其作为技能集成到您的 `aigne.yaml` 配置中。

### [运行远程 Agent](./guides-running-remote-agents.md)

了解如何直接从远程 URL（例如 Git 仓库或 tarball）执行 AIGNE 项目。本指南涵盖了 `aigne run --url` 命令，适用于在没有本地设置的情况下测试、共享和运行 Agent。

### [部署 Agent](./guides-deploying-agents.md)

将您的 AIGNE 应用程序从开发阶段推向生产环境。本指南将引导您完成使用 `aigne deploy` 命令将项目作为 Blocklet 部署到指定端点的过程，使您的 Agent 可以作为服务访问。

---

遵循这些指南后，您将更加熟悉 `@aigne/cli` 的核心功能。有关所有命令及其选项的全面概述，请参阅 [命令参考](./command-reference.md)。