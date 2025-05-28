import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import {
  AIAgent,
  AIGNE,
  Agent,
  type AgentInvokeOptions,
  type AgentProcessResult,
  FunctionAgent,
  type Message,
  guideRailAgentOptions,
} from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { OpenAIChatModel } from "@aigne/openai";
import { ZodObject, z } from "zod";

test("Example Agent: basic info", async () => {
  // #region example-agent-basic-info
  const chatbot = AIAgent.from({
    name: "chatbot",
    description: "A chatbot that answers questions.",
  });

  expect(chatbot.name).toEqual("chatbot");
  expect(chatbot.description).toEqual("A chatbot that answers questions.");
  // #endregion example-agent-basic-info
});

test("Example Agent: basic input/output schema", async () => {
  // #region example-agent-input-output-schema
  const textAnalyzer = AIAgent.from({
    inputSchema: z.object({
      text: z.string().describe("The text content to analyze"),
    }),
    outputSchema: z.object({
      summary: z.string().describe("A concise summary of the text"),
      points: z.array(z.string()).describe("List of important points from the text"),
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Overall sentiment of the text"),
    }),
  });

  expect(textAnalyzer.inputSchema).toBeInstanceOf(ZodObject);
  expect(textAnalyzer.outputSchema).toBeInstanceOf(ZodObject);
  // #endregion example-agent-input-output-schema

  // #region example-agent-input-output-schema-invoke
  spyOn(textAnalyzer, "process").mockImplementationOnce(async function* () {
    yield {
      delta: {
        json: {
          summary: "AIGNE is a framework for building AI agents.",
          points: ["AIGNE", "framework", "AI agents"],
          sentiment: "positive",
        },
      },
    };
  });

  const result = await textAnalyzer.invoke({ text: "The new AIGNE framework offers ..." });
  console.log(result);
  // Output: { summary: "AIGNE is a framework for building AI agents.", points: ["AIGNE", "framework", "AI agents"], sentiment: "positive" }
  expect(result).toEqual({
    summary: "AIGNE is a framework for building AI agents.",
    points: ["AIGNE", "framework", "AI agents"],
    sentiment: "positive",
  });
  // #endregion example-agent-input-output-schema-invoke
});

test("Example Agent: hooks", async () => {
  // #region example-agent-hooks

  const agent = AIAgent.from({
    hooks: {
      onStart(event) {
        console.log("Agent started:", event.input);
      },
      onEnd(event) {
        if (event.error) {
          console.error("Agent ended with error:", event.error);
        } else {
          console.log("Agent ended:", event.output);
        }
      },
      onSkillStart(event) {
        console.log("Skill started:", event.skill, event.input);
      },
      onSkillEnd(event) {
        if (event.error) {
          console.error("Skill ended with error:", event.error);
        } else {
          console.log("Skill ended:", event.output);
        }
      },
      onHandoff(event) {
        console.log("Handoff event:", event.source, event.target);
      },
    },
  });

  expect(agent.hooks).toBeDefined();

  // #endregion example-agent-hooks
});

test("Example Agent: guide rails", async () => {
  // #region example-agent-guide-rails

  const aigne = new AIGNE({ model: new OpenAIChatModel() });
  assert(aigne.model);

  // #region example-agent-guide-rails-create-guide-rail
  const financial = AIAgent.from({
    ...guideRailAgentOptions,
    instructions: `You are a financial assistant. You must ensure that you do not provide cryptocurrency price predictions or forecasts.
<user-input>
{{input}}
</user-input>

<agent-output>
{{output}}
</agent-output>
`,
  });
  // #endregion example-agent-guide-rails-create-guide-rail

  // #region example-agent-guide-rails-create-agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant that provides financial advice.",
    guideRails: [financial],
  });
  // #endregion example-agent-guide-rails-create-agent

  // #region example-agent-guide-rails-invoke
  spyOn(aigne.model, "process")
    .mockReturnValueOnce({
      text: "Bitcoin will likely reach $100,000 by next month based on current market trends.",
    })
    .mockReturnValueOnce({
      json: {
        abort: true,
        reason:
          "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
      },
    });

  const result = await aigne.invoke(agent, "What will be the price of Bitcoin next month?");
  console.log(result);
  // Output:
  // {
  //   "$message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
  // }
  expect(result).toEqual(
    expect.objectContaining({
      $message:
        "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
    }),
  );
  // #endregion example-agent-guide-rails-invoke

  // #endregion example-agent-guide-rails
});

test("Example Agent: enable memory for agent", async () => {
  // #region example-agent-enable-memory

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });
  assert(aigne.model);

  // #region example-agent-enable-memory-for-agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market analysis",
    memory: new DefaultMemory(),
  });
  // #endregion example-agent-enable-memory-for-agent

  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "Your favorite cryptocurrency is Bitcoin.",
  });

  // #region example-agent-enable-memory-invoke-1
  const result2 = await aigne.invoke(agent, "What is my favorite cryptocurrency?");
  console.log(result2);
  // Output: { $message: "Your favorite cryptocurrency is Bitcoin." }
  expect(result2).toEqual({ $message: "Your favorite cryptocurrency is Bitcoin." });
  // #endregion example-agent-enable-memory-invoke-1

  // #endregion example-agent-enable-memory
});

test("Example Agent: skills", async () => {
  // #region example-agent-skills

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
  });
  assert(aigne.model);

  // #region example-agent-add-skills
  const getCryptoPrice = FunctionAgent.from({
    name: "get_crypto_price",
    description: "Get the current price of a cryptocurrency.",
    inputSchema: z.object({
      symbol: z.string().describe("The symbol of the cryptocurrency"),
    }),
    outputSchema: z.object({
      price: z.number().describe("The current price of the cryptocurrency"),
    }),
    process: async ({ symbol }) => {
      console.log(`Fetching price for ${symbol}`);
      return {
        price: 1000, // Mocked price
      };
    },
  });

  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market analysis",
    skills: [getCryptoPrice],
  });
  // #endregion example-agent-add-skills

  spyOn(aigne.model, "process").mockReturnValueOnce({ text: "ABT is currently priced at $1000." });

  const result = await aigne.invoke(agent, "What is the price of ABT?");
  console.log(result);
  // Output: { $message: "ABT is currently priced at $1000." }
  expect(result).toEqual({ $message: "ABT is currently priced at $1000." });

  // #endregion example-agent-skills
});

test("Example Agent: invoke", async () => {
  const agent = AIAgent.from({
    model: new OpenAIChatModel(),
    instructions: "You are a helpful assistant for Crypto market analysis",
  });
  assert(agent.model);

  // #region example-agent-invoke
  spyOn(agent.model, "process").mockReturnValueOnce({
    text: "ABT is currently priced at $1000.",
  });

  const result = await agent.invoke("What is the price of ABT?");
  console.log(result);
  // Output: { $message: "ABT is currently priced at $1000." }
  expect(result).toEqual({ $message: "ABT is currently priced at $1000." });
  // #endregion example-agent-invoke

  // #region example-agent-invoke-stream
  spyOn(agent.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("ABT is currently priced at $1000."),
  );

  const stream = await agent.invoke("What is the price of ABT?", { streaming: true });
  let response = "";
  for await (const chunk of stream) {
    if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
  }
  console.log(response);
  // Output:  "ABT is currently priced at $1000."
  expect(response).toEqual("ABT is currently priced at $1000.");
  // #endregion example-agent-invoke-stream
});

test("Example Agent: custom agent", async () => {
  // #region example-agent-custom-process

  class CustomAgent extends Agent {
    override process(
      input: Message,
      _options: AgentInvokeOptions,
    ): PromiseOrValue<AgentProcessResult<Message>> {
      console.log("Custom agent processing input:", input);
      return {
        $message: "AIGNE is a platform for building AI agents.",
      };
    }
  }

  const agent = new CustomAgent();

  const result = await agent.invoke("What is the price of ABT?");
  console.log(result);
  // Output: { $message: "AIGNE is a platform for building AI agents." }
  expect(result).toEqual({ $message: "AIGNE is a platform for building AI agents." });
  // #endregion example-agent-custom-process
});

test("Example Agent: shutdown", async () => {
  // #region example-agent-shutdown
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market analysis",
  });

  await agent.shutdown();
  // #endregion example-agent-shutdown
});

test("Example Agent: shutdown by using", async () => {
  // #region example-agent-shutdown-by-using
  await using agent = AIAgent.from({
    instructions: "You are a helpful assistant for Crypto market analysis",
  });

  expect(agent).toBeInstanceOf(AIAgent);
  // #endregion example-agent-shutdown-by-using
});
