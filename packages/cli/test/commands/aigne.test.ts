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

test("aigne command should print help if no any subcommand", async () => {
  const command = createAIGNECommand();

  const exit = spyOn(process, "exit").mockReturnValue(undefined as never);
  const log = spyOn(console, "error").mockReturnValue(undefined as never);

  await command.parseAsync([]);

  expect(log.mock.calls).toMatchInlineSnapshot(`
    [
      [

    "CLI for AIGNE framework

    Commands:
      aigne run [path]     Run AIGNE from the specified agent
      aigne test           Run tests in the specified agents directory
      aigne create [path]  Create a new aigne project with agent config files
      aigne serve-mcp      Serve the agents in the specified directory as a MCP
                           server (streamable http)
      aigne observe        Start the observability server
      aigne connect [url]  Manage AIGNE Hub connections
      aigne doc-smith      Generate professional documents by doc-smith
                                                            [aliases: docsmith, doc]

    Options:
      -h, --help     Show help                                             [boolean]
      -v, --version  Show version number                                   [boolean]"
    ,
      ],
      [],
      [
        "Not enough non-option arguments: got 0, need at least 1",
      ],
    ]
  `);

  exit.mockRestore();
  log.mockRestore();
});
