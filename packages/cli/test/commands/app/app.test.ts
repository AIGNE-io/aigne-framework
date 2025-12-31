import { expect, spyOn, test } from "bun:test";
import { runAppCLI } from "@aigne/cli/commands/app/app.js";
import * as upgrade from "@aigne/cli/commands/app/upgrade.js";
import * as runWithAIGNE from "@aigne/cli/utils/run-with-aigne.js";
import { AIGNE, FunctionAgent } from "@aigne/core";
import { z } from "zod";

const runAppCLIOptions: Parameters<typeof runAppCLI>[0] = {
  appName: "doc-smith",
  appPackageName: "@aigne/doc-smith",
  appDescription: "Generate and maintain project docs — powered by agents.",
};

test("app command should register doc-smith to yargs", async () => {
  const exit = spyOn(process, "exit").mockReturnValue(undefined as never);
  const log = spyOn(console, "log").mockReturnValue(undefined as never);

  const loadApplication = spyOn(upgrade, "loadApplication").mockResolvedValue({
    aigne: new AIGNE({
      cli: {
        agents: [
          {
            agent: FunctionAgent.from({
              name: "generate",
              alias: ["gen", "g"],
              description: "Generate documents by doc-smith",
              inputSchema: z.object({
                title: z.string().describe("Title of doc to generate"),
                topic: z.string().describe("Topic of doc to generate").nullish(),
              }),
              outputSchema: z.object({}),
              process: () => ({}),
            }),
          },
        ],
      },
    }),
    version: "1.1.1",
  });

  await runAppCLI({
    ...runAppCLIOptions,
    argv: ["doc-smith", "--help"],
  });

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne doc-smith

    Generate and maintain project docs — powered by agents.

    Commands:
      aigne doc-smith upgrade    Upgrade @aigne/doc-smith to the latest version
      aigne doc-smith generate   Generate documents by doc-smith   [aliases: gen, g]
      aigne doc-smith serve-mcp  Serve doc-smith a MCP server (streamable http)

    Options:
          --model    Model to use for the application, example: openai:gpt-4.1 or
                     google:gemini-2.5-flash                                [string]
      -v, --version  Show version number                                   [boolean]
      -h, --help     Show help                                             [boolean]"
  `);

  await runAppCLI({
    ...runAppCLIOptions,
    argv: ["doc-smith", "generate", "--help"],
  });

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne doc-smith generate

    Generate documents by doc-smith

    Agent Parameters
          --title  Title of doc to generate                      [string] [required]
          --topic  Topic of doc to generate                                 [string]

    Model Options
          --model              AI model to use in format 'provider[/model]' where
                               model is optional. Examples: 'openai' or
                               'openai/gpt-4o-mini'. Available providers: openai,
                               anthropic, bedrock, deepseek, gemini,google, ollama,
                               openrouter, xai, doubao, poe, aignehub (default:
                               openai)                                      [string]
          --image-model        Image model to use in format 'provider[/model]' where
                               model is optional. Examples: 'openai' or
                               'openai/gpt-image-1'. Available providers:
                               openaiimagemodel, geminiimagemodel,google,
                               ideogramimagemodel, doubaoimagemodel,
                               aignehubimagemodel (default: openai)         [string]
          --temperature        Temperature for the model (controls randomness,
                               higher values produce more random outputs). Range:
                               0.0-2.0                                      [number]
          --top-p              Top P (nucleus sampling) parameter for the model
                               (controls diversity). Range: 0.0-1.0         [number]
          --presence-penalty   Presence penalty for the model (penalizes repeating
                               the same tokens). Range: -2.0 to 2.0         [number]
          --frequency-penalty  Frequency penalty for the model (penalizes frequency
                               of token usage). Range: -2.0 to 2.0          [number]
          --aigne-hub-url      Custom AIGNE Hub service URL. Used to fetch remote
                               agent definitions or models.                 [string]

    Options:
          --chat        Run chat loop in terminal         [boolean] [default: false]
          --session-id  Session ID for chat-based agents to maintain context across
                        interactions                                        [string]
      -i, --input       Input to the agent, use @<file> to read from a file  [array]
          --input-file  Input files to the agent                             [array]
          --format      Input format for the agent (available: text, json, yaml
                        default: text)    [string] [choices: "text", "json", "yaml"]
      -o, --output      Output file to save the result (default: stdout)    [string]
          --output-key  Key in the result to save to the output file
                                                       [string] [default: "message"]
          --force       Truncate the output file if it exists, and create directory
                        if the output path does not exists[boolean] [default: false]
          --log-level   Log level for detailed debugging information. Values:
                        silent, error, warn, info, debug[string] [default: "silent"]
      -v, --version     Show version number                                [boolean]
      -h, --help        Show help                                          [boolean]"
  `);

  const runWithAIGNESpy = spyOn(runWithAIGNE, "runAgentWithAIGNE").mockReturnValueOnce(
    Promise.resolve(undefined as any),
  );
  await runAppCLI({
    ...runAppCLIOptions,
    argv: [
      "doc-smith",
      "generate",
      "--title",
      "test title to generate",
      "--topic",
      "test topic to generate",
    ],
  });

  expect(runWithAIGNESpy.mock.lastCall).toMatchInlineSnapshot(
    [
      expect.anything(),
      expect.objectContaining({ name: "generate" }),
      { sessionId: expect.any(String) },
    ],
    `
    [
      Anything,
      ObjectContaining {
        "name": "generate",
      },
      {
        "$0": "aigne doc-smith",
        "_": [
          "generate",
        ],
        "chat": false,
        "force": false,
        "input": {
          "title": "test title to generate",
          "topic": "test topic to generate",
        },
        "log-level": "silent",
        "logLevel": "silent",
        "output-key": "message",
        "outputKey": "message",
        "sessionId": Any<String>,
        "title": "test title to generate",
        "topic": "test topic to generate",
      },
    ]
  `,
  );

  runWithAIGNESpy.mockRestore();
  exit.mockRestore();
  log.mockRestore();
  loadApplication.mockRestore();
});
