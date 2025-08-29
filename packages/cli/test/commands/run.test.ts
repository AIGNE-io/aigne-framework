import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, relative, resolve } from "node:path";
import { createRunCommand } from "@aigne/cli/commands/run.js";
import { AIGNE } from "@aigne/core";
import yargs from "yargs";
import { mockAIGNEPackage, mockAIGNEV1Package } from "../_mocks_/mock-aigne-package.js";
import { mockModule } from "../_mocks_/mock-module.js";

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
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule(
    resolve(import.meta.dirname, "../../src/utils/run-with-aigne.js"),
    () => ({ runAgentWithAIGNE }),
  );

  const command = yargs().command(createRunCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  // should run in current directory
  process.argv = ["", "", "", "chat"];

  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["run"]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(1);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
  process.chdir(cwd);

  // should run in specified directory
  await command.parseAsync(["run", testAgentsPath]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(2);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );

  // should run in specified directory of relative path
  const relativePath = relative(cwd, testAgentsPath);
  await command.parseAsync(["run", relativePath]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(3);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
});

test("run command should download package and run correctly", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-with-aigne.js", () => {
    return { runAgentWithAIGNE };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = yargs().command(createRunCommand());

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  process.argv = ["", "", "", "chat"];
  await command.parseAsync(["run", url.toString()]);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
});

test("run command should convert package from v1 and run correctly", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-with-aigne.js", () => {
    return { runAgentWithAIGNE };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEV1Package())),
  );

  const command = yargs().command(createRunCommand());

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  process.argv = ["", "", "", "chat"];
  await command.parseAsync(["run", url.toString()]);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
});

test("run command should parse model options correctly", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-with-aigne.js", () => {
    return { runAgentWithAIGNE };
  });

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const command = yargs().command(createRunCommand());

  process.argv = ["", "", "", "chat", "--model", "xai:test-model"];
  await command.parseAsync(["run", testAgentsPath]);

  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
});
