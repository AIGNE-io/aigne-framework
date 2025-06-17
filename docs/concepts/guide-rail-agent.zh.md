<markdown>
# GuideRail Agent: 智能体系统中的验证与控制

GuideRail Agent 在智能体系统中作为重要组件运行，负责验证、转换和控制智能体之间的信息流。其设计目的是强制执行规则，确保符合预定义的约束，特别适用于需要严格遵循合规性和数据完整性的情境中。典型的应用场景包括对准确性和道德操作有高要求的金融环境。

## 创建一个金融 GuideRailAgent

GuideRail Agent 在智能体系统中作为验证者、转换器或控制器运行，特别设计用来执行规则并确保智能体之间的信息遵循预定义的约束。本部分演示如何创建一个专业的金融 GuideRailAgent，禁止其提供投机性的加密货币价格预测。此类行为导轨在合规性和数据完整性关键的环境中尤其有用，确保智能体在明确的行为约束下运行。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-guide-rail"
const financial = AIAgent.from({
  ...guideRailAgentOptions,
  instructions: `你是一名金融助手。你必须确保不提供加密货币价格预测或预报。
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
});
```

## 将 GuideRails 集成到 Agent 中

本节演示将 GuideRailAgents 集成到现有智能体框架中。通过将 GuideRails 与智能体关联，开发人员可以在信息流上施加额外的控制和验证层。这对建立智能体必须遵循的规则层次结构特别有用，从而防止错误输出并增强整个系统的稳健性。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-agent"
const agent = AIAgent.from({
  guideRails: [financial],
});
```

## 创建 AIGNE 实例

AIGNE 实例封装了智能体交互发生的整体上下文，支持各种模型的处理。本节展示了如何使用特定模型（如 OpenAIChatModel）初始化 AIGNE 对象，为复杂的智能体系统交互奠定基础，通过不同的处理算法实现。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-aigne"
const aigne = new AIGNE({ model: new OpenAIChatModel() });
assert(aigne.model);
```

## 使用 GuideRails 调用 Agent

本节说明了如何使用关联的 GuideRails 调用智能体，展示了一种控制机制，其中智能体对用户查询的响应通过 GuideRails 的逻辑进行过滤。这种调用场景对于保持智能体行为与预定义约束一致至关重要，确保行为导轨在必要时有效地覆盖或更改流程。这对于维护业务规则或合规约束定义的操作边界至关重要。

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-invoke"
spyOn(aigne.model, "process")
  .mockReturnValueOnce(
    Promise.resolve({
      text: "Bitcoin 将可能在下个月根据当前市场趋势达到 100,000 美元。",
    }),
  )
  .mockReturnValueOnce(
    Promise.resolve({
      json: {
        abort: true,
        reason:
          "我不能提供加密货币价格预测，因为它们是投机性的且可能误导。",
      },
    }),
  );
const result = await aigne.invoke(agent, "下个月比特币的价格是多少？");
console.log(result);
```

本文详细描述了 GuideRail Agent 的创建和集成，强调了它们在验证和控制智能体系统中的信息流的作用。通过构建金融特定的智能体，将其集成到更广泛的框架中，以及分析调用过程，开发人员可以确保智能体严格遵守合规性和数据完整性标准。未来的工作可能涉及探索扩展的规则集和更复杂的交互场景，以增强系统的稳健性。
</markdown>