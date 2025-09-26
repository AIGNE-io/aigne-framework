import { expect, mock, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAppCommands } from "@aigne/cli/commands/app";
import * as app from "@aigne/cli/commands/app.js";
import * as runAIGNEInChildProcess from "@aigne/cli/utils/workers/run-aigne-in-child-process.js";
import { AIGNE, FunctionAgent } from "@aigne/core";
import { omit } from "@aigne/core/utils/type-utils.js";
import yargs from "yargs";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { mockModule } from "../_mocks_/mock-module.js";

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

test("app command should register doc-smith to yargs", async () => {
  const command = yargs().scriptName("aigne").command(createAppCommands());

  const exit = spyOn(process, "exit").mockReturnValue(undefined as never);
  const log = spyOn(console, "log").mockReturnValue(undefined as never);

  const loadApplication = spyOn(app, "loadApplication").mockResolvedValue({
    aigne: {
      cli: {
        agents: [
          {
            name: "generate",
            alias: ["gen", "g"],
            description: "Generate documents by doc-smith",
            inputSchema: zodToJsonSchema(
              z.object({
                title: z.string().describe("Title of doc to generate"),
                topic: z.string().describe("Topic of doc to generate").nullish(),
              }),
            ),
            outputSchema: zodToJsonSchema(z.object({})),
          },
        ],
      },
    },
    version: "1.1.1",
  });

  await command.parseAsync(["doc-smith", "--help"]);

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne doc-smith

    Generate and maintain project docs — powered by agents.

    Commands:
      aigne doc-smith generate   Generate documents by doc-smith   [aliases: gen, g]
      aigne doc-smith serve-mcp  Serve doc-smith a MCP server (streamable http)
      aigne doc-smith upgrade    Upgrade @aigne/doc-smith to the latest version

    Options:
          --help     Show help                                             [boolean]
          --model    Model to use for the application, example: openai:gpt-4.1 or
                     google:gemini-2.5-flash                                [string]
      -v, --version  Show version number                                   [boolean]"
  `);

  await command.parseAsync(["doc-smith", "generate", "--help"]);

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne doc-smith generate

    Generate documents by doc-smith

    Agent Parameters
          --title  Title of doc to generate                      [string] [required]
          --topic  Topic of doc to generate                                 [string]

    Model Options
          --model              AI model to use in format 'provider[:model]' where
                               model is optional. Examples: 'openai' or
                               'openai:gpt-4o-mini'. Available providers: openai,
                               anthropic, bedrock, deepseek, gemini,google, ollama,
                               openrouter, xai, doubao, poe, aignehub (default:
                               openai)                                      [string]
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
          --help        Show help                                          [boolean]
      -v, --version     Show version number                                [boolean]
          --chat        Run chat loop in terminal         [boolean] [default: false]
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
                        silent, error, warn, info, debug[string] [default: "silent"]"
  `);

  const invokeAgentFromDir = spyOn(
    runAIGNEInChildProcess,
    "runAIGNEInChildProcess",
  ).mockReturnValueOnce(Promise.resolve(undefined as any));
  await command.parseAsync([
    "doc-smith",
    "generate",
    "--title",
    "test title to generate",
    "--topic",
    "test topic to generate",
    "--input",
    "@test.yaml",
    "--format",
    "yaml",
  ]);

  expect(invokeAgentFromDir.mock.lastCall?.[1]).toMatchInlineSnapshot(
    { dir: expect.any(String) },
    `
    {
      "agent": "generate",
      "dir": Any<String>,
      "input": {
        "$0": "aigne",
        "_": [
          "doc-smith",
          "generate",
        ],
        "chat": false,
        "force": false,
        "format": "yaml",
        "i": [
          "@test.yaml",
        ],
        "input": [
          "@test.yaml",
        ],
        "log-level": "silent",
        "logLevel": "silent",
        "output-key": "message",
        "outputKey": "message",
        "title": "test title to generate",
        "topic": "test topic to generate",
      },
    }
  `,
  );

  exit.mockRestore();
  log.mockRestore();
  loadApplication.mockRestore();
});

test("app command should support serve-mcp subcommand", async () => {
  const command = yargs().scriptName("aigne").command(createAppCommands());

  const exit = spyOn(process, "exit").mockReturnValueOnce(undefined as never);
  const log = spyOn(console, "log").mockReturnValueOnce(undefined as never);

  const mockServeMCPServerFromDir = mock();

  await using _ = await mockModule("../../src/commands/serve-mcp.ts", async () => ({
    serveMCPServerFromDir: mockServeMCPServerFromDir,
  }));

  const loadApplication = spyOn(app, "loadApplication").mockReturnValueOnce(
    Promise.resolve({
      aigne: new AIGNE({
        cli: {
          agents: [
            FunctionAgent.from({
              name: "generate",
              description: "Generate documents by doc-smith",
              process: () => ({}),
            }),
          ],
        },
      }),
      dir: "",
      version: "1.1.1",
    }),
  );

  await command.parseAsync(["doc-smith", "serve-mcp"]);

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`undefined`);
  expect(mockServeMCPServerFromDir.mock.lastCall?.at(0)).toMatchInlineSnapshot(
    { dir: expect.any(String) },
    `
    {
      "$0": "aigne",
      "_": [
        "doc-smith",
        "serve-mcp",
      ],
      "dir": Any<String>,
      "host": "localhost",
      "pathname": "/mcp",
    }
  `,
  );

  loadApplication.mockRestore();
  exit.mockRestore();
  log.mockRestore();
});

test("app command should support upgrade subcommand", async () => {
  const command = yargs().scriptName("aigne").command(createAppCommands());

  const exit = spyOn(process, "exit").mockReturnValueOnce(undefined as never);
  const log = spyOn(console, "log").mockReturnValueOnce(undefined as never);

  const aigne: runAIGNEInChildProcess.LoadAIGNEInChildProcessResult = {
    cli: {
      agents: [
        {
          name: "generate",
          description: "Generate documents by doc-smith",
          inputSchema: zodToJsonSchema(z.object({})),
          outputSchema: zodToJsonSchema(z.object({})),
        },
      ],
    },
  };

  const loadApplication = spyOn(app, "loadApplication").mockResolvedValue({
    aigne,
    version: "1.1.1",
  });

  const getNpmTgzInfo = spyOn(app, "getNpmTgzInfo").mockResolvedValue({
    version: "1.1.1",
    url: "http://example.com/doc-smith-1.1.1.tgz",
  });
  const installApp = spyOn(app, "installApp").mockResolvedValue();

  await command.parseAsync(["doc-smith", "upgrade"]);

  expect(installApp.mock.calls.map((i) => [omit(i[0], "dir")])).toMatchInlineSnapshot(`[]`);

  installApp.mockReset();

  getNpmTgzInfo.mockReset().mockResolvedValue({
    version: "1.2.0-beta.1",
    url: "http://example.com/doc-smith-1.2.0-beta.1.tgz",
  });

  const rmSpy = spyOn(fs, "rm").mockResolvedValueOnce();
  await command.parseAsync([
    "doc-smith",
    "upgrade",
    "--beta",
    "--target-version",
    "1.2.0",
    "--force",
  ]);

  expect(rmSpy).toHaveBeenCalledTimes(1);

  expect(installApp.mock.calls.map((i) => [omit(i[0], "dir")])).toMatchInlineSnapshot(`
    [
      [
        {
          "beta": true,
          "packageName": "@aigne/doc-smith",
          "version": "1.2.0",
        },
      ],
    ]
  `);

  rmSpy.mockRestore();
  installApp.mockRestore();
  loadApplication.mockRestore();
  getNpmTgzInfo.mockRestore();
  exit.mockRestore();
  log.mockRestore();
});

test("loadApplication should load doc-smith correctly", async () => {
  const load = spyOn(AIGNE, "load").mockReturnValue(Promise.resolve(new AIGNE({})));

  const tmp = join(tmpdir(), randomUUID());
  await app.loadApplication({ packageName: "doc-smith", dir: tmp });

  await app.loadApplication({ packageName: "doc-smith", dir: tmp });

  load.mockRestore();

  await fs.rm(tmp, { recursive: true, force: true });
}, 60e3);

test("beta version support should work with AIGNE_USE_BETA_APPS environment variable", async () => {
  // Mock fetch to return package info with beta version
  const mockFetch = mock().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        "dist-tags": {
          latest: "1.0.0",
          beta: "1.1.0-beta.1",
        },
        versions: {
          "1.0.0": {
            dist: { tarball: "https://registry.npmjs.org/@aigne/doc-smith/-/doc-smith-1.0.0.tgz" },
          },
          "1.1.0-beta.1": {
            dist: {
              tarball: "https://registry.npmjs.org/@aigne/doc-smith/-/doc-smith-1.1.0-beta.1.tgz",
            },
          },
        },
      }),
  });

  global.fetch = mockFetch as any;

  // Test without beta flag - should use latest
  delete process.env.AIGNE_USE_BETA_APPS;
  const { getNpmTgzInfo } = await import("@aigne/cli/commands/app");
  const latestInfo = await getNpmTgzInfo("@aigne/doc-smith");
  expect(latestInfo.version).toBe("1.0.0");
  expect(latestInfo.url).toContain("doc-smith-1.0.0.tgz");

  // Need to reimport to pick up environment variable change
  delete require.cache[require.resolve("@aigne/cli/commands/app")];
  const { getNpmTgzInfo: getNpmTgzInfoBeta } = await import("@aigne/cli/commands/app");
  const betaInfo = await getNpmTgzInfoBeta("@aigne/doc-smith", { beta: true });
  expect(betaInfo.version).toBe("1.1.0-beta.1");
  expect(betaInfo.url).toContain("doc-smith-1.1.0-beta.1.tgz");

  // Cleanup
  delete process.env.AIGNE_USE_BETA_APPS;
  mockFetch.mockRestore();
});

test("beta version support should fallback to latest when no beta available", async () => {
  // Mock fetch to return package info without beta version
  const mockFetch = mock().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        "dist-tags": {
          latest: "1.0.0",
          // No beta tag
        },
        versions: {
          "1.0.0": {
            dist: { tarball: "https://registry.npmjs.org/@aigne/doc-smith/-/doc-smith-1.0.0.tgz" },
          },
        },
      }),
  });

  global.fetch = mockFetch as any;

  // Test with beta flag but no beta version available - should fallback to latest
  process.env.AIGNE_USE_BETA_APPS = "true";
  delete require.cache[require.resolve("@aigne/cli/commands/app")];
  const { getNpmTgzInfo } = await import("@aigne/cli/commands/app");
  const info = await getNpmTgzInfo("@aigne/doc-smith");
  expect(info.version).toBe("1.0.0");
  expect(info.url).toContain("doc-smith-1.0.0.tgz");

  // Cleanup
  delete process.env.AIGNE_USE_BETA_APPS;
  mockFetch.mockRestore();
});
