import { expect, mock, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { withQuery } from "ufo";
import yargs from "yargs";
import { mockModule } from "./_mocks_/mock-module.js";

test("CLI imports and loads correctly", async () => {
  const createAIGNECommand = mock(() => yargs());

  await using _ = await mockModule("@aigne/cli/commands/aigne.js", () => ({
    createAIGNECommand,
  }));

  await import(withQuery("@aigne/cli/cli.js", { key: randomUUID() }));

  expect(createAIGNECommand).toHaveBeenCalled();
});

test("CLI imports and loads with shebang mode correctly", async () => {
  const createAIGNECommand = mock(() => yargs());

  await using _ = await mockModule("@aigne/cli/commands/aigne.js", () => ({
    createAIGNECommand,
  }));

  const originalArgv = process.argv;
  process.argv = [
    "node",
    "cli.js",
    join(import.meta.dirname, "../test-agents/aigne.yaml"),
    ...originalArgv.slice(2),
  ];

  await import(withQuery("@aigne/cli/cli.js", { key: randomUUID() }));

  process.argv = originalArgv;

  expect(createAIGNECommand).toHaveBeenLastCalledWith({
    aigneFilePath: expect.stringContaining("test-agents/aigne.yaml"),
  });
});

test("aigne cli should print error message", async () => {
  const error = spyOn(console, "error").mockImplementationOnce(() => {});
  const exit = spyOn(process, "exit").mockImplementationOnce(() => undefined as never);

  await using _ = await mockModule("@aigne/cli/commands/aigne.js", () => ({
    createAIGNECommand: () =>
      yargs().command("$0", "test", async () => {
        throw new Error("test error");
      }),
  }));

  await import(withQuery("@aigne/cli/cli.js", { key: randomUUID() })).then((m) => m.default);

  expect(exit).toHaveBeenCalledWith(1);
  expect(error).toHaveBeenCalledWith(expect.stringContaining("test error"));

  error.mockRestore();
  exit.mockRestore();
});
