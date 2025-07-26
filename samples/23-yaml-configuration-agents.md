# YAML-Based Agent Configuration

Create and configure AI agents using declarative YAML files - perfect for non-developers.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { loadAgentFromYaml } from "@aigne/core/loader";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

// Load agent from YAML configuration
const yamlConfig = `
name: customer_support
description: Customer support chatbot with escalation
instructions: |
  You are a helpful customer support agent.
  Always be polite and professional.
  If you cannot solve the issue, suggest contacting a human agent.

inputKey: message
outputSchema:
  type: object
  properties:
    response:
      type: string
    confidence:
      type: number
    escalate:
      type: boolean
  required: [response, confidence, escalate]

memory:
  type: default
  storage:
    url: "file:customer_support.db"

skills:
  - name: order_lookup
    description: Look up customer order information
    inputSchema:
      type: object
      properties:
        orderId:
          type: string
      required: [orderId]
    process: |
      // Mock order lookup
      return {
        orderId: input.orderId,
        status: "shipped",
        trackingNumber: "1Z999AA1234567890"
      };
`;

// Load agent from YAML
const supportAgent = await loadAgentFromYaml(yamlConfig);

const result = await aigne.invoke(supportAgent, {
  message: "I need help with my order #12345"
});

console.log("Agent response:", result);
// Output: { response: "...", confidence: 0.95, escalate: false }
```

## Twitter Post #1

📄 Configuration-driven AI with AIGNE YAML support!

No-code agent creation:
📝 Declarative YAML configs
✅ Schema validation
🧠 Memory integration
🔧 Skill composition

Perfect for business users and ops teams! 🚀

What would you configure first? 🤔

#AIGNE #ArcBlock #YAML

## Twitter Post #2

This example shows YAML-based agent configuration:

• Define agents in declarative YAML
• Use loadAgentFromYaml() to load configs
• Support for memory, skills, and schemas
• Perfect for non-developers

No-code AI agent creation! 📄

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #YAML
