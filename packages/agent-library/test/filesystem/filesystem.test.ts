import { expect, spyOn, test } from "bun:test";
import { FilesystemAgent } from "@aigne/agent-library/filesystem/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { randomUUIDv7 } from "bun";

test("FilesystemAgent simple example", async () => {
  // #region example-filesystem-simple
  const model = new OpenAIChatModel();

  const engine = new AIGNE({ model });

  const agent = AIAgent.from({
    skills: [new FilesystemAgent({ rootDir: "/PATH/TO/ROOT" })],
  });

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve({
        toolCalls: [
          {
            id: randomUUIDv7(),
            type: "function",
            function: {
              name: "readDir",
              arguments: { path: "/" },
            },
          },
        ],
      }),
    )
    .mockReturnValueOnce(
      Promise.resolve({
        text: `\
Files in directory: /
- file1.txt
- file2.txt
`,
      }),
    );

  const readDirResult = await engine.invoke(agent, "list files in the / directory");

  expect(readDirResult).toEqual({
    $message: `\
Files in directory: /
- file1.txt
- file2.txt
`,
  });
  console.log(readDirResult);
  // Output:
  // Files in directory: /
  // - file1.txt
  // - file2.txt

  // #endregion example-filesystem-simple
});
