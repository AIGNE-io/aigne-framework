import { expect, mock, test } from "bun:test";
import { join, relative } from "node:path";
import { UserAgent } from "@aigne/core";
import { createRunCommand } from "../../src/commands/run.js";

test("run command should call run chat loop correctly", async () => {
  const runChatLoopInTerminal = mock();

  mock.module("@aigne/core/utils/run-chat-loop.js", () => {
    return { runChatLoopInTerminal };
  });

  const command = createRunCommand();

  const chatAgentPath = join(import.meta.dirname, "chat");

  // should run in current directory
  const cwd = process.cwd();
  process.chdir(chatAgentPath);
  await command.parseAsync(["", "run"]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );
  process.chdir(cwd);

  // should run in specified directory
  await command.parseAsync(["", "run", chatAgentPath]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );

  // should run in specified directory of relative path
  const relativePath = relative(cwd, chatAgentPath);
  await command.parseAsync(["", "run", relativePath]);
  expect(runChatLoopInTerminal).toHaveBeenNthCalledWith(
    1,
    expect.any(UserAgent),
    expect.objectContaining({}),
  );
});
