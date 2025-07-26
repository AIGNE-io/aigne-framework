# Topic-Based Agent Communication

Build reactive multi-agent systems with publish-subscribe messaging patterns.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

// Order processing coordinator
const orderCoordinator = AIAgent.from({
  name: "order_coordinator",
  instructions: "Coordinate order processing workflow",
  subscribe: ["new_orders"],
  publish: ["inventory_check", "payment_process"],
  inputKey: "order",
});

// Inventory management agent
const inventoryAgent = AIAgent.from({
  name: "inventory_manager",
  instructions: "Check inventory and reserve items",
  subscribe: ["inventory_check"],
  publish: (output) => {
    // Dynamic topic based on inventory status
    return output.available ? ["inventory_confirmed"] : ["inventory_insufficient"];
  },
  inputKey: "items",
});

// Payment processing agent
const paymentAgent = AIAgent.from({
  name: "payment_processor",
  instructions: "Process payment securely",
  subscribe: ["payment_process", "inventory_confirmed"],
  publish: ["payment_completed", "order_fulfilled"],
  inputKey: "payment",
});

// Notification agent (listens to everything)
const notificationAgent = AIAgent.from({
  name: "notification_service",
  instructions: "Send notifications based on order events",
  subscribe: ["order_fulfilled", "inventory_insufficient", "payment_completed"],
  publish: ["email_sent", "sms_sent"],
  inputKey: "event",
});

// Error handling agent
const errorHandler = AIAgent.from({
  name: "error_handler",
  instructions: "Handle and recover from errors in the order process",
  subscribe: ["payment_failed", "inventory_error"],
  publish: ["error_resolved", "manual_review_needed"],
  inputKey: "error",
});

// Attach all agents to the context
const agents = [
  orderCoordinator,
  inventoryAgent,
  paymentAgent,
  notificationAgent,
  errorHandler
];

agents.forEach(agent => agent.attach(aigne));

// Simulate order processing
async function processOrder(orderData) {
  console.log("📦 Processing new order...");

  // Publish to start the workflow
  aigne.publish("new_orders", {
    role: "system",
    source: "api",
    message: orderData
  });

  // The agents will automatically communicate through topics:
  // 1. orderCoordinator receives "new_orders"
  // 2. Publishes to "inventory_check" and "payment_process"
  // 3. inventoryAgent processes and publishes result
  // 4. paymentAgent waits for both events before processing
  // 5. notificationAgent sends updates throughout
  // 6. errorHandler manages any failures
}

// Example order
await processOrder({
  orderId: "ORD-12345",
  items: [
    { sku: "WIDGET-001", quantity: 2 },
    { sku: "GADGET-002", quantity: 1 }
  ],
  customer: {
    id: "CUST-789",
    email: "customer@example.com"
  },
  payment: {
    method: "credit_card",
    amount: 99.99
  }
});
```

## Twitter Post #1

📡 Reactive AI architecture with AIGNE!

Topic-based messaging:
📨 Publish/subscribe patterns 🔄 Event-driven workflows 🔗 Loose coupling 🎯 Dynamic routing

Build scalable multi-agent systems that react to events automatically!

#AIGNE #ArcBlock #Communication

## Twitter Post #2

This example shows topic-based agent communication:

• Agents subscribe to specific topics
• Dynamic publishing based on results
• Complex workflow coordination
• Perfect for microservice architectures

Topic-based AI made simple! 📡

## Twitter Post #3

📖 https://www.arcblock.io/docs/aigne-framework

#AIGNE #ArcBlock #Communication
