import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

test("Example what is aigne: basic", async () => {
  // #region example-what-is-aigne-basic

  const agent = AIAgent.from({
    model: new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    }),
    instructions: "You are a helpful assistant",
    inputKey: "message",
  });

  assert(agent.model);
  spyOn(agent.model, "process").mockReturnValueOnce({
    text: "AIGNE is a platform for building AI agents.",
  });

  const result = await agent.invoke({ message: "What is AIGNE?" });
  console.log(result);
  // Output: { message: "AIGNE is a platform for building AI agents." }
  expect(result).toEqual({ message: "AIGNE is a platform for building AI agents." });

  // #endregion example-what-is-aigne-basic
});
