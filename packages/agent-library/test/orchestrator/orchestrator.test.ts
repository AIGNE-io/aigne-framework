import { expect, spyOn, test } from "bun:test";
import {
  type FullPlanOutput,
  OrchestratorAgent,
  getFullPlanSchema,
} from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, ExecutionEngine, createMessage } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

test("AIAgent.call", async () => {
  const model = new OpenAIChatModel();
  const engine = new ExecutionEngine({ model });

  const finder = AIAgent.from({
    name: "finder",
    description: 'Find the closest match to a user"s request',
  });

  const writer = AIAgent.from({
    name: "writer",
    description: "Write to the filesystem",
  });

  const agent = OrchestratorAgent.from({
    tools: [finder, writer],
  });

  spyOn(model, "call")
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

  const finderCall = spyOn(finder, "call");
  const writerCall = spyOn(writer, "call");

  const result = await engine.call(agent, "Deep research ArcBlock and write a professional report");

  expect(result).toEqual(createMessage("Task finished"));
  expect(finderCall.mock.calls).toEqual([
    [
      createMessage(expect.stringContaining("Find the closest match to a user's request")),
      expect.anything(),
    ],
  ]);
  expect(writerCall.mock.calls).toEqual([
    [createMessage(expect.stringContaining("Write to the filesystem")), expect.anything()],
  ]);
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
