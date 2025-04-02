import { expect, mock, test } from "bun:test";
import { loadAgentFromJsFile } from "@aigne/core/loader/function-agent";

test("loadAgentFromJs should error if agent.js file is invalid", async () => {
  const fn = () => {};
  fn.description = 123;

  const customImport = mock()
    .mockReturnValueOnce(Promise.reject(new Error("no such file or directory")))
    .mockReturnValueOnce(Promise.resolve({}))
    .mockReturnValueOnce(Promise.resolve({ default: fn }));

  expect(loadAgentFromJsFile("./agent.js", { import: customImport })).rejects.toThrow(
    "no such file or directory",
  );

  expect(loadAgentFromJsFile("./agent.js", { import: customImport })).rejects.toThrow(
    "must export a default function",
  );

  expect(loadAgentFromJsFile("./agent.js", { import: customImport })).rejects.toThrow(
    "Failed to parse agent",
  );
});
