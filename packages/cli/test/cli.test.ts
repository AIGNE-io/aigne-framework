import { expect, mock, test } from "bun:test";
import { Command } from "commander";

test("CLI imports and loads correctly", async () => {
  const createAIGNECommand = mock(() => new Command());

  mock.module("@aigne/cli/commands/aigne.js", () => ({
    createAIGNECommand,
  }));

  await import("@aigne/cli/cli.js");

  expect(createAIGNECommand).toHaveBeenCalled();
});
