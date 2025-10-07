import { expect, spyOn, test } from "bun:test";
import { createAIGNECommand } from "@aigne/cli/commands/aigne.js";
import { AIGNE_CLI_VERSION } from "@aigne/cli/constants";

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

test("aigne command should print help if no any subcommand", async () => {
  const command = createAIGNECommand();

  const exit = spyOn(process, "exit").mockReturnValue(undefined as never);
  spyOn(console, "error")
    .mockReturnValue(undefined as never)
    .mockRestore();
  const log = spyOn(console, "error").mockReturnValue(undefined as never);

  await command.parseAsync([]);

  expect(
    log.mock.calls.map((i) =>
      i.map((j) =>
        typeof j === "string"
          ? j
              .split("\n")
              .map((i) =>
                i.includes(AIGNE_CLI_VERSION)
                  ? i.replace(AIGNE_CLI_VERSION, "xx.xx.xx").replace(/\s+/g, "").trim()
                  : i,
              )
              .join("\n")
          : j,
      ),
    ),
  ).toMatchSnapshot();

  exit.mockRestore();
  log.mockRestore();
});
