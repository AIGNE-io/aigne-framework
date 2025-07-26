# Event-Driven Agent Communication

Create reactive AI systems where agents communicate through events and message passing.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const coordinator = AIAgent.from({
  name: "coordinator",
  instructions: "Coordinate team tasks",
  subscribe: ["task_requests"],
  publish: "task_assignments",
  inputKey: "message",
});

const worker = AIAgent.from({
  name: "worker",
  instructions: "Execute assigned tasks",
  subscribe: ["task_assignments"],
  publish: "task_completed",
  inputKey: "task",
});

// Example usage
const result = await aigne.invoke(coordinator, { message: "Process user registration" });
```

## Twitter Post #1

📡 Event-driven AI architecture with AIGNE!

Build reactive systems where agents:
📥 Subscribe to events 📤 Publish results 🔄 Coordinate automatically ⚡ Scale dynamically

Microservices pattern for AI agents!

#AIGNE #ArcBlock #Events

## Twitter Post #2

This example shows event-driven agent communication:

• Agents subscribe to specific events
• Publish results to trigger other agents
• Loose coupling for scalable systems
• Perfect for reactive architectures

Event-driven AI made simple! 📡

## Twitter Post #3

⭐ https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #Events
