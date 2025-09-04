---
labels: ["Reference"]
---

# 指南

本节提供了实用的分步教程，帮助你使用 @aigne/cli 完成常见的开发任务。这些指南旨在让你亲身体验关键工作流程，从创建第一个 Agent 到将其部署用于生产环境。

我们建议你在深入学习之前，对 [核心概念](./core-concepts.md) 部分涵盖的主题有基本的了解。

使用 @aigne/cli 的典型开发生命周期可视图示如下：

```d2
direction: down

# Define Shapes
Create-Project: {
  label: "1. 创建项目\n(aigne create)"
  shape: rectangle
}

Develop-Agent: {
  label: "2. 开发 Agent\n(编写 JS/TS 代码)"
  shape: rectangle
}

Local-Testing: {
  label: "3. 本地测试\n(aigne run & aigne test)"
  shape: rectangle
}

Deploy-Agent: {
  label: "4. 部署 Agent\n(aigne deploy)"
  shape: rectangle
}

Production-Service: {
  label: "生产服务\n(Blocklet)"
  shape: cylinder
}

Remote-Execution: {
  label: "远程运行\n(aigne run --url)"
  shape: rectangle
}


# Define Flow
Create-Project -> Develop-Agent: "脚手架"
Develop-Agent -> Local-Testing: "迭代与测试"
Local-Testing -> Develop-Agent: "优化"

Local-Testing -> Deploy-Agent: "准备生产"
Deploy-Agent -> Production-Service: "发布"

Local-Testing -> Remote-Execution: "替代执行"
```

<x-cards>
  <x-card data-title="创建自定义 Agent" data-href="/guides/creating-a-custom-agent" data-icon="lucide:file-plus-2">
    学习如何从零开始构建一个自定义 Agent。本指南涵盖了使用 `aigne create` 创建新项目、在 JavaScript 中定义 Agent 逻辑，以及将其作为技能集成到你的 `aigne.yaml` 配置中。
  </x-card>
  <x-card data-title="运行远程 Agent" data-href="/guides/running-remote-agents" data-icon="lucide:globe">
    了解如何直接从远程 URL（例如 Git 仓库或 tarball）执行 AIGNE 项目。本指南介绍了 `aigne run --url` 命令，该命令对于在没有本地设置的情况下测试和运行 Agent 非常有用。
  </x-card>
  <x-card data-title="部署 Agent" data-href="/guides/deploying-agents" data-icon="lucide:rocket">
    将你的 AIGNE 应用程序从开发阶段推向生产环境。本指南将引导你完成使用 `aigne deploy` 命令将项目作为 Blocklet 部署到指定端点的过程，使你的 Agent 可以作为服务访问。
  </x-card>
</x-cards>

遵循这些指南后，你将更熟悉 @aigne/cli 的核心功能。有关所有命令及其选项的全面概述，请参阅 [命令参考](./command-reference.md)。