import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { resolve } from "node:path";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { mockModule } from "../_mocks_/mock-module.js";

test("runWithAIGNE should run agent correctly", async () => {
  await runWithAIGNE(
    (aigne) => {
      expect(logger.level).toBe(LogLevel.DEBUG);

      expect(aigne.model).toBeInstanceOf(OpenAIChatModel);

      assert(aigne.model);

      spyOn(aigne.model, "process").mockReturnValueOnce({
        text: "hello, this is a test response message",
      });

      const agent = AIAgent.from({});

      return agent;
    },
    {
      argv: ["", "", "--log-level", "debug"],
      chatLoopOptions: {
        defaultQuestion: "hello",
      },
    },
  );
});

test("runWithAIGNE should exit with error code when run --chat in non-tty environment", async () => {
  const error = spyOn(console, "error").mockReturnValueOnce(undefined as never);
  const exit = spyOn(process, "exit").mockReturnValueOnce(undefined as never);

  await using _ = await mockModule("node:tty", () => ({
    isatty: () => false,
  }));

  await runWithAIGNE(
    () => {
      const agent = AIAgent.from({});

      return agent;
    },
    {
      argv: ["", "", "--chat"],
    },
  );

  expect(error.mock.lastCall?.[0]).toMatch("--chat mode requires a TTY");

  expect(exit).toHaveBeenCalledWith(1);
  expect(exit).toHaveBeenLastCalledWith(1);
});

test.each([
  [["--log-level", "foo"], "--log-level Invalid enum value"],
  [["--temperature", "not_a_valid_number"], "--temperature Expected number, received nan"],
  [["--top-p", "not_a_valid_number"], "--top-p Expected number, received nan"],
  [
    ["--presence-penalty", "not_a_valid_number"],
    "--presence-penalty Expected number, received nan",
  ],
  [
    ["--frequency-penalty", "not_a_valid_number"],
    "--frequency-penalty Expected number, received nan",
  ],
])(
  "runWithAIGNE should exit with error code for invalid options %p",
  async (args, errorMessage) => {
    const error = spyOn(console, "error").mockReturnValueOnce(undefined as never);
    const exit = spyOn(process, "exit").mockReturnValueOnce(undefined as never);

    await using _ = await mockModule("node:tty", () => ({
      isatty: () => false,
    }));

    await runWithAIGNE(
      () => {
        const agent = AIAgent.from({});

        return agent;
      },
      {
        argv: ["", "", ...args],
      },
    );

    expect(error.mock.lastCall?.[0]).toMatch(errorMessage);

    expect(exit).toHaveBeenCalledWith(1);
    expect(exit).toHaveBeenLastCalledWith(1);
  },
);

test("runWithAIGNE should run chat loop correctly", async () => {
  const runChatLoopInTerminal = mock();

  await using _ = await mockModule(
    resolve(import.meta.dirname, "../../src/utils/run-chat-loop.js"),
    () => ({ runChatLoopInTerminal }),
  );

  await using _mockTTY = await mockModule("node:tty", () => ({
    isatty: () => true,
  }));

  await runWithAIGNE(
    () => {
      const agent = AIAgent.from({});

      return agent;
    },
    {
      argv: ["", "", "--chat"],
    },
  );

  expect(runChatLoopInTerminal).toHaveBeenCalledTimes(1);
});
