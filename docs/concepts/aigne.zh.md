# AIGNE 框架：智能 Agent 交互协调

AIGNE 框架通过协调多个智能 Agent，为管理复杂的 AI 应用提供了强大的环境。它允许开发者集成具有自定义模型和配置的各种 Agent，从而实现任务的无缝协调。在需要专门 Agent 动态交互的场景中，例如模块化 AI 系统或分布式 AI 环境中，AIGNE 框架尤为重要。

## 使用自定义模型初始化 AIGNE 并添加 Agents

AIGNE 框架作为 AI 应用的中央协调点，使开发者能够协调多个 Agent 之间的交互。用户可以使用特定的配置初始化 AIGNE 实例，包括一个全局模型，如 OpenAI 的 GPT-4o-mini。此设置允许集成各种能够利用已定义模型来执行 AI 驱动任务的 Agent。通过提供描述并使用 `addAgent` 方法，用户可以增强实例的功能，并根据特定需求进行定制。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-create-aigne"
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
assert(aigne.model);

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});

aigne.addAgent(agent);
```

## 调用 Agents 以获取 AI 驱动的回应

AIGNE 类中的 `invoke` 方法为使用简单的消息输入与 Agents 交互提供了强大的机制。无论是查询单一响应还是处理流式输出，此方法都能促进从 Agents 中获得可操作的洞见。开发者可以利用此方法进行同步或异步通信模式，从而确保在各种 AI 应用工作流中实现灵活的集成。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent"
spyOn(aigne.model, "process").mockReturnValueOnce({
  text: "AIGNE is a platform for building AI agents.",
});
const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
expect(result).toEqual({ $message: "AIGNE is a platform for building AI agents." });
```

## 流式 Agent 响应以实现实时数据处理

AIGNE 处理流式响应的能力允许应用程序实时处理数据，这对于像对话式 AI 这样的任务非常重要，该任务需要及时反馈以增强用户体验。利用流功能可确保应用程序能动态地对生成的数据部分做出反应，从而实现更具交互性和响应性的系统行为。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent-streaming"
spyOn(aigne.model, "process").mockReturnValueOnce(
  stringToAgentResponseStream("AIGNE is a platform for building AI agents."),
);
const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });
let response = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
  }
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
expect(response).toEqual("AIGNE is a platform for building AI agents.");
```

## 创建和使用用户 Agent 实现一致的交互

AIGNE 框架中的用户 Agent 概念通过包装现有的 Agent 简化了与特定 Agent 的重复交互，促进了代码重用和精简的交互。在需要通过可能变化的输入反复调用 Agent 的场景中，这一特性提供了一致的接口并高效地封装了交互。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent-user-agent"
spyOn(aigne.model, "process").mockReturnValueOnce({
  text: "AIGNE is a platform for building AI agents.",
});
const userAgent = aigne.invoke(agent);
const result1 = await userAgent.invoke("What is AIGNE?");
console.log(result1);
// Output: { $message: "AIGNE is a platform for building AI agents." }
expect(result1).toEqual({ $message: "AIGNE is a platform for building AI agents." });
```

## 安全关闭 AIGNE 实例

shutdown 方法是 AIGNE 生命周期管理的重要组成部分，确保所有 Agent 和资源被正确关闭。此功能对于以结构化和可预测的方式清理资源至关重要，它防止了资源泄漏并确保了稳定性，尤其是在长时间运行或频繁初始化和终止的应用中。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-shutdown"
await aigne.shutdown();
```

## 从文件加载预配置的 AIGNE 实例

静态 `load` 方法提供了一种简化的方式，从外部文件（如 YAML）中定义的配置初始化复杂的 AIGNE 设置。这种设计促进了模块化和轻松的配置管理，使团队能将 Agent 策略和设置与代码库分离，从而增强可维护性和可扩展性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/aigne.test.ts" region="example-aigne-load"
const path = join(import.meta.dirname, "../../test-aigne"); // "/PATH/TO/AIGNE_PROJECT";

const aigne = await AIGNE.load(path, { models: [OpenAIChatModel] });

assert(aigne.model);
expect(aigne.model).toBeInstanceOf(OpenAIChatModel);
```

总之，AIGNE 框架为开发者通过高效的 Agent 协调和模型管理构建复杂的 AI 系统提供了全面的工具。本文档中提到的 `invoke`、`publish` 和 `subscribe` 方法提供了多种通信模式，而诸如 `addAgent` 和 `load` 等工具进一步增强了框架在不同应用场景中的适应性。为优化其应用，建议开发者考虑整合和生命周期策略，以确保稳健和高效的 AI 工作流程。