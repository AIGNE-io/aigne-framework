# GuideRailAgent

[English](./guide-rail-agent.md) | [中文](./guide-rail-agent.zh.md)

## Overview

GuideRailAgent is a special agent type in the AIGNE framework that is used to validate, filter, and control the input and output of other agents. GuideRailAgent can be viewed as a "guardian" or "reviewer" that can check whether an agent's responses comply with specific rules or policies, and block non-compliant responses when necessary. This mechanism is crucial for building safe and compliant AI applications, preventing agents from generating harmful, inaccurate, or inappropriate content. Through GuideRailAgent, developers can implement various control mechanisms such as content moderation, fact-checking, format validation, etc., ensuring that AI system outputs meet expected standards.

## Basic Usage

### Creating GuideRailAgent

The method to create a GuideRailAgent is to use the AIAgent.from() method and pass guideRailAgentOptions as the base configuration:

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-guide-rail"
import { AIAgent, guideRailAgentOptions } from "@aigne/core";

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

In the above example, we created a financial domain GuideRailAgent whose task is to ensure that the agent does not provide cryptocurrency price predictions. The instructions contain two placeholders:

* `{{input}}`: Will be replaced with the user's input
* `{{output}}`: Will be replaced with the agent's output

The GuideRailAgent will evaluate whether the agent's output complies with the rules based on these instructions and decide whether to allow that output to pass to the user.

### Applying GuideRailAgent to an Agent

After creating a GuideRailAgent, we need to apply it to the agent that needs protection:

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-agent"
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  guideRails: [financial],
  inputKey: "message",
});
```

In this example, we created a new AIAgent and applied the previously created financial GuideRailAgent to this agent through the guideRails parameter. An agent can apply multiple GuideRailAgents, which will be executed sequentially in the order they were added.

### Creating AIGNE Instance

Next, we create an AIGNE instance to execute the agent:

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-create-aigne"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({ model: new OpenAIChatModel() });
```

In this example, we created an AIGNE instance and specified OpenAIChatModel as the language model.

### Invoking an Agent with Applied GuideRailAgent

Now, we can invoke the agent with the applied GuideRailAgent and observe its behavior:

```ts file="../../docs-examples/test/concepts/guide-rail-agent.test.ts" region="example-guide-rail-agent-basic-invoke"
const result = await aigne.invoke(agent, {
  message: "What will be the price of Bitcoin next month?",
});
console.log(result);
// Output:
// {
//   "$status": "GuideRailError",
//   "message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
// }
```

In this example, the user asked about Bitcoin's price next month. Since our GuideRailAgent is configured to block cryptocurrency price predictions, it detected that the agent's response violated this rule, so it blocked the original response and returned an error message with `$status: "GuideRailError"`, explaining why such predictions cannot be provided.

## How GuideRailAgent Works

The workflow of GuideRailAgent is as follows:

1. User sends a request to the agent
2. Agent generates a response
3. Before the response is returned to the user, GuideRailAgent checks this response
4. If the response complies with the rules, GuideRailAgent allows it to pass to the user
5. If the response violates the rules, GuideRailAgent blocks it and returns an explanatory error message

GuideRailAgent blocks non-compliant responses by returning an object containing `abort: true` and `reason` fields. This object is converted to an error response with `$status: "GuideRailError"` and `$message` fields returned to the user.

## Use Cases

GuideRailAgent is suitable for various scenarios, including:

1. **Content Moderation**: Prevent generation of harmful, offensive, or inappropriate content
2. **Fact Checking**: Verify whether information provided by agents is accurate
3. **Format Validation**: Ensure agent outputs conform to specific format requirements
4. **Compliance Checking**: Ensure agent responses comply with legal, ethical, or organizational policies
5. **Sensitive Information Filtering**: Prevent leakage of personally identifiable information, passwords, and other sensitive data
6. **Domain-Specific Rules**: Implement domain-specific rules such as financial advice restrictions, medical information accuracy, etc.

## Summary

GuideRailAgent is a powerful tool in the AIGNE framework that provides necessary safety guarantees and quality control mechanisms for AI systems:

1. **Safety Assurance**: Prevent generation of harmful, offensive, or inappropriate content
2. **Quality Control**: Ensure agent outputs meet specific quality standards
3. **Compliance**: Help AI systems comply with legal, ethical, and organizational policies
4. **Flexibility**: Support creation of custom validation and control rules
5. **Composability**: Allow combination of multiple GuideRailAgents to achieve multi-level control

Through GuideRailAgent, developers can build safer and more reliable AI applications, reducing risks and negative impacts that AI systems might bring. Whether for simple content filtering or complex multi-level validation, GuideRailAgent provides a flexible and powerful solution.
