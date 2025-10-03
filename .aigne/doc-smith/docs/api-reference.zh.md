# API 参考

本节为 `@aigne/core` 包导出的所有公共类、函数和类型提供了详细而全面的参考。它面向使用 AIGNE 构建应用程序并需要深入了解其编程接口的开发人员。

该 API 分为几个关键模块，每个模块负责框架功能的不同方面。下图说明了高级架构以及可供您使用的主要组件。

```d2
# @aigne/core 包架构

direction: right

Core: {
  shape: package
  AIGNE: "AIGNE 引擎协调工作流并管理上下文。"
}

Agents: {
  shape: package
  Agent: "所有 Agent 的基类。"
  AIAgent: "与语言模型交互。"
  TeamAgent: "管理一组 Agent。"
  FunctionAgent: "包装一个 JavaScript 函数。"
  ImageAgent: "根据提示生成图像。"
}

Models: {
  shape: package
  ChatModel: "语言模型的接口。"
  ImageModel: "图像生成模型的接口。"
}

Memory: {
  shape: package
  MemoryAgent: "存储和检索信息。"
  Recorder: "用于写入内存的技能。"
  Retriever: "用于从内存中读取的技能。"
}

Utilities: {
  shape: package
  PromptBuilder: "构建动态提示。"
  JSON: "JSON 解析和操作。"
  Streams: "处理数据流。"
}

Core -> Agents: "执行"
Agents -> Models: "使用"
Agents -> Memory: "访问"
Agents -> Utilities: "利用"
```

为了清晰和便于导航，API 参考分为以下几个部分。请选择一个类别以详细浏览相关导出。

<x-cards data-columns="3">
  <x-card data-title="主要导出" data-icon="lucide:package-open" data-href="/api-reference/main-exports">
    直接从 @aigne/core 包中可用的所有顶级导出的完整列表。
  </x-card>
  <x-card data-title="Agent 类" data-icon="lucide:bot" data-href="/api-reference/agent-classes">
    基础 Agent 类及其所有专用子类的详细文档。
  </x-card>
  <x-card data-title="模型类" data-icon="lucide:box" data-href="/api-reference/model-classes">
    用于创建模型集成的 ChatModel 和 ImageModel 基类的 API 参考。
  </x-card>
</x-cards>

有关所有更改的记录，包括新功能、错误修复和重大更改，请参阅[更新日志](./changelog.md)。