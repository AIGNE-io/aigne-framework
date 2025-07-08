import { expect, test } from "bun:test";
import { createAIGNECommand } from "@aigne/cli/commands/aigne.js";
import { Command } from "commander";

test("aigne command should parse --version correctly", async () => {
  const command = createAIGNECommand();
  expect(command).toBeInstanceOf(Command);

  expect((command as any)["_defaultCommandName"]).toBe("run");
});
