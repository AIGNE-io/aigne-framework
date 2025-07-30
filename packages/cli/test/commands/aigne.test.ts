import { expect, spyOn, test } from "bun:test";
import { createAIGNECommand } from "@aigne/cli/commands/aigne.js";

test("aigne command should parse --version correctly", async () => {
  const command = createAIGNECommand();

  spyOn(process, "exit").mockReturnValueOnce(0 as never);

  const result = await command.parse(["--version"]);

  expect(result).toEqual(
    expect.objectContaining({
      version: true,
    }),
  );
});
