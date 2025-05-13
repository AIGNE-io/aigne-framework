import { expect, mock, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { rm, stat } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { createRunCommand } from "@aigne/cli/commands/run.js";
import { UserAgent } from "@aigne/core";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";
import { mockAIGNEPackage, mockAIGNEV1Package } from "../_mocks_/mock-aigne-package.js";
import { mockModule } from "../_mocks_/mock-module.js";

test("run command should call run chat loop correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule(
    resolve(import.meta.dirname, "../../src/utils/run-chat-loop.js"),
    () => ({ runChatLoopInTerminal }),
  );

  const command = createRunCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  // should run in current directory
  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["", "run"]);
  expect(runChatLoopInTerminal).toHaveBeenCalledTimes(1);
  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));
  process.chdir(cwd);

  // should run in specified directory
  await command.parseAsync(["", "run", testAgentsPath]);
  expect(runChatLoopInTerminal).toHaveBeenCalledTimes(2);
  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));

  // should run in specified directory of relative path
  const relativePath = relative(cwd, testAgentsPath);
  await command.parseAsync(["", "run", relativePath]);
  expect(runChatLoopInTerminal).toHaveBeenCalledTimes(3);
  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));

  // should run specified agent
  await command.parseAsync(["", "run", testAgentsPath, "--agent", "chat"]);
  expect(runChatLoopInTerminal).toHaveBeenCalledTimes(4);
  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));

  // should error if agent not found
  spyOn(console, "error").mockReturnValueOnce(undefined);
  expect(command.parseAsync(["", "run", testAgentsPath, "--agent", "chat1"])).rejects.toThrow(
    "not found",
  );
});

test("run command should download package and run correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = createRunCommand();

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  await command.parseAsync(["", "run", url.toString()]);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));
});

test("run command should convert package from v1 and run correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEV1Package())),
  );

  const command = createRunCommand();

  const url = new URL(`https://www.aigne.io/${randomUUID()}/test-agents.tgz`);

  await command.parseAsync(["", "run", url.toString()]);

  const path = join(homedir(), ".aigne", url.hostname, url.pathname);
  expect((await stat(join(path, "aigne.yaml"))).isFile()).toBeTrue();

  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));
});

test("run command should download package to a special folder", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = createRunCommand();

  const url = `https://www.aigne.io/${randomUUID()}/test-agents.tgz`;
  const dir = join(tmpdir(), randomUUID());

  try {
    await command.parseAsync(["", "run", url, "--download-dir", dir]);

    expect((await stat(join(dir, "aigne.yaml"))).isFile()).toBeTrue();
    expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(expect.any(UserAgent));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("run command should parse model options correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule("@aigne/cli/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const command = createRunCommand();

  await command.parseAsync([
    "",
    "run",
    testAgentsPath,
    "--model-provider",
    "xai",
    "--model-name",
    "test-model",
  ]);

  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(
    expect.objectContaining({
      context: expect.objectContaining({
        model: expect.any(XAIChatModel),
      }),
    }),
  );

  expect(
    command.parseAsync(["", "run", testAgentsPath, "--model-name", "test-model"]),
  ).rejects.toThrow("please specify --model-provider when using the --model-name option");
});
