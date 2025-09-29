import { expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as load from "@aigne/cli/utils/load-aigne.js";
import * as runWithAIGNE from "@aigne/cli/utils/run-with-aigne.js";
import { invokeCLIAgentFromDirInChildProcess } from "@aigne/cli/utils/workers/run-aigne-in-child-process-worker.js";
import { AIGNE, FunctionAgent } from "@aigne/core";
import { stringify } from "yaml";
import { z } from "zod";

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

  spyOn(load, "loadAIGNE").mockResolvedValueOnce(
    new AIGNE({
      cli: {
        agents: [{ agent: testAgent }],
      },
    }),
  );

  const readFile = spyOn(fs, "readFile")
    .mockReturnValueOnce(Promise.resolve(JSON.stringify({ key3: "test field form json" })))
    .mockReturnValueOnce(Promise.resolve(stringify({ key1: "test field from yaml" })))
    .mockReturnValueOnce(Promise.resolve(JSON.stringify({ key2: "test field form json" })));

  const run = spyOn(runWithAIGNE, "runAgentWithAIGNE");

  await invokeCLIAgentFromDirInChildProcess({
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

test("invokeCLIAgentFromDir should handle nested agent from aigne cli correctly", async () => {
  const testAgent = FunctionAgent.from({
    name: "test-agent",
    description: "test agent",
    inputSchema: z.object({
      title: z.string(),
    }),
    process: () => ({}),
  });

  spyOn(load, "loadAIGNE").mockResolvedValueOnce(
    new AIGNE({
      cli: {
        agents: [
          {
            name: "component",
            agents: [{ agent: testAgent }],
          },
        ],
      },
    }),
  );

  const run = spyOn(runWithAIGNE, "runAgentWithAIGNE");

  await invokeCLIAgentFromDirInChildProcess({
    dir: "test-dir",
    parent: ["component"],
    agent: "test-agent",
    input: {
      title: "test title",
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
        "input": {
          "title": "test title",
        },
        "title": "test title",
      },
    ]
  `,
  );
});
