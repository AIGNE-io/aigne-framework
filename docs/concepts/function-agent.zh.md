```markdown
# FunctionAgent: 在 Aigne 框架中实现和使用基于函数的智能体

Aigne 框架中的 FunctionAgent 模块是一个灵活的组件，旨在通过基于函数的方法封装功能。对于需要自定义逻辑的场景，如数据处理或外部 API 交互，该模块提供了与其他系统组件的无缝集成。本文件展示了 FunctionAgent 在天气数据检索等任务中的实际应用，强调了包括同步处理、异步生成器和流响应在内的不同方法。

## 创建用于天气检索的基本 FunctionAgent

创建基本 FunctionAgent 展示了基于函数式编程原则定义智能体的最小示例。在此示例中，智能体使用 Aigne 核心的 FunctionAgent 模块配置，以检索特定位置的当前天气数据。通过使用 Zod 结构来构建输入和输出，FunctionAgent 为数据处理操作提供了验证和结构。处理函数用于获取并返回天气信息，强调了在 Aigne 的智能体模型中，验证、数据处理和操作执行的无缝集成。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/function-agent.test.ts" region="example-agent-basic"
const weather = FunctionAgent.from({
  name: "getWeather",
  description: "获取给定地点的当前天气。",
  inputSchema: z.object({
    city: z.string().describe("要获取天气的城市。"),
  }),
  outputSchema: z.object({
    $message: z.string().describe("智能体的信息。"),
    temperature: z.number().describe("当前温度，单位为摄氏度。"),
  }),
  process: async ({ city }) => {
    console.log(`Fetching weather for ${city}`);
    const temperature = 25; // 你可以用实际天气获取逻辑替换此处

    return {
      $message: "Hello, I'm AIGNE!",
      temperature,
    };
  },
});

const result = await weather.invoke({ city: "New York" });
console.log(result);
```

## 实现一个带有异步生成器的 FunctionAgent

这个示例展示了如何实现一个利用异步生成器来进行响应流式传输的 FunctionAgent。这种方法允许增量输出交付，适用于实时响应至关重要的场景。智能体随着时间推移产生部分结果，异步管理文本消息的组合和数据更新，充分利用 JavaScript 异步生成器的强大功能。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/function-agent.test.ts" region="example-agent-generator"
const weather = FunctionAgent.from({
  inputSchema: z.object({
    city: z.string().describe("要获取天气的城市。"),
  }),
  outputSchema: z.object({
    $message: z.string().describe("智能体的信息。"),
    temperature: z.number().describe("当前温度，单位为摄氏度。"),
  }),
  process: async function* ({ city }) {
    console.log(`Fetching weather for ${city}`);

    yield { delta: { text: { $message: "Hello" } } };
    yield { delta: { text: { $message: "," } } };
    yield { delta: { text: { $message: " I'm" } } };
    yield { delta: { text: { $message: " AIGNE" } } };
    yield { delta: { text: { $message: "!" } } };
    yield { delta: { json: { temperature: 25 } } };

    return { temperature: 25 };
  },
});

const result = await weather.invoke({ city: "New York" });
console.log(result);
```

## 使用 FunctionAgent 进行流式响应

在需要实时更新的场景中，如交互式用户界面，流响应功能至关重要。本节演示了如何构建 FunctionAgent 来提供此类流式功能。通过在处理函数中实现 ReadableStream，智能体可以向客户端传输增量数据块，实现渐进式更新。这种技术对于减少延迟和提高需要即时反馈的应用程序的用户体验非常有用。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/function-agent.test.ts" region="example-agent-streaming"
const weather = FunctionAgent.from({
  inputSchema: z.object({
    city: z.string().describe("要获取天气的城市。"),
  }),
  outputSchema: z.object({
    $message: z.string().describe("智能体的信息。"),
    temperature: z.number().describe("当前温度，单位为摄氏度。"),
  }),
  process: async ({ city }) => {
    console.log(`Fetching weather for ${city}`);

    return new ReadableStream({
      start(controller) {
        controller.enqueue({ delta: { text: { $message: "Hello" } } });
        controller.enqueue({ delta: { text: { $message: "," } } });
        controller.enqueue({ delta: { text: { $message: " I'm" } } });
        controller.enqueue({ delta: { text: { $message: " AIGNE" } } });
        controller.enqueue({ delta: { text: { $message: "!" } } });
        controller.enqueue({ delta: { json: { temperature: 25 } } });
        controller.close();
      },
    });
  },
});

const stream = await weather.invoke({ city: "New York" }, { streaming: true });
```

## 部署为纯函数的 FunctionAgent

此示例强调了使用纯函数部署 FunctionAgent 的简洁性和有效性。通过直接将函数作为参数传递给智能体创建工厂方法，开发人员可以创建仅专注于核心逻辑的轻量级智能体，无需额外配置。这种模式非常适合于智能体逻辑简单的场景，优先考虑减少开销。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/function-agent.test.ts" region="example-agent-pure-function"
const weather = FunctionAgent.from(async ({ city }) => {
  console.log(`Fetching weather for ${city}`);

  return {
    $message: "Hello, I'm AIGNE!",
    temperature: 25,
  };
});

const result = await weather.invoke({ city: "New York" });
console.log(result);
```

所提供的示例展示了 FunctionAgent 模块在不同操作需求中的多样性。从基本的同步处理到更复杂的流媒体和基于生成器的智能体，开发人员可以根据应用程序的性能需求和交互模型选择合适的模式。此外，使用纯函数创建 FunctionAgent 可以在逻辑简单的场景中实现高效和直接的部署。
```