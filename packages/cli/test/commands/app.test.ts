import { expect, mock, spyOn, test } from "bun:test";
import * as childProcess from "node:child_process";
import { randomUUID } from "node:crypto";
import EventEmitter from "node:events";
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
      aigne doc-smith  Generate professional documents by doc-smith
                                                            [aliases: docsmith, doc]

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

    Generate professional documents by doc-smith

    Commands:
      aigne doc-smith serve-mcp  Serve doc-smith a MCP server (streamable http)
      aigne doc-smith upgrade    Upgrade doc-smith to the latest version
      aigne doc-smith generate   Generate documents by doc-smith   [aliases: gen, g]

    Options:
      --help     Show help                                                 [boolean]
      --model    Model to use for the application, example: openai:gpt-4.1 or
                 google:gemini-2.5-flash                                    [string]
      --version  Show version number                                       [boolean]"
  `);

  await command.parseAsync(["doc-smith", "generate", "--help"]);

  expect(log.mock.lastCall?.[0]).toMatchInlineSnapshot(`
    "aigne doc-smith generate

    Generate documents by doc-smith

    Options:
          --help     Show help                                             [boolean]
          --model    Model to use for the application, example: openai:gpt-4.1 or
                     google:gemini-2.5-flash                                [string]
          --version  Show version number                                   [boolean]
          --title    Title of doc to generate                    [string] [required]
          --topic    Topic of doc to generate                               [string]
      -i, --input    Input to the agent, use @<file> to read from a file     [array]
          --format   Input format, can be "json" or "yaml"
                                                  [string] [choices: "json", "yaml"]"
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
        "format": "yaml",
        "i": [
          "@test.yaml",
        ],
        "input": [
          "@test.yaml",
        ],
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
        "input": {
          "description": {
            "key3": "test field form json",
          },
          "key1": "test field from yaml",
          "key2": "test field form json",
          "title": "test title",
        },
      },
    ]
  `,
  );

  readFile.mockRestore();
});

test("loadApplication should load doc-smith correctly", async () => {
  const spawn = spyOn(childProcess, "spawn").mockImplementationOnce(() => {
    const result: any = new EventEmitter();
    result.stderr = new EventEmitter();

    setTimeout(() => {
      result.emit("exit", 0);
    });

    return result;
  });

  const load = spyOn(AIGNE, "load").mockReturnValue(Promise.resolve(new AIGNE({})));

  const tmp = join(tmpdir(), randomUUID());
  await app.loadApplication({ name: "doc-smith", dir: tmp });

  expect(spawn.mock.lastCall).toEqual([
    "npm",
    ["install", "--omit", "dev"],
    {
      cwd: tmp,
      stdio: "pipe",
    },
  ]);

  await app.loadApplication({ name: "doc-smith", dir: tmp });

  spawn.mockRestore();
  load.mockRestore();

  await fs.rm(tmp, { recursive: true, force: true });
}, 30e3);
