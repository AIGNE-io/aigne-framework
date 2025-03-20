import { expect, spyOn, test } from "bun:test";
import { type FullPlanOutput, OrchestratorAgent } from "@aigne/agent-library";
import { AIAgent, ChatModelOpenAI, ExecutionEngine, createMessage } from "@aigne/core-next";

test("AIAgent.call", async () => {
  const model = new ChatModelOpenAI();
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
          is_complete: false,
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
      Promise.resolve({ text: "The content has been written to the filesystem" }),
    )
    .mockReturnValueOnce(
      Promise.resolve<{ json: FullPlanOutput }>({
        json: {
          is_complete: true,
          steps: [],
        },
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ text: "Task finished" }));

  const finderProcess = spyOn(finder, "call");
  const writerProcess = spyOn(writer, "call");

  const result = await engine.call(agent, "Deep research ArcBlock and write a professional report");

  expect(result).toEqual(createMessage("Task finished"));
  expect(finderProcess.mock.calls).toEqual([
    [createMessage(expect.stringContaining("Find the closest match to a user's request")), engine],
  ]);
  expect(writerProcess.mock.calls).toEqual([
    [createMessage(expect.stringContaining("Write to the filesystem")), engine],
  ]);
});
