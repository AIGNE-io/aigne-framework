import { expect, mock, spyOn, test } from "bun:test";
import { join, relative } from "node:path";
import { createRunCommand } from "@aigne/cli/commands/run.js";
import { UserAgent } from "@aigne/core";
import { mockModule } from "@aigne/test-utils/mock-module.js";
import { mockAIGNEPackage } from "../_mocks_/mock-aigne-package.js";

test("run command should call run chat loop correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule("@aigne/core/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  const command = createRunCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  // should run in current directory
  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["", "run"]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );
  process.chdir(cwd);

  // should run in specified directory
  await command.parseAsync(["", "run", testAgentsPath]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );

  // should run in specified directory of relative path
  const relativePath = relative(cwd, testAgentsPath);
  await command.parseAsync(["", "run", relativePath]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );

  // should run specified agent
  await command.parseAsync(["", "run", testAgentsPath, "--agent", "chat"]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );

  // should error if agent not found
  spyOn(console, "error").mockReturnValueOnce(undefined);
  expect(command.parseAsync(["", "run", testAgentsPath, "--agent", "chat1"])).rejects.toThrow(
    "not found",
  );
});

test("run command should download package and run correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule("@aigne/core/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(await mockAIGNEPackage())),
  );

  const command = createRunCommand();

  const url = "https://www.aigne.io/projects/xxx/test-agents.tgz";

  await command.parseAsync(["", "run", url]);

  expect(runChatLoopInTerminal).toHaveBeenLastCalledWith(
    expect.any(UserAgent),
    expect.objectContaining({}),
  );
});
