import { expect, mock, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as app from "@aigne/cli/commands/app";
import { createAppCommands } from "@aigne/cli/commands/app";
import * as load from "@aigne/cli/utils/load-aigne.js";
import * as runWithAIGNE from "@aigne/cli/utils/run-with-aigne.js";
import { AIGNE, FunctionAgent } from "@aigne/core";
import { stringify } from "yaml";
import yargs from "yargs";
import { z } from "zod";
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

  const loadApplication = spyOn(app, "loadApplication").mockReturnValue(
    Promise.resolve({
      aigne: new AIGNE({
        cli: {
          agents: [
            FunctionAgent.from({
              name: "generate",
              alias: ["gen", "g"],
              description: "Generate documents by doc-smith",
              inputSchema: z.object({
                title: z.string().describe("Title of doc to generate"),
                topic: z.string().describe("Topic of doc to generate").nullish(),
              }),
              process: () => ({}),
            }),
          ],
        },
      }),
      dir: "",
      version: "1.1.1",
    }),
  );

  await command.parseAsync(["doc-smith", "--help"]);

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne doc-smith

    Generate and maintain project docs — powered by agents.

    Commands:
      aigne doc-smith serve-mcp  Serve doc-smith a MCP server (streamable http)
      aigne doc-smith upgrade    Upgrade doc-smith to the latest version
      aigne doc-smith generate   Generate documents by doc-smith   [aliases: gen, g]

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

  const invokeAgentFromDir = spyOn(app, "invokeCLIAgentFromDir").mockReturnValueOnce(
    Promise.resolve(),
  );
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

  expect(invokeAgentFromDir.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    {
      "agent": "generate",
      "dir": "",
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
  `);

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
  expect(mockServeMCPServerFromDir.mock.lastCall?.at(0)).toMatchInlineSnapshot(`
    {
      "$0": "aigne",
      "_": [
        "doc-smith",
        "serve-mcp",
      ],
      "dir": "",
      "host": "localhost",
      "pathname": "/mcp",
    }
  `);

  loadApplication.mockRestore();
  exit.mockRestore();
  log.mockRestore();
});

test("app command should support upgrade subcommand", async () => {
  const command = yargs().scriptName("aigne").command(createAppCommands());

  const exit = spyOn(process, "exit").mockReturnValueOnce(undefined as never);
  const log = spyOn(console, "log").mockReturnValueOnce(undefined as never);

  const aigne = new AIGNE({
    cli: {
      agents: [
        FunctionAgent.from({
          name: "generate",
          description: "Generate documents by doc-smith",
          process: () => ({}),
        }),
      ],
    },
  });

  // simulate for the first time upgrade
  const loadApplication1 = spyOn(app, "loadApplication").mockReturnValue(
    Promise.resolve({ aigne, dir: "", version: "1.1.1" }),
  );

  await command.parseAsync(["doc-smith", "upgrade"]);

  expect(loadApplication1.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "name": "doc-smith",
        },
      ],
    ]
  `);

  loadApplication1.mockRestore();

  // simulate upgrade from cache to the latest version
  const loadApplication2 = spyOn(app, "loadApplication")
    .mockReturnValueOnce(Promise.resolve({ aigne, dir: "", version: "1.1.1", isCache: true }))
    .mockReturnValueOnce(Promise.resolve({ aigne, dir: "", version: "1.2.1" }));

  await command.parseAsync(["doc-smith", "upgrade"]);

  expect(loadApplication2.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "name": "doc-smith",
        },
      ],
      [
        {
          "dir": "",
          "forceUpgrade": true,
          "name": "doc-smith",
        },
      ],
    ]
  `);

  loadApplication2.mockRestore();
  exit.mockRestore();
  log.mockRestore();
});

test("invokeCLIAgentFromDir should process input and invoke agent correctly", async () => {
  const testAgent = FunctionAgent.from({
    name: "test-agent",
    description: "test agent",
    inputSchema: z.object({
      title: z.string(),
      description: z.object({
        key3: z.string(),
      }),
      key2: z.string(),
      key1: z.string(),
    }),
    process: () => ({}),
  });

  spyOn(load, "loadAIGNE").mockReturnValueOnce(
    Promise.resolve(
      new AIGNE({
        cli: {
          agents: [testAgent],
        },
      }),
    ),
  );

  const readFile = spyOn(fs, "readFile")
    .mockReturnValueOnce(Promise.resolve(JSON.stringify({ key3: "test field form json" })))
    .mockReturnValueOnce(Promise.resolve(stringify({ key1: "test field from yaml" })))
    .mockReturnValueOnce(Promise.resolve(JSON.stringify({ key2: "test field form json" })));

  const run = spyOn(runWithAIGNE, "runAgentWithAIGNE");

  await app.invokeCLIAgentFromDir({
    dir: "test-dir",
    agent: "test-agent",
    input: {
      title: "test title",
      input: ["@test.yaml", "@test.json"],
      description: "@test-description.json",
    },
  });

  expect(run.mock.lastCall).toMatchInlineSnapshot(
    [expect.anything(), expect.objectContaining({ name: "test-agent" }), {}],
    `
    [
      Anything,
      ObjectContaining {
        "name": "test-agent",
      },
      {
        "chat": undefined,
        "description": "@test-description.json",
        "input": {
          "description": {
            "key3": "test field form json",
          },
          "key1": "test field from yaml",
          "key2": "test field form json",
          "title": "test title",
        },
        "title": "test title",
      },
    ]
  `,
  );

  readFile.mockRestore();
});

test("loadApplication should load doc-smith correctly", async () => {
  const load = spyOn(AIGNE, "load").mockReturnValue(Promise.resolve(new AIGNE({})));

  const tmp = join(tmpdir(), randomUUID());
  await app.loadApplication({ name: "doc-smith", dir: tmp });

  await app.loadApplication({ name: "doc-smith", dir: tmp });

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

  // Test with beta flag set to "true" - should use beta
  process.env.AIGNE_USE_BETA_APPS = "true";
  // Need to reimport to pick up environment variable change
  delete require.cache[require.resolve("@aigne/cli/commands/app")];
  const { getNpmTgzInfo: getNpmTgzInfoBeta } = await import("@aigne/cli/commands/app");
  const betaInfo = await getNpmTgzInfoBeta("@aigne/doc-smith");
  expect(betaInfo.version).toBe("1.1.0-beta.1");
  expect(betaInfo.url).toContain("doc-smith-1.1.0-beta.1.tgz");

  // Test with beta flag set to "1" - should use beta
  process.env.AIGNE_USE_BETA_APPS = "1";
  delete require.cache[require.resolve("@aigne/cli/commands/app")];
  const { getNpmTgzInfo: getNpmTgzInfoOne } = await import("@aigne/cli/commands/app");
  const betaInfo2 = await getNpmTgzInfoOne("@aigne/doc-smith");
  expect(betaInfo2.version).toBe("1.1.0-beta.1");

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
