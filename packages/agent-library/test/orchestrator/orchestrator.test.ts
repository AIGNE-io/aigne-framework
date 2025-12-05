import { expect, spyOn, test } from "bun:test";
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import type { PlannerOutput } from "@aigne/agent-library/orchestrator/type.js";
import { AIGNE, PromptBuilder } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

test("AIAgent.invoke", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const agent = OrchestratorAgent.from({
    objective: PromptBuilder.from("Research ArcBlock and write a professional report"),
    inputKey: "message",
  });

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve<{ json: PlannerOutput }>({
        json: {
          nextTask: 'Use the "finder" skill to research ArcBlock blockchain platform',
          finished: false,
        },
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ text: "ArcBlock is a blockchain platform" }))
    .mockReturnValueOnce(Promise.resolve<{ json: PlannerOutput }>({ json: { finished: true } }))
    .mockReturnValueOnce(Promise.resolve({ text: "Task finished" }));

  const result = await aigne.invoke(agent, {
    message: "Deep research ArcBlock and write a professional report",
  });

  expect(result).toEqual({ message: "Task finished" });
});
