# Human-in-the-Loop AI Workflow

Create collaborative AI systems where humans and AI agents work together seamlessly.

```typescript
import { AIAgent, AIGNE, UserAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

// AI agent for initial analysis
const analyzerAgent = AIAgent.from({
  name: "analyzer",
  instructions: "Analyze the problem and suggest solutions. If complex, request human review.",
  outputSchema: z.object({
    analysis: z.string(),
    solutions: z.array(z.string()),
    needsHumanReview: z.boolean(),
    confidence: z.number()
  }),
  inputKey: "problem",
});

// Human agent for review and decisions
const humanAgent = UserAgent.from({
  name: "human_reviewer",
  instructions: "Review AI analysis and make final decisions",
  inputKey: "reviewRequest",
});

// Decision agent that routes based on complexity
const routerAgent = AIAgent.from({
  name: "router",
  instructions: `Route requests based on complexity:
  - Simple issues: handle automatically
  - Complex issues: send to human review
  - Critical issues: immediate human escalation`,
  skills: [analyzerAgent, humanAgent],
  inputKey: "request",
});

// Example workflow
const complexProblem = {
  request: "Our production system is experiencing 50% increased latency. Users are complaining about timeouts. This started 2 hours ago after our latest deployment."
};

const result = await aigne.invoke(routerAgent, complexProblem);

// If human review is needed, the UserAgent will:
// 1. Present the AI analysis to the human
// 2. Wait for human input/decision
// 3. Combine human judgment with AI insights
// 4. Return the collaborative solution

console.log("Collaborative solution:", result);
```

## Twitter Post #1

🤝 Perfect human-AI collaboration with AIGNE!

Human-in-the-loop features:
🧠 Smart escalation rules 👥 UserAgent for human input 🔄 Seamless handoffs 💡 Combined AI + human wisdom

AI handles routine, humans handle complex decisions. Best of both worlds!

#AIGNE #ArcBlock #HumanLoop

## Twitter Post #2

This example shows human-AI collaboration workflow:

• AI analyzes and suggests solutions
• UserAgent handles complex decisions
• Smart routing based on complexity
• Seamless handoffs between AI and humans

Perfect collaboration made simple! 🤝

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #HumanLoop
