# TeamAgent

[English](./team-agent.md) | [中文](./team-agent.zh.md)

## 概述

TeamAgent 是 AIGNE 框架中的一个强大组件，它允许开发者将多个代理组合成一个团队，以协同工作的方式解决复杂问题。TeamAgent 支持两种处理模式：顺序处理（sequential）和并行处理（parallel），使开发者能够根据任务的依赖关系灵活选择最合适的工作流程。通过 TeamAgent，可以构建复杂的多阶段工作流，每个阶段由专门的代理负责，从而实现更高效、更专业的任务处理。无论是需要按特定顺序执行的任务链，还是可以同时进行的独立任务，TeamAgent 都能提供简洁而强大的解决方案。

## 顺序处理模式

在顺序处理模式中，TeamAgent 中的代理按照添加的顺序依次执行，前一个代理的输出将作为后一个代理的输入。这种模式适合处理有明确依赖关系的任务，例如翻译后再进行文本美化。

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-sequential-create-agent"
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("The text content to translate"),
  }),
  instructions: "Translate the text to Chinese:\n{{content}}",
  outputKey: "translation",
});

const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("The translated text"),
  }),
  instructions: "Prettier the following text:\n{{translation}}",
  outputKey: "formatted",
});

const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

在上面的示例中，我们创建了两个 AIAgent：

1. `translatorAgent`：负责将文本翻译成中文，并将结果存储在 `translation` 字段中
2. `prettierAgent`：接收翻译后的文本，进行美化处理，并将结果存储在 `formatted` 字段中

然后，我们使用 `TeamAgent.from()` 方法创建一个顺序处理的团队代理，将这两个代理作为技能添加到团队中。通过设置 `mode: ProcessMode.sequential`，确保这些代理按照添加的顺序依次执行。

### 调用顺序处理团队

创建 TeamAgent 后，可以使用 AIGNE 的 invoke 方法向团队发送请求并获取响应。在顺序处理模式中，每个代理的输出会作为下一个代理的输入，最终返回包含所有代理输出的结果。

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-sequential-invoke"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(teamAgent, {
  content: "AIGNE is a great framework to build AI agents.",
});
console.log(result);
// Output:
// {
//   translation: "AIGNE 是一个构建人工智能代理的优秀框架。",
//   formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
// }
```

在这个示例中，我们首先创建了一个 OpenAIChatModel 实例和一个 AIGNE 实例。然后，我们调用 `aigne.invoke()` 方法，传入团队代理和初始输入。处理流程如下：

1. `translatorAgent` 接收输入 `{ content: "AIGNE is a great framework to build AI agents." }`，将文本翻译成中文，并输出 `{ translation: "AIGNE 是一个构建人工智能代理的优秀框架。" }`
2. `prettierAgent` 接收 `translatorAgent` 的输出作为输入，对翻译后的文本进行美化，并输出 `{ formatted: "AIGNE 是一个出色的人工智能代理构建框架。" }`
3. 最终结果包含所有代理的输出：`{ translation: "...", formatted: "..." }`

## 并行处理模式

在并行处理模式中，TeamAgent 中的所有代理同时执行，各自处理相同的输入。这种模式适合处理相互独立的任务，例如同时分析产品的不同方面。

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-parallel-create-agent"
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: `\
You are a product analyst. Given a product description, identify and list the key features of the product.
Be specific and focus only on the features. Format as bullet points.

Product description:
{{product}}`,
  outputKey: "features",
});

const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: `\
You are a market researcher. Given a product description, identify the target audience for this product.
Consider demographics, interests, needs, and pain points. Format as bullet points.

Product description:
{{product}}`,
  outputKey: "audience",
});

const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

在上面的示例中，我们创建了两个 AIAgent：

1. `featureAnalyzer`：负责分析产品特性，并将结果存储在 `features` 字段中
2. `audienceAnalyzer`：负责分析目标受众，并将结果存储在 `audience` 字段中

然后，我们使用 `TeamAgent.from()` 方法创建一个并行处理的团队代理，将这两个代理作为技能添加到团队中。通过设置 `mode: ProcessMode.parallel`，确保这些代理同时执行，各自处理相同的输入。

### 调用并行处理团队

创建并行处理的 TeamAgent 后，可以使用 AIGNE 的 invoke 方法向团队发送请求并获取响应。在并行处理模式中，所有代理同时接收相同的输入，最终返回包含所有代理输出的结果。

```ts file="../../docs-examples/test/concepts/team-agent.test.ts" region="example-agent-parallel-invoke"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(analysisTeam, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
// Output would include:
// {
//   features: "- No-code platform\n- Generative AI capabilities\n- App engine functionality\n- Easy integration",
//   audience: "- Business professionals\n- Non-technical users\n- Organizations seeking AI solutions\n- Developers looking for rapid prototyping",
// }
```

在这个示例中，我们首先创建了一个 OpenAIChatModel 实例和一个 AIGNE 实例。然后，我们调用 `aigne.invoke()` 方法，传入团队代理和初始输入。处理流程如下：

1. `featureAnalyzer` 和 `audienceAnalyzer` 同时接收输入 `{ product: "AIGNE is a No-code Generative AI Apps Engine" }`
2. `featureAnalyzer` 分析产品特性，输出 `{ features: "- No-code platform\n- ..." }`
3. `audienceAnalyzer` 分析目标受众，输出 `{ audience: "- Business professionals\n- ..." }`
4. 最终结果合并所有代理的输出：`{ features: "...", audience: "..." }`

## 组合使用顺序和并行处理

TeamAgent 的一个强大特性是可以将顺序处理和并行处理组合使用，构建复杂的工作流。例如，可以先并行分析产品的不同方面，然后将分析结果顺序传递给内容创建代理。

这种组合使用的方式可以通过嵌套 TeamAgent 来实现。例如，可以创建一个并行处理的 TeamAgent 作为顺序处理 TeamAgent 的第一个技能，然后添加其他需要依赖并行处理结果的代理作为后续技能。

## 总结

TeamAgent 是 AIGNE 框架中一个强大且灵活的工具，为用户提供了组合多个代理协同工作的能力：

1. **顺序处理模式**：代理按照添加的顺序依次执行，前一个代理的输出作为后一个代理的输入。适合处理有明确依赖关系的任务，如翻译后再美化文本。

2. **并行处理模式**：所有代理同时执行，各自处理相同的输入。适合处理相互独立的任务，如同时分析产品的不同方面。

3. **组合使用**：通过嵌套 TeamAgent，可以组合使用顺序和并行处理模式，构建复杂的工作流。

TeamAgent 的主要优势在于：

* **模块化设计**：每个代理专注于特定任务，提高处理质量和效率
* **灵活组合**：根据任务依赖关系选择顺序或并行处理模式
* **可扩展性**：轻松添加或移除技能，调整工作流程
* **结构化输出**：每个代理的输出都有明确的字段名，便于后续处理

根据实际需求，开发者可以灵活选择合适的处理模式，构建高效、专业的多代理工作流。
