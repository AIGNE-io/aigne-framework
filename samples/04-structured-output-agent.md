# Structured Output Agent

Get guaranteed structured responses from your AI agents using Zod schemas.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  outputSchema: z.object({
    topic: z.string(),
    summary: z.string(),
    confidence: z.number()
  }),
  instructions: "Analyze the topic and provide structured output",
  inputKey: "message",
});

const result = await aigne.invoke(agent, { message: "What is quantum computing?" });
// {
//   topic: "quantum computing",
//   summary: "Quantum computing is a type of computation that utilizes the principles of quantum mechanics to process information.",
//   confidence: 0.95,
// }
```

## Twitter Post #1

📊 Stop parsing messy AI JSON! AIGNE + Zod = structured data

✅ Guaranteed format
✅ Type-safe
✅ API-ready
✅ No more bugs

Which data format do you need most? 🤔

#AIGNE #ArcBlock #AI

## Twitter Post #2

This example shows structured output with Zod schemas:

• Define schema with z.object()
• Set outputSchema in agent config
• Get guaranteed structured responses
• Full TypeScript type safety

No more JSON parsing errors! 📊

## Twitter Post #3

🐈 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #AI
