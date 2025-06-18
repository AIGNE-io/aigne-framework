import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, AIGNE, guideRailAgentOptions } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

test("Example GuideRailAgent: basic", async () => {
  // #region example-guide-rail-agent-basic

  // #region example-guide-rail-agent-basic-create-guide-rail
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
  // #endregion example-guide-rail-agent-basic-create-guide-rail

  // #region example-guide-rail-agent-basic-create-agent
  const agent = AIAgent.from({
    guideRails: [financial],
    inputKey: "message",
  });
  // #endregion example-guide-rail-agent-basic-create-agent

  // #region example-guide-rail-agent-basic-create-aigne
  const aigne = new AIGNE({ model: new OpenAIChatModel() });
  assert(aigne.model);
  // #endregion example-guide-rail-agent-basic-create-aigne

  // #region example-guide-rail-agent-basic-invoke
  spyOn(aigne.model, "process")
    .mockReturnValueOnce(
      Promise.resolve({
        text: "Bitcoin will likely reach $100,000 by next month based on current market trends.",
      }),
    )
    .mockReturnValueOnce(
      Promise.resolve({
        json: {
          abort: true,
          reason:
            "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
        },
      }),
    );
  const result = await aigne.invoke(agent, {
    message: "What will be the price of Bitcoin next month?",
  });
  console.log(result);
  // Output:
  // {
  //   "$status": "GuideRailError",
  //   "message": "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading."
  // }
  expect(result).toEqual({
    $status: "GuideRailError",
    message:
      "I cannot provide cryptocurrency price predictions as they are speculative and potentially misleading.",
  });
  // #endregion example-guide-rail-agent-basic-invoke

  // #endregion example-agent-guide-rail-agent-basic
});
