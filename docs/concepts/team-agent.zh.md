# Aigne 框架中的 TeamAgent 模块

Aigne 框架中的 TeamAgent 模块旨在管理和协调一组 Agent，以集体完成任务，无论是顺序执行还是并行执行。它提供了灵活的处理模式，以满足不同任务协调需求，如创建需要阶段性输出的 Agent 工作流或同时执行独立任务。该模块在构建具有专门组件的复杂 Agent 系统且要求无缝协作或需要独立处理的多重分析时尤其有用。

## TeamAgent 的顺序执行

本节介绍 TeamAgent 中的顺序模式，旨在逐一处理各个 Agent。团队中的每个 Agent 按顺序执行，接收到其前驱的组合输出。这种模式非常适合于一个 Agent 的输出作为下一个 Agent 输入的工作流，从而促进协调的处理管道。

```ts
const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("要翻译的文本内容"),
  }),
  instructions: "将文本翻译成中文：\n{{content}}",
  outputKey: "translation",
});

const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("已翻译的文本"),
  }),
  instructions: "美化以下文字：\n{{translation}}",
  outputKey: "formatted",
});

const teamAgent = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

## 顺序模式下调用 TeamAgent

在这里，TeamAgent 被用于依次翻译和格式化文本。该实例展示了输入内容的翻译过程和随后通过一系列同步运行的 Agent 进行的美化过程。这展示了 TeamAgent 在需要通过分阶段操作逐步转换和提炼数据的情境中的实用性。

```ts
const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(teamAgent, {
  content: "AIGNE is a great framework to build AI agents.",
});
console.log(result);
// 输出：
// {
//   formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
// }
expect(result).toEqual({
  formatted: "AIGNE 是一个出色的人工智能代理构建框架。",
});
```

## TeamAgent 的并行执行

TeamAgent 的并行处理模式允许所有 Agent 在共享输入下同时执行。这促进了输出的并行生成和合并，非常适合于那些需要同时进行多个分析或转换的任务，而无需依赖中间结果。

```ts
const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("要分析的产品描述"),
  }),
  instructions: `\
您是一名产品分析师。根据产品描述，识别并列出产品的主要特征。
要具体化并仅关注特征。格式为要点。

产品描述：
{{product}}`,
  outputKey: "features",
});

const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("要分析的产品描述"),
  }),
  instructions: `\
您是一名市场研究员。根据产品描述，识别该产品的目标受众。
考虑人口统计信息、兴趣、需求和痛点。格式为要点。

产品描述：
{{product}}`,
  outputKey: "audience",
});

const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

## 并行模式下调用 TeamAgent

在这个例子中，TeamAgent 通过并行调用功能和受众分析来处理产品的输入描述。这展示了其同时处理复杂分析的能力，每个 Agent 专注于特定的数据方面，从而在不用等待顺序输出的情况下促进全面的洞察。

```ts
const model = new OpenAIChatModel();
const aigne = new AIGNE({ model });

const result = await aigne.invoke(analysisTeam, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
// 输出将包括：
// {
//   features: "- 无代码平台\n- 生成式 AI 功能\n- 应用引擎功能\n- 易于集成",
//   audience: "- 商业专业人士\n- 非技术用户\n- 寻求 AI 解决方案的组织\n- 寻找快速原型的开发者",
// }

expect(result).toEqual({
  features:
    "- 无代码平台\n- 生成式 AI 功能\n- 应用引擎功能\n- 易于集成",
  audience:
    "- 商业专业人士\n- 非技术用户\n- 寻求 AI 解决方案的组织\n- 寻找快速原型的开发者",
});
```

Aigne 框架中的 TeamAgent 模块在构建和协调复杂的多 Agent 系统方面提供了巨大的灵活性。通过支持顺序和并行执行模式，它能够应对多种用例，范围从需要通过 Agent 数据交接的管道转换到最大化吞吐量的并行分析。通过集成和扩展自定义 Agent 的 TeamAgent，可以进一步根据特定的应用需求来调整系统行为，利用过程调度和模块化组合的核心优势。