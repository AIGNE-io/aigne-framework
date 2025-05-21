import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, AIGNE } from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";

test("Example quick start: basic", async () => {
  // #region example-quick-start-basic

  // #region example-quick-start-create-aigne
  const aigne = new AIGNE({
    model: new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    }),
  });
  assert(aigne.model);
  // #endregion example-quick-start-create-aigne

  // #region example-quick-start-create-agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant",
  });
  // #endregion example-quick-start-create-agent

  // #region example-quick-start-invoke
  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "AIGNE is a platform for building AI agents.",
  });

  const result = await aigne.invoke(agent, "What is AIGNE?");
  console.log(result);
  // Output: { $message: "AIGNE is a platform for building AI agents." }

  expect(result).toEqual({ $message: "AIGNE is a platform for building AI agents." });
  // #endregion example-quick-start-invoke

  // #region example-quick-start-streaming
  spyOn(aigne.model, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([
      { delta: { text: { text: "AIGNE is a platform for building AI agents." } } },
    ]),
  );

  const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });

  let response = "";
  for await (const chunk of stream) {
    console.log(chunk);
    if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
  }
  console.log(response);
  // Output:  "AIGNE is a platform for building AI agents."
  expect(response).toEqual("AIGNE is a platform for building AI agents.");
  // #endregion example-quick-start-streaming

  // #endregion example-quick-start-basic
});
