import { expect, mock, spyOn, test } from "bun:test";
import { Command } from "commander";
import { withQuery } from "ufo";
import { mockModule } from "./_mocks_/mock-module.js";

test("CLI imports and loads correctly", async () => {
  const createAIGNECommand = mock(() => new Command());

  await using _ = await mockModule("@aigne/cli/commands/aigne.js", () => ({
    createAIGNECommand,
  }));

  await import(withQuery("@aigne/cli/cli.js", { key: Date.now() }));

  expect(createAIGNECommand).toHaveBeenCalled();
});

test("aigne cli should print pretty error message", async () => {
  const error = spyOn(console, "error").mockImplementationOnce(() => {});
  const exit = spyOn(process, "exit").mockImplementationOnce(() => undefined as never);

  await using _ = await mockModule("@aigne/cli/commands/aigne.js", () => ({
    createAIGNECommand: () =>
      new Command().action(async () => {
        throw new Error("test error");
      }),
  }));

  await import(withQuery("@aigne/cli/cli.js", { key: Date.now() }));

  expect(error).toHaveBeenCalledWith(expect.stringContaining("test error"));
  expect(exit).toHaveBeenCalledWith(1);

  error.mockRestore();
  exit.mockRestore();
});
