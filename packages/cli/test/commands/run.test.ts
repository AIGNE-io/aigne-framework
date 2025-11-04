import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, relative } from "node:path";
import * as runAgent from "@aigne/cli/commands/app/agent.js";
import { createRunCommand } from "@aigne/cli/commands/run.js";
import yargs from "yargs";
import { mockAIGNEPackage, mockAIGNEV1Package } from "../_mocks_/mock-aigne-package.js";

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = {
    MODEL: process.env.MODEL,
    IMAGE_MODEL: process.env.IMAGE_MODEL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
  };

  process.env.MODEL = "openai:gpt-4o-mini";
  process.env.IMAGE_MODEL = "openai:gpt-image-1";
  process.env.OPENAI_API_KEY = "test-openai-api-key";
  process.env.XAI_API_KEY = "test-xai-api-key";
});

afterEach(() => {
  Object.assign(process.env, originalEnv);
});

test("run command should call run chat loop correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(runAgent, "invokeAgent").mockResolvedValue(
    undefined as any,
  );

  const command = yargs().command(createRunCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  // should run chat agent in current directory
  process.argv = ["run"];
  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(process.argv);
  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
  );
  process.chdir(cwd);
  runAIGNEInChildProcessSpy.mockClear();

  // should run in specified directory
  process.argv = ["run", testAgentsPath];
  await command.parseAsync(process.argv);
  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
  );

  // should run in specified directory of relative path
  runAIGNEInChildProcessSpy.mockClear();
  const relativePath = relative(cwd, testAgentsPath);
  process.argv = ["run", relativePath];
  await command.parseAsync(process.argv);
  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
});

test("run command should download package and run correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(runAgent, "invokeAgent").mockResolvedValue(
    undefined as any,
  );
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
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
  );
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
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
  const runAIGNEInChildProcessSpy = spyOn(runAgent, "invokeAgent").mockResolvedValue(
    undefined as any,
  );

  const command = yargs().command(createRunCommand());

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  process.argv = ["run", url.toString()];
  await command.parseAsync(process.argv);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
  fetchSpy.mockRestore();
});

test("run command should parse model options correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(runAgent, "invokeAgent").mockResolvedValue(
    undefined as any,
  );

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const command = yargs().scriptName("aigne").command(createRunCommand());

  process.argv = ["run", testAgentsPath, "--model", "xai:test-model"];
  await command.parseAsync(process.argv);

  expect(runAIGNEInChildProcessSpy).toHaveBeenCalledTimes(1);
  expect(runAIGNEInChildProcessSpy.mock.lastCall?.[0]).toEqual(
    expect.objectContaining({ agent: expect.objectContaining({ name: "chat" }) }),
  );

  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
});

test("run command should register commands correctly", async () => {
  const exit = spyOn(process, "exit").mockImplementation((() => {}) as any);
  const runAIGNEInChildProcessSpy = spyOn(runAgent, "invokeAgent").mockResolvedValue(
    undefined as any,
  );
  const log = spyOn(console, "log").mockImplementation(() => {});

  const command = yargs().command(createRunCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  process.argv = ["run", testAgentsPath, "-h"];
  await command.parseAsync(process.argv);
  expect(log.mock.lastCall).toMatchInlineSnapshot(`
    [
      
    "aigne run <path> <agent> [...options]

    Commands:
      chat        Chat agent
      evaluateJs  This agent evaluates JavaScript code.
      chat        Chat agent
      chat        Chat agent
      component   Manage components of web-smith         [aliases: comp, components]

    Options:
      -h, --help     Show help                                             [boolean]
      -v, --version  Show version number                                   [boolean]"
    ,
    ]
  `);

  process.argv = ["run", testAgentsPath, "component", "-h"];
  await command.parseAsync(process.argv);
  expect(log.mock.lastCall).toMatchInlineSnapshot(`
    [
      
    "component

    Manage components of web-smith

    Commands:
      component push-components   Push components to remote repository
                                                         [aliases: push, push-comps]
      component pull              Pull components from remote repository

    Options:
      -h, --help     Show help                                             [boolean]
      -v, --version  Show version number                                   [boolean]"
    ,
    ]
  `);

  process.argv = ["run", testAgentsPath, "component", "push", "-h"];
  await command.parseAsync(process.argv);
  expect(log.mock.lastCall).toMatchInlineSnapshot(`
    [
      
    "component push-components

    Push components to remote repository

    Agent Parameters
          --url             URL of the remote repository                    [string]
          --component_name  Name of the component to push        [string] [required]

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
      -h, --help        Show help                                          [boolean]
      -v, --version     Show version number                                [boolean]"
    ,
    ]
  `);

  log.mockRestore();
  exit.mockRestore();
  runAIGNEInChildProcessSpy.mockRestore();
});
