import { expect, mock, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { rm, stat } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { createRunCommand } from "@aigne/cli/commands/run.js";
import { AIGNE } from "@aigne/core";
import { mockAIGNEPackage, mockAIGNEV1Package } from "../_mocks_/mock-aigne-package.js";
import { mockModule } from "../_mocks_/mock-module.js";

test("run command should call run chat loop correctly", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule(
    resolve(import.meta.dirname, "../../src/utils/run-with-aigne.js"),
    () => ({ runAgentWithAIGNE }),
  );

  const command = createRunCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  // should run in current directory
  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["", "run"]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(1);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
  process.chdir(cwd);

  // should run in specified directory
  await command.parseAsync(["", "run", "--path", testAgentsPath]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(2);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );

  // should run in specified directory of relative path
  const relativePath = relative(cwd, testAgentsPath);
  await command.parseAsync(["", "run", "--path", relativePath]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(3);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );

  // should run specified agent
  await command.parseAsync(["", "run", "--path", testAgentsPath, "--entry-agent", "chat"]);
  expect(runAgentWithAIGNE).toHaveBeenCalledTimes(4);
  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );

  // should error if agent not found
  spyOn(console, "error").mockReturnValueOnce(undefined);
  expect(
    command.parseAsync(["", "run", "--path", testAgentsPath, "--entry-agent", "chat1"]),
  ).rejects.toThrow("not found");
});

test("run command should download package and run correctly", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-with-aigne.js", () => {
    return { runAgentWithAIGNE };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = createRunCommand();

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  await command.parseAsync(["", "run", "--url", url.toString()]);

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

  const command = createRunCommand();

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  await command.parseAsync(["", "run", "--url", url.toString()]);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
});

test("run command should download package to a special folder", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-with-aigne.js", () => {
    return { runAgentWithAIGNE };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = createRunCommand();

  const url = `https://www.aigne.io/${randomUUID()}/test-agents.tgz`;
  const dir = join(tmpdir(), randomUUID());

  try {
    await command.parseAsync(["", "run", "--url", url, "--cache-dir", dir]);

    expect((await stat(join(dir, "aigne.yaml"))).isFile()).toBeTrue();
    expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
      expect.any(AIGNE),
      expect.anything(),
      expect.objectContaining({}),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("run command should parse model options correctly", async () => {
  const runAgentWithAIGNE = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-with-aigne.js", () => {
    return { runAgentWithAIGNE };
  });

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const command = createRunCommand();

  await command.parseAsync(["", "run", "--path", testAgentsPath, "--model", "xai:test-model"]);

  expect(runAgentWithAIGNE).toHaveBeenLastCalledWith(
    expect.any(AIGNE),
    expect.anything(),
    expect.objectContaining({}),
  );
});
