---
labels: ["Reference"]
---

# 指南

本节提供了使用 AIGNE CLI 完成常见开发任务的实用分步指南。虽然 [命令参考](./command-reference.md) 详细介绍了每个命令和选项，但这些指南侧重于从头到尾实现特定目标。

每个指南都旨在引导您完成一个真实场景，提供代码片段和清晰的说明，以帮助您有效地使用 AIGNE 框架的关键功能。下图展示了一个在交互式聊天会话中运行的 agent，这是遵循这些指南后的常见结果。

![一个在交互式聊天会话中运行的 agent](../assets/run/run-default-template-project-in-chat-mode.png)

### [创建自定义 Agent](./guides-creating-a-custom-agent.md)

一篇关于创建新 JavaScript agent 的分步教程。学习如何定义其逻辑，将其构建为技能，并集成到项目中执行。本指南涵盖了从搭建新项目到编写 agent 核心功能的所有内容。

### [运行远程 Agents](./guides-running-remote-agents.md)

了解如何直接从远程 Git 仓库或 tarball URL 运行 agents。本指南介绍了 `aigne run` 命令如何下载、缓存和执行远程项目，这是一个用于测试、共享和协作的实用功能，无需进行本地设置。

---

浏览以上指南，获取关键 AIGNE CLI 工作流的实践经验。要全面了解所有可用命令及其选项，请参阅 [命令参考](./command-reference.md)。