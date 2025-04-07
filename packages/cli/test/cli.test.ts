import { expect, mock, test } from "bun:test";
import { Command } from "commander";

test("CLI imports and loads correctly", async () => {
  const createAIGNECommand = mock(() => new Command());

  mock.module("../src/commands/aigne.js", () => ({
    createAIGNECommand,
  }));

  await import("../src/cli.js");

  expect(createAIGNECommand).toHaveBeenCalled();
});
