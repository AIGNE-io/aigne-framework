# 主要导出

本节提供了可直接从 `@aigne/core` 包中使用的所有顶级导出的完整列表。这些是您在构建 AI 应用程序时将使用的主要构建模块。导入它们非常简单。

```typescript icon=logos:typescript
import { AIGNE, AIAgent, ChatModel, PromptBuilder } from '@aigne/core';
```

下表详细介绍了每个导出，并按其在框架中的功能进行了分类。

| 导出 | 类别 | 描述 |
| :--- | :--- | :--- |
| **AIGNE** | 核心引擎 | 用于编排 Agent、管理上下文和执行工作流的主类。 |
| **Context** | 核心引擎 | 用于状态管理的中心对象，在工作流中的所有 Agent 之间传递。 |
| **Agent** | Agent 类 | 用于创建所有类型 Agent 的基类。 |
| **AIAgent** | Agent 类 | 一种与语言模型交互以根据提示词执行任务的 Agent。 |
| **TeamAgent** | Agent 类 | 一种编排一组其他 Agent 协同工作的 Agent。 |
| **TransformAgent** | Agent 类 | 一种用于在其他 Agent 之间重塑和操作 JSON 数据的 Agent。 |
| **ImageAgent** | Agent 类 | 一种使用图像模型从文本提示词生成图像的专用 Agent。 |
| **GuideRailAgent** | Agent 类 | 一种旨在对其他 Agent 的输出强制执行特定规则或约束的 Agent。 |
| **MCPAgent** | Agent 类 | 主控程序 Agent，负责高级编排。 |
| **UserAgent** | Agent 类 | 一种代表人类用户并与之交互的 Agent。 |
| **ChatModel** | 模型类 | 用于创建与各种基于聊天的语言模型集成的基类。 |
| **ImageModel** | 模型类 | 用于创建与各种图像生成模型集成的基类。 |
| **Model** | 模型类 | 所有模型类型的基础基类。 |
| **MemoryAgent** | 内存 | 一种提供记忆能力的 Agent，允许存储和检索数据。 |
| **Recorder** | 内存 | `MemoryAgent` 用来保存信息的技能。 |
| **Retriever** | 内存 | `MemoryAgent` 用来回忆已保存信息的技能。 |
| **PromptBuilder** | 提示词工具 | 一种用于从模板和变量动态构建复杂提示词的工具。 |
| **Template** | 提示词工具 | 表示可由 `PromptBuilder` 处理的提示词模板。 |
| **parseJson** | 工具 | 一种用于安全解析 JSON 字符串的工具函数。 |
| **getRole** | 工具 | 一种用于处理和解析 Agent 交互中角色的工具函数。 |
| **readStream** | 工具 | 一种用于读取和处理数据流的工具函数。 |
| **AgentOutput** | 类型 | Agent 标准输出结构的类型定义。 |
| **AgentStream** | 类型 | 用于处理来自 Agent 的流式输出的类型定义。 |
