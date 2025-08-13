import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DEFAULT_CHAT_INPUT_KEY } from "@aigne/cli/utils/run-chat-loop.js";
import {
  parseAgentInputByCommander,
  runAgentWithAIGNE,
  runWithAIGNE,
} from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { parse } from "yaml";
import { z } from "zod";
import { mockModule } from "../_mocks_/mock-module.js";

test("runWithAIGNE should run agent correctly", async () => {
  await runWithAIGNE(
    (aigne) => {
      expect(logger.level).toBe(LogLevel.DEBUG);

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
  spyOn(process, "exit").mockReturnValueOnce(undefined as never);

  await using _ = await mockModule("node:tty", () => ({
    isatty: () => false,
  }));

  await runWithAIGNE(
    () => {
      const agent = AIAgent.from({});

      return agent;
    },
    {
      argv: ["aigne", "run", "--chat"],
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

test("parseAgentInputByCommander should parse input correctly", async () => {
  const agent = AIAgent.from({
    inputSchema: z.object({
      name: z.string(),
      age: z.number().int(),
    }),
  });

  const testInputFile = join(import.meta.dirname, "run-with-aigne-test-input.txt");
  const testInputContent = await readFile(testInputFile, "utf-8");

  // default input key is DEFAULT_CHAT_INPUT_KEY
  expect(
    parseAgentInputByCommander(agent, {
      input: ["Hello!"],
      argv: ["", ""],
    }),
  ).resolves.toEqual({
    [DEFAULT_CHAT_INPUT_KEY]: "Hello!",
  });

  // input with @file argument
  expect(
    parseAgentInputByCommander(agent, {
      input: ["Hello!"],
      inputKey: "message",
      argv: ["", "", "--input-name", `@${testInputFile}`, "--input-age", "30"],
    }),
  ).resolves.toEqual({
    name: testInputContent,
    age: 30,
    message: "Hello!",
  });

  // input @file not exists
  expect(
    parseAgentInputByCommander(agent, {
      argv: [
        "",
        "",
        "--input-name",
        `@${join(import.meta.dirname, "run-with-aigne-test-input-not-exists.txt")}`,
        "--input-age",
        "30",
      ],
    }),
  ).rejects.toThrow("no such file or directory");

  // parse input from file with json format
  const testInputFileJson = join(import.meta.dirname, "run-with-aigne-test-input.json");
  const testInputContentJson = JSON.parse(await readFile(testInputFileJson, "utf-8"));

  expect(
    parseAgentInputByCommander(agent, {
      input: [`@${testInputFileJson}`],
      format: "json",
      argv: ["", ""],
    }),
  ).resolves.toEqual(testInputContentJson);

  // parse input from file with yaml format
  const testInputFileYaml = join(import.meta.dirname, "run-with-aigne-test-input.yaml");
  const testInputContentYaml = parse(await readFile(testInputFileYaml, "utf-8"));

  expect(
    parseAgentInputByCommander(agent, {
      input: [`@${testInputFileYaml}`],
      format: "yaml",
      argv: ["", ""],
    }),
  ).resolves.toEqual(testInputContentYaml);
});

test("runAgentWithAIGNE should support output option", async () => {
  const aigne = new AIGNE({});

  const agent = FunctionAgent.from(() => {
    return {
      message: "This is a test response from FunctionAgent",
    };
  });

  const tmp = tmpdir();
  const outputFile = join(tmp, `${randomUUID()}.test.local`);
  await writeFile(outputFile, "hello", "utf-8");
  await runAgentWithAIGNE(aigne, agent, { input: {}, output: outputFile, force: true });
  expect(await readFile(outputFile, "utf-8")).toEqual("This is a test response from FunctionAgent");
});

test("runAgentWithAIGNE should throw error if output file is not empty and force is not enabled", async () => {
  const aigne = new AIGNE({});

  const agent = FunctionAgent.from(() => {
    return {
      message: "This is a test response from FunctionAgent",
    };
  });

  const tmp = tmpdir();
  const outputFile = join(tmp, `${randomUUID()}.test.local`);
  await writeFile(outputFile, "hello", "utf-8");

  expect(runAgentWithAIGNE(aigne, agent, { input: {}, output: outputFile })).rejects.toThrow(
    "already exists. Use --force to overwrite.",
  );
});
