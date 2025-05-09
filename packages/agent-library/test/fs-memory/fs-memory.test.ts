import { expect, spyOn, test } from "bun:test";
import { FSMemory } from "@aigne/agent-library/fs-memory/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

test("FSMemory simple example", async () => {
  // #region example-fs-memory-simple
  const model = new OpenAIChatModel();

  const engine = new AIGNE({ model });

  const memory = new FSMemory({ rootDir: "/PATH/TO/MEMORY_FOLDER" });

  const agent = AIAgent.from({
    memory,
  });

  spyOn(memory, "retrieve").mockReturnValueOnce(Promise.resolve({ memories: [] }));
  spyOn(memory, "record").mockReturnValueOnce(Promise.resolve({ memories: [] }));
  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "Great! I will remember that you like blue color.",
    }),
  );

  const result1 = await engine.invoke(agent, "I like blue color");

  expect(result1).toEqual({ $message: "Great! I will remember that you like blue color." });
  console.log(result1);
  // Output: { $message: 'Great! I will remember that you like blue color.' }

  spyOn(memory, "retrieve").mockReturnValueOnce(
    Promise.resolve({
      memories: [
        {
          id: "memory1",
          content: "You like blue color.",
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  );
  spyOn(memory, "record").mockReturnValueOnce(Promise.resolve({ memories: [] }));
  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "You like blue color.",
    }),
  );

  const result2 = await engine.invoke(agent, "What color do I like?");
  expect(result2).toEqual({ $message: "You like blue color." });
  console.log(result2);
  // Output: { $message: 'You like blue color.' }

  // #endregion example-fs-memory-simple
});
