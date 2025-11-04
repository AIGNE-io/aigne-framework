import { expect, spyOn, test } from "bun:test";
import { createAppCommands } from "@aigne/cli/commands/app";
import yargs from "yargs";

test("app command should register applications to yargs", async () => {
  const command = yargs().scriptName("aigne").command(createAppCommands());

  const exit = spyOn(process, "exit").mockReturnValueOnce(undefined as never);
  const log = spyOn(console, "log").mockReturnValueOnce(undefined as never);
  await command.parseAsync(["--help"]);

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne [command]

    Commands:
      aigne doc-smith  Generate and maintain project docs — powered by agents.
                                                            [aliases: docsmith, doc]
      aigne web-smith  Generate and maintain project website pages — powered by
                       agents.                              [aliases: websmith, web]

    Options:
      --help     Show help                                                 [boolean]
      --version  Show version number                                       [boolean]"
  `);

  exit.mockRestore();
  log.mockRestore();
});
