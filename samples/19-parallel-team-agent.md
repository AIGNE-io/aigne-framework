# Parallel Team Agent

Run multiple AI agents simultaneously for faster processing and diverse perspectives.

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const featureExtractor = AIAgent.from({
  instructions: "Extract product features",
  outputKey: "features"
});

const audienceAnalyzer = AIAgent.from({
  instructions: "Identify target audience",
  outputKey: "audience"
});

const team = TeamAgent.from({
  name: "product_analysis",
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel,
  inputKey: "message",
});

const result = await aigne.invoke(team, { message: "Analyze our new smartphone product" });
```

## Twitter Post #1

⚡ Speed up AI processing with AIGNE's Parallel Team Agents!

Instead of waiting for sequential processing, run multiple agents simultaneously:

⏱️ Faster results
🎯 Multiple perspectives
🔄 Efficient resource use

Parallel processing = parallel productivity! 🚀

What would you process in parallel? 🤔

#AIGNE #ArcBlock #TeamWork

## Twitter Post #2

This example shows parallel AI team processing:

• Create multiple specialized agents
• Use TeamAgent with ProcessMode.parallel
• All agents run simultaneously
• Combine results for comprehensive analysis

Parallel processing made simple! ⚡

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #TeamWork
