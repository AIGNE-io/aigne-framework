# 高级主题

掌握了核心概念并构建了基本应用程序后，您就可以开始探索 AIGNE 框架更复杂的功能了。本节专为希望构建复杂、稳健且高度定制化 AI 应用的开发者而设计。在这里，我们将深入探讨高级模式和工具，这些模式和工具可以更好地控制 Agent 定义、提示工程、执行生命周期和数据处理。

以下主题提供了利用这些高级功能的深入指南。理解这些主题将使您能够从简单的 Agent 工作流转向构建企业级 AI 系统。

<x-cards data-columns="2">
  <x-card data-title="使用 YAML 定义 Agent" data-icon="lucide:file-code" data-href="/developer-guide/advanced-topics/defining-agents-with-yaml">
    学习如何使用 YAML 文件以声明方式定义和配置 Agent。这种方法将配置与代码分离，使您的 Agent 系统更易于管理、版本控制和部署。
  </x-card>
  <x-card data-title="提示" data-icon="lucide:terminal" data-href="/developer-guide/advanced-topics/prompts">
    使用 PromptBuilder 深入了解动态提示管理。本指南介绍了如何使用 Nunjucks 模板为您的 AI 模型创建灵活、可重用且具有上下文感知能力的提示。
  </x-card>
  <x-card data-title="钩子" data-icon="lucide:git-pull-request" data-href="/developer-guide/advanced-topics/hooks">
    了解 Agent 执行生命周期以及如何使用钩子对其进行拦截。学习在 onStart、onEnd 和 onSkillStart 等不同阶段添加自定义逻辑、日志记录或监控。
  </x-card>
  <x-card data-title="流式传输" data-icon="lucide:fast-forward" data-href="/developer-guide/advanced-topics/streaming">
    了解如何处理来自 Agent 的实时流式响应。这对于创建响应迅速、能够在信息可用时立即传递信息的对话式应用程序至关重要。
  </x-card>
</x-cards>

## 总结

本节提供了提升您的 AI 应用程序所需的工具和技术。通过利用声明式定义、动态提示、生命周期钩子和流式传输，您可以构建更强大、可维护且高效的 Agent 系统。

有关更多详细信息，请转到上面链接的具体子章节。要了解这些组件如何融入更广泛的架构，请参阅 [核心概念](./developer-guide-core-concepts.md) 文档。