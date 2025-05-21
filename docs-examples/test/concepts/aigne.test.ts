import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, AIGNE } from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";

test("Example AIGNE: basic", async () => {
  // #region example-aigne-basic

  // #region example-aigne-basic-create-aigne
  const aigne = new AIGNE({
    model: new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    }),
  });
  assert(aigne.model);
  // #endregion example-aigne-basic-create-aigne

  // #region example-aigne-basic-add-agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant",
  });

  aigne.addAgent(agent);
  // #endregion example-aigne-basic-add-agent

  // #region example-aigne-basic-invoke-agent
  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "AIGNE is a platform for building AI agents.",
  });
  const result = await aigne.invoke(agent, "What is AIGNE?");
  console.log(result);
  // Output: { $message: "AIGNE is a platform for building AI agents." }
  expect(result).toEqual({ $message: "AIGNE is a platform for building AI agents." });
  // #endregion example-aigne-basic-invoke-agent

  // #region example-aigne-basic-invoke-agent-streaming
  spyOn(aigne.model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("AIGNE is a platform for building AI agents."),
  );
  const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });
  let response = "";
  for await (const chunk of stream) {
    if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
  }
  console.log(response);
  // Output:  "AIGNE is a platform for building AI agents."
  expect(response).toEqual("AIGNE is a platform for building AI agents.");
  // #endregion example-aigne-basic-invoke-agent-streaming

  // #region example-aigne-basic-invoke-agent-user-agent
  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "AIGNE is a platform for building AI agents.",
  });
  const userAgent = aigne.invoke(agent);
  const result1 = await userAgent.invoke("What is AIGNE?");
  console.log(result1);
  // Output: { $message: "AIGNE is a platform for building AI agents." }
  expect(result1).toEqual({ $message: "AIGNE is a platform for building AI agents." });
  // #endregion example-aigne-basic-invoke-agent-user-agent

  // #region example-aigne-basic-shutdown
  await aigne.shutdown();
  // #endregion example-aigne-basic-shutdown

  // #endregion example-aigne-basic
});

test("Example AIGNE: load", async () => {
  // #region example-aigne-load

  const path = join(import.meta.dirname, "../../test-aigne"); // "/PATH/TO/AIGNE_PROJECT";

  const aigne = await AIGNE.load(path, { models: [OpenAIChatModel] });

  assert(aigne.model);
  expect(aigne.model).toBeInstanceOf(OpenAIChatModel);

  // #endregion example-aigne-load
});
