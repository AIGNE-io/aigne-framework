<markdown>
# GuideRail Agent: Validation and Control in Agent Systems

GuideRail agents function as integral components in agent systems, offering validation, transformation, and control over message flows between agents. Designed to enforce rules and ensure adherence to predefined constraints, they are particularly useful in scenarios demanding strict compliance and data integrity. Typical use cases include financial environments where accuracy and ethical operations are paramount.

## Creating a Financial GuideRailAgent

GuideRail agents serve as validators, transformers, or controllers within an agent system, specifically designed to enforce rules and ensure that messages between agents adhere to predefined constraints. This section demonstrates how to create a specialized GuideRailAgent as a financial assistant that prohibits providing speculative cryptocurrency price predictions. Such GuideRails are instrumental in environments where compliance and data integrity are crucial, ensuring that agents operate under well-defined behavioral constraints.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-guide-rail"
const financial = AIAgent.from({
  ...guideRailAgentOptions,
  instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
});
```

## Integrating GuideRails into an Agent

This section demonstrates integrating GuideRailAgents into an existing agent framework. By associating GuideRails with agents, developers can impose additional layers of control and validation over message flows. This is particularly useful for establishing a hierarchy of rules that an agent must follow, thereby preventing erroneous outputs and enhancing overall system robustness.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-agent"
const agent = AIAgent.from({
  guideRails: [financial],
});
```

## Creating the AIGNE Instance

The AIGNE instance encapsulates the overall context in which agent interactions occur, supporting various models for processing. This section showcases initializing an AIGNE object with a specific model, like OpenAIChatModel, setting the stage for sophisticated agent-system interactions, enabled by different processing algorithms.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-aigne"
const aigne = new AIGNE({ model: new OpenAIChatModel() });
assert(aigne.model);
```

## Invoking the Agent with GuideRails

This section illustrates the process of invoking an agent with associated GuideRails, exemplifying a control mechanism where the agent's response to a user query is filtered through the GuideRail's logic. Such invocation scenarios are critical for maintaining agent behavior inline with predefined constraints, ensuring that guide rails effectively override or alter the flow when necessary. This is vital for upholding operational boundaries defined by business rules or compliance constraints.

```ts file="/Users/chao/Projects/blocklet/aigne-framework/docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-invoke"
spyOn(aigne.model, "process")
  .mockReturnValueOnce(
    Promise.resolve({
      text: "Bitcoin will likely reach $100,000 by next month based on current market trends.",
    }),
  )
  .mockReturnValueOnce(
    Promise.resolve({
      json: {
        abort: true,
        reason:
          "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
      },
    }),
  );
const result = await aigne.invoke(agent, "What will be the price of Bitcoin next month?");
console.log(result);
```

This document has detailed the creation and integration of GuideRail agents, emphasizing their role in validating and controlling message flows within agent systems. By constructing financial-specific agents, integrating them within a broader framework, and analyzing invocation processes, developers can ensure that agents adhere strictly to compliance and data integrity norms. Future work may involve exploring expanded rule sets and more complex interaction scenarios for enhanced system robustness.
</markdown>