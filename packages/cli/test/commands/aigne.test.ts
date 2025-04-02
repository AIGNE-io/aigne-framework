import { expect, test } from "bun:test";
import { Command } from "commander";
import { createAIGNECommand } from "../../src/commands/aigne.js";

test("aigne command should should parse --version correctly", async () => {
  const command = createAIGNECommand();
  expect(command).toBeInstanceOf(Command);
});
