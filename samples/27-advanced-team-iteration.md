# Advanced Team Agent Iteration

Process collections of data with sophisticated iteration patterns and cumulative enrichment.

```typescript
import { AIAgent, AIGNE, TeamAgent, ProcessMode } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

// Agents for processing customer feedback
const sentimentAgent = AIAgent.from({
  instructions: "Analyze sentiment of customer feedback",
  outputKey: "sentiment",
});

const categoryAgent = AIAgent.from({
  instructions: "Categorize feedback: bug, feature_request, complaint, praise",
  outputKey: "category",
});

const enricherAgent = AIAgent.from({
  instructions: "Enrich analysis with insights from previous feedback: {{previousResults}}",
  outputKey: "insights",
});

// Team that processes feedback collections
const feedbackTeam = TeamAgent.from({
  name: "feedback_processor",
  skills: [sentimentAgent, categoryAgent, enricherAgent],
  mode: ProcessMode.sequential,

  // Process each item in the feedback array
  iterateOn: "feedbackList",

  // Each iteration gets enriched with previous results
  iterateWithPreviousOutput: true,

  inputSchema: z.object({
    feedbackList: z.array(z.object({
      id: z.string(),
      text: z.string(),
      customerType: z.string(),
    }))
  }),
  inputKey: "data",
});

// Sample customer feedback data
const feedbackData = {
  data: {
    feedbackList: [
      {
        id: "1",
        text: "The new UI is confusing and hard to navigate",
        customerType: "premium"
      },
      {
        id: "2",
        text: "Love the recent performance improvements!",
        customerType: "basic"
      },
      {
        id: "3",
        text: "Please add dark mode support",
        customerType: "enterprise"
      },
      {
        id: "4",
        text: "App crashes when uploading large files",
        customerType: "premium"
      }
    ]
  }
};

const results = await aigne.invoke(feedbackTeam, feedbackData);

console.log("Processed feedback with cumulative insights:", results);
// Each feedback item gets richer analysis based on previous items
```

## Twitter Post #1

🔄 Advanced iteration patterns with AIGNE Team Agents!

Powerful processing modes:
📋 Array iteration 📈 Cumulative enrichment 🧠 Previous context awareness 💡 Progressive insights

Perfect for analyzing collections where each item builds on previous learnings!

#AIGNE #ArcBlock #TeamWork

## Twitter Post #2

This example shows advanced team iteration patterns:

• Process arrays with iterateOn parameter
• Use iterateWithPreviousOutput for context
• Each item gets enriched with previous results
• Perfect for cumulative analysis

Advanced iteration made simple! 🔄

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #TeamWork
