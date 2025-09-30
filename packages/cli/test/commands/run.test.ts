import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import { createRunCommand } from "@aigne/cli/commands/run.js";
import * as runAIGNEInChildProcess from "@aigne/cli/utils/workers/run-aigne-in-child-process.js";
import yargs from "yargs";
import { mockAIGNEPackage, mockAIGNEV1Package } from "../_mocks_/mock-aigne-package.js";

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = {
    MODEL: process.env.MODEL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
  };

  process.env.MODEL = "openai:gpt-4o-mini";
  process.env.OPENAI_API_KEY = "test-openai-api-key";
  process.env.XAI_API_KEY = "test-xai-api-key";
});

afterEach(() => {
  Object.assign(process.env, originalEnv);
});

test("run command should call run chat loop correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(
    runAIGNEInChildProcess,
    "runAIGNEInChildProcess",
  ).mockResolvedValue(undefined as any);

  const command = yargs().command(createRunCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  // should run chat agent in current directory
  process.argv = ["run"];
  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(process.argv);
  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toMatchInlineSnapshot(
    `"invokeCLIAgentFromDir"`,
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[1]).toEqual(
    expect.objectContaining({ agent: "chat" }),
  );
  process.chdir(cwd);
  runAIGNEInChildProcessSpy.mockClear();

  // should run in specified directory
  process.argv = ["run", testAgentsPath];
  await command.parseAsync(process.argv);
  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toMatchInlineSnapshot(
    `"invokeCLIAgentFromDir"`,
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[1]).toEqual(
    expect.objectContaining({ agent: "chat" }),
  );

  // should run in specified directory of relative path
  runAIGNEInChildProcessSpy.mockClear();
  const relativePath = relative(cwd, testAgentsPath);
  process.argv = ["run", relativePath];
  await command.parseAsync(process.argv);
  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toMatchInlineSnapshot(
    `"invokeCLIAgentFromDir"`,
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[1]).toEqual(
    expect.objectContaining({ agent: "chat" }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
});

test("run command should download package and run correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(
    runAIGNEInChildProcess,
    "runAIGNEInChildProcess",
  ).mockResolvedValue(undefined as any);
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = yargs().command(createRunCommand());

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  process.argv = ["run", url.toString()];
  await command.parseAsync(process.argv);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toMatchInlineSnapshot(
    `"invokeCLIAgentFromDir"`,
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[1]).toEqual(
    expect.objectContaining({ agent: "chat" }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
  fetchSpy.mockRestore();
});

test("run command should convert package from v1 and run correctly", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEV1Package())),
  );
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(
    runAIGNEInChildProcess,
    "runAIGNEInChildProcess",
  ).mockResolvedValue(undefined as any);

  const command = yargs().command(createRunCommand());

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  process.argv = ["run", url.toString()];
  await command.parseAsync(process.argv);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toMatchInlineSnapshot(
    `"invokeCLIAgentFromDir"`,
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[1]).toEqual(
    expect.objectContaining({ agent: "chat" }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
  fetchSpy.mockRestore();
});

test("run command should parse model options correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(
    runAIGNEInChildProcess,
    "runAIGNEInChildProcess",
  ).mockResolvedValue(undefined as any);

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const command = yargs().scriptName("aigne").command(createRunCommand());

  process.argv = ["run", testAgentsPath, "--model", "xai:test-model"];
  await command.parseAsync(process.argv);

  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toMatchInlineSnapshot(
    `"invokeCLIAgentFromDir"`,
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[1]).toEqual(
    expect.objectContaining({ agent: "chat" }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
});
