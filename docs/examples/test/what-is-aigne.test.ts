import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

test("Example what is aigne", async () => {
  // #region example-what-is-aigne

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

  // #endregion example-what-is-aigne
});
