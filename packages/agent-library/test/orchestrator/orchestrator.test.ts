import { expect, spyOn, test } from "bun:test";
import {
  type FullPlanOutput,
  getFullPlanSchema,
  OrchestratorAgent,
} from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

test("AIAgent.invoke", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const finder = AIAgent.from({
    name: "finder",
    description: 'Find the closest match to a user"s request',
  });

  const writer = AIAgent.from({
    name: "writer",
    description: "Write to the filesystem",
  });

  const agent = OrchestratorAgent.from({
    skills: [finder, writer],
    inputKey: "message",
  });

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve<{ json: FullPlanOutput }>({
        json: {
          isComplete: false,
          steps: [
            {
              description: "Find the closest match to a user's request",
              tasks: [
                {
                  agent: "finder",
                  description: "Find the closest match to a user's request",
                },
              ],
            },
            {
              description: "Write to the filesystem",
              tasks: [
                {
                  agent: "writer",
                  description: "Write to the filesystem",
                },
              ],
            },
          ],
        },
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ text: "ArcBlock is a blockchain platform" }))
    .mockReturnValueOnce(
      Promise.resolve({ text: "Synthesized: ArcBlock is a blockchain platform" }),
    )
    .mockReturnValueOnce(
      Promise.resolve({ text: "The content has been written to the filesystem" }),
    )
    .mockReturnValueOnce(
      Promise.resolve({ text: "Synthesized: The content has been written to the filesystem" }),
    )
    .mockReturnValueOnce(
      Promise.resolve<{ json: FullPlanOutput }>({
        json: {
          isComplete: true,
          steps: [],
        },
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ text: "Task finished" }));

  const finderCall = spyOn(finder, "invoke");
  const writerCall = spyOn(writer, "invoke");

  const result = await aigne.invoke(agent, {
    message: "Deep research ArcBlock and write a professional report",
  });

  expect(result).toEqual({ message: "Task finished" });
  expect(finderCall).toHaveBeenLastCalledWith(
    { message: expect.stringContaining("Find the closest match to a user's request") },
    expect.anything(),
  );
  expect(writerCall).toHaveBeenLastCalledWith(
    { message: expect.stringContaining("Write to the filesystem") },
    expect.anything(),
  );
});

test("getFullPlanSchema should throw error if tools name is not unique", async () => {
  expect(() =>
    getFullPlanSchema([
      AIAgent.from({
        name: "finder",
        description: 'Find the closest match to a user"s request',
      }),
      AIAgent.from({
        name: "finder",
        description: "Write to the filesystem",
      }),
    ]),
  ).toThrowError("Duplicate agent names found in orchestrator: finder");
});
