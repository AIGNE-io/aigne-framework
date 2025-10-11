# AIGNE 是什么？

AIGNE 框架，发音为 [ ˈei dʒən ]——类似于“agent”去掉“t”的发音——是一个功能性的 AI 应用开发框架，旨在简化和加速构建现代 AI 驱动的应用程序的过程。它提供了必要的工具和模块，可以用简单、可复用的组件构建复杂的系统。

*AIGNE* 这个名字有多层含义。它以法国南部一个中世纪小村庄的名字命名，同时也是古爱尔兰语中“精神”的意思，这反映了能够思考和行动的智能 Agent 的概念。作为一个缩写，它代表 **A**rtificial **I**ntelligence & **G**enerative **N**atural-Language **E**cosystem（人工智能与生成式自然语言生态系统）。

其核心是，AIGNE 是一个用于构建和协调专业化 AI “Agent” 团队的框架，这些 Agent 协同工作以完成复杂的任务。

### Agent 和工作流的力量

想象一下，你需要完成一个复杂的项目，比如撰写一份详细的研究报告。你不会只雇佣一个人来做所有的事情。相反，你会组建一个团队：一个研究员来收集信息，一个写手来起草内容，一个编辑来审阅，还有一个设计师来排版最终的文档。每个人都有特定的技能，他们在一个协调的流程中工作，即“工作流”。

AIGNE 也遵循同样的原则。你不是构建一个庞大、单一的 AI 程序，而是创建小而专注的 **Agent**。每个 Agent 都有一个特定的角色或指令。例如：

*   一个用于总结文章的 Agent。
*   一个用于编写代码的 Agent。
*   一个用于根据文本生成图像的 Agent。
*   一个只会用俳句（Haikus）说话的 Agent。

AIGNE 框架的真正力量在于它能够将这些独立的 Agent 组合成强大的**工作流**。你可以将多个 Agent 按顺序链接在一起，让它们并行工作，或者创建智能路由系统，将任务引导至合适的 Agent。这种模块化的方法使得构建、调试和扩展复杂的 AI 应用变得更加容易。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-framework-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-framework.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-framework.png" alt="AIGNE 框架架构" />
</picture>

### 主要特性

AIGNE 为开发 AI 应用提供了一个结构化的环境，具有以下几个关键优势：

*   **模块化设计**：通过将复杂问题分解为更小的、基于 Agent 的任务，代码变得更有条理、更高效、更易于维护。
*   **支持多种 AI 模型**：该框架不局限于单一的 AI 提供商。它内置了对 OpenAI、Gemini、Claude 等模型的支持，并且可以扩展以包含新的模型。这使您可以为每个特定任务选择最合适的 AI。
*   **灵活的工作流模式**：AIGNE 支持多种 Agent 协作模式，包括顺序管道、并行处理和条件路由，使您能够模拟几乎任何业务流程。
*   **TypeScript 支持**：对于开发者而言，全面的类型定义确保了代码的安全性和可靠性，从而改善了整体开发体验。

总而言之，AIGNE 是一个工具包，它提供了一种清晰而强大的方式来定义、管理和协调一支专业化的 AI Agent 团队，从而帮助您构建复杂的 AI 驱动应用。

要了解有关该系统核心组件的更多信息，请继续阅读下一节。

[下一篇：了解 Agent](./user-guide-understanding-agents.md)