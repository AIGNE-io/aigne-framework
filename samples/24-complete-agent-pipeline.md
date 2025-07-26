# Complete Agent Pipeline

Build end-to-end AI processing pipelines with input validation, analysis, and response generation.

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { DefaultMemory } from "@aigne/agent-library/default-memory";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const inputProcessor = AIAgent.from({
  instructions: "Clean and validate input: {{input}}",
  outputKey: "cleaned_input"
});

const analyzer = AIAgent.from({
  instructions: "Analyze: {{cleaned_input}}",
  outputKey: "analysis"
});

const responder = AIAgent.from({
  instructions: "Generate response based on: {{analysis}}",
  outputKey: "response"
});

const pipeline = TeamAgent.from({
  name: "complete_pipeline",
  skills: [inputProcessor, analyzer, responder],
  mode: ProcessMode.sequential,
  memory: new DefaultMemory(),
  inputKey: "input",
});

const result = await aigne.invoke(pipeline, {
  input: "What are the benefits of renewable energy?"
});
```

## Twitter Post #1

🏗️ Complete AI pipeline with AIGNE!

Input → Validation → Analysis → Response

✅ Multi-stage processing
✅ Memory integration
✅ Error handling
✅ Production ready

From raw input to polished output! 🚀

#AIGNE #ArcBlock #Pipeline

## Twitter Post #2

This example shows complete AI processing pipeline:

• Multiple processing stages with TeamAgent
• Sequential processing with validation
• Memory integration for context
• End-to-end workflow automation

Which type of AI pipeline would you build first? 🤔

## Twitter Post #3

📖 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #Pipeline
