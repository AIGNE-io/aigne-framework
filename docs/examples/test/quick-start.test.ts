import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, FunctionAgent, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

test("Example quick start", async () => {
  // #region example-quick-start

  const agent = AIAgent.from({
    model: new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    }),
    instructions: "You are a helpful assistant",
  });

  assert(agent.model);
  spyOn(agent.model, "process").mockReturnValueOnce({
    text: "Aigne is a platform for building AI agents.",
  });

  const result = await agent.invoke("What is Aigne?");

  expect(result).toEqual({ $message: "Aigne is a platform for building AI agents." });

  console.log(result);
  // Output: { $message: "Aigne is a platform for building AI agents." }

  // #endregion example-quick-start
});

test("Example quick start with skills", async () => {
  // #region example-quick-start-with-skills

  const ccxt = await MCPAgent.from({
    command: "npx",
    args: ["-y", "@mcpfun/mcp-server-ccxt"],
  });

  const agent = AIAgent.from({
    model: new OpenAIChatModel(),
    instructions: "You are a helpful assistant",
    skills: [ccxt],
  });

  assert(agent.model);
  spyOn(agent.model, "process").mockReturnValueOnce({
    text: "The current price of ABT/USD on Coinbase is $0.9684.",
  });

  const result = await agent.invoke("What is the crypto price of ABT/USD in coinbase?");

  expect(result).toEqual({ $message: "The current price of ABT/USD on Coinbase is $0.9684." });

  console.log(result);
  // Output: { $message:"The current price of ABT/USD on Coinbase is $0.9684." }

  // #endregion example-quick-start-with-skills
});

test("Example quick start with memory", async () => {
  // #region example-quick-start-with-memory

  const agent = AIAgent.from({
    model: new OpenAIChatModel(),
    instructions: "You are a helpful assistant",
    memory: true,
  });

  assert(agent.model);
  spyOn(agent.model, "process")
    .mockReturnValueOnce({
      text: "Nice to meet you, John Doe! Football is a great sport. Do you play on a team or just for fun? What position do you enjoy playing the most?",
    })
    .mockReturnValueOnce({
      text: "Your favorite sport is football.",
    })
    .mockReturnValueOnce({
      text: "Got it, your favorite color is blue! If there's anything else you'd like to share or ask, feel free!",
    })
    .mockReturnValueOnce({
      text: "Your favorite color is blue!",
    });

  const result1 = await agent.invoke("My name is John Doe and I like to play football.");
  console.log(result1);
  // Output: { $message: "Nice to meet you, John Doe! Football is a great sport. Do you play on a team or just for fun? What position do you enjoy playing the most?" }
  expect(result1).toEqual({
    $message:
      "Nice to meet you, John Doe! Football is a great sport. Do you play on a team or just for fun? What position do you enjoy playing the most?",
  });

  const result2 = await agent.invoke("What is my favorite sport?");
  console.log(result2);
  // Output: { $message: "Your favorite sport is football." }
  expect(result2).toEqual({ $message: "Your favorite sport is football." });

  const result3 = await agent.invoke("My favorite color is blue.");
  console.log(result3);
  // Output: { $message: "Got it, your favorite color is blue! If there's anything else you'd like to share or ask, feel free!" }
  expect(result3).toEqual({
    $message:
      "Got it, your favorite color is blue! If there's anything else you'd like to share or ask, feel free!",
  });

  const result4 = await agent.invoke("What is my favorite color?");
  console.log(result4);
  // Output: { $message: "Your favorite color is blue!" }
  expect(result4).toEqual({ $message: "Your favorite color is blue!" });

  // #endregion example-quick-start-with-memory
});

test("Example quick start with function", async () => {
  // #region example-quick-start-with-function

  const plus = FunctionAgent.from({
    name: "plus",
    inputSchema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
    outputSchema: z.object({
      sum: z.number().describe("Sum of the two numbers"),
    }),
    process({ a, b }) {
      return { sum: a + b };
    },
  });

  const result = await plus.invoke({ a: 1, b: 2 });
  console.log(result);
  // Output: { sum: 3 }

  expect(result).toEqual({ sum: 3 });

  // #endregion example-quick-start-with-function
});

test("Example quick start with function skill", async () => {
  // #region example-quick-start-with-function-skill

  const calculator = FunctionAgent.from({
    name: "calculator",
    description: "A simple calculator",
    inputSchema: z.object({
      operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("Operation to perform"),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
    outputSchema: z.object({
      result: z.number().describe("Result of the operation"),
    }),
    process({ operation, a, b }) {
      switch (operation) {
        case "add":
          return { result: a + b };
        case "subtract":
          return { result: a - b };
        case "multiply":
          return { result: a * b };
        case "divide":
          return { result: a / b };
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    },
  });

  const agent = AIAgent.from({
    model: new OpenAIChatModel(),
    instructions: "You are a helpful assistant",
    skills: [calculator],
  });

  assert(agent.model);
  spyOn(agent.model, "process")
    .mockReturnValueOnce({
      toolCalls: [
        {
          id: "1",
          type: "function",
          function: { name: "calculator", arguments: { operation: "add", a: 1, b: 2 } },
        },
      ],
    })
    .mockReturnValueOnce({ text: "The result is 3." });

  const result = await agent.invoke("What is 1 + 2?");
  console.log(result);
  // Output: { $message: "The result is 3." }

  expect(result).toEqual({ $message: "The result is 3." });

  // #endregion example-quick-start-with-function-skill
});
