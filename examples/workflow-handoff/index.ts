#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { type Agent, AIAgent, FunctionAgent } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory";
import { z } from "zod";

const execute_order_tool = FunctionAgent.from({
  name: "execute_order",
  description: "Price should be in USD.",
  inputSchema: z.object({
    product: z.string(),
    price: z.number(),
  }),
  process: ({ product, price }: { product: string; price: number }) => {
    console.log("\n\n=== Order Summary ===");
    console.log(`Product: ${product}`);
    console.log(`Price: $${price}`);
    console.log("=================\n");
    const confirm = "y";
    if (confirm === "y") {
      console.log("Order execution successful!");
      return { result: "Success" };
    }
    console.log("Order cancelled!");
    return { result: "User cancelled order." };
  },
});

const look_up_item_tool = FunctionAgent.from({
  name: "look_up_item",
  description: "Use to find item ID.\nSearch query can be a description or keywords.",
  inputSchema: z.object({
    search_query: z.string(),
  }),
  process: ({ search_query }: { search_query: string }) => {
    const item_id = "item_132612938";
    console.log(`Found item for: ${search_query}`, item_id);
    return { item_id };
  },
});

const execute_refund_tool = FunctionAgent.from({
  name: "execute_refund",
  description: "Use to execute a refund.",
  inputSchema: z.object({
    item_id: z.string(),
    reason: z.string().optional(),
  }),
  process: ({ item_id, reason }: { item_id: string; reason?: string }) => {
    console.log("\n\n=== Refund Summary ===");
    console.log(`Item ID: ${item_id}`);
    console.log(`Reason: ${reason ?? "not provided"}`);
    console.log("=================\n");
    console.log("Refund execution successful!");
    return { result: "success" };
  },
});

const transfer_to_issues_and_repairs = FunctionAgent.from({
  name: "transfer_to_issues_and_repairs",
  description: "Use for issues, repairs, or refunds.",
  process: (): Agent => issuesAndRepairs,
});

const transfer_to_sales_agent = FunctionAgent.from({
  name: "transfer_to_sales_agent",
  description: "Use for anything sales or buying related.",
  process: (): Agent => sales,
});

const transfer_back_to_triage = FunctionAgent.from({
  name: "transfer_back_to_triage",
  description:
    "Call this if the user brings up a topic outside of your purview,\nincluding escalating to human.",
  process: (): Agent => triage,
});

const transfer_to_human_manager = FunctionAgent.from({
  name: "transfer_to_human_manager",
  description: "Only call this if explicitly asked to.",
  process: (): Agent => humanAgent,
});

const sales = AIAgent.from({
  name: "sales",
  instructions: `\
You are a sales agent for ACME Inc.
Always answer in a sentence or less.
Follow the following routine with the user:
1. Ask them about any problems in their life related to catching roadrunners.
2. Casually mention one of ACME's crazy made-up products can help.
 - Don't mention price.
3. Once the user is bought in, drop a ridiculous price.
4. Only after everything, and if the user says yes,
tell them a crazy caveat and execute their order.
`,
  skills: [transfer_back_to_triage, execute_order_tool],
  outputKey: "sales",
  memory: new DefaultMemory(),
  inputKey: "message",
});

const issuesAndRepairs = AIAgent.from({
  name: "issuesAndRepairs",
  instructions: `\
You are a customer support agent for ACME Inc.
Always answer in a sentence or less.
Follow the following routine with the user:
1. First, ask probing questions and understand the user's problem deeper.
 - unless the user has already provided a reason.
2. Propose a fix (make one up).
3. ONLY if not satisfied, offer a refund.
4. If accepted, search for the ID and then execute refund.
`,
  skills: [transfer_back_to_triage, execute_refund_tool, look_up_item_tool],
  outputKey: "issuesAndRepairs",
  memory: new DefaultMemory(),
  inputKey: "message",
});

// Assume this is a human agent
const humanAgent = AIAgent.from({
  name: "human_manager",
  instructions: `\
You are a human manager for ACME Inc.
Just chat with the user and help them with their problem.
Only transfer to another agent if user explicitly asks for it.
`,
  skills: [transfer_back_to_triage, transfer_to_sales_agent, transfer_to_issues_and_repairs],
  outputKey: "human",
  memory: new DefaultMemory(),
  inputKey: "message",
});

const triage = AIAgent.from({
  name: "triage",
  instructions: `\
You are a customer service bot for ACME Inc.
Introduce yourself. Always be very brief.
Gather information to direct the customer to the right department.
But make your questions subtle and natural.
`,
  skills: [transfer_to_issues_and_repairs, transfer_to_sales_agent, transfer_to_human_manager],
  outputKey: "triage",
  memory: new DefaultMemory(),
  inputKey: "message",
});

await runWithAIGNE(triage, {
  chatLoopOptions: {
    welcome: `Hello, I'm a customer service bot for ACME Inc. How can I help you today?`,
    defaultQuestion: "I want a refund",
  },
});
