import { expect, spyOn, test } from "bun:test";
import { is, runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, UserAgent, createMessage } from "@aigne/core";
import inquirer from "inquirer";

test("runChatLoopInTerminal should respond /help /exit commands", async () => {
  spyOn(is, "CI").mockReturnValue(false);

  const engine = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    context: engine.newContext(),
    process: () => ({ text: "hello" }),
  });

  const log = spyOn(console, "log").mockImplementation(() => {});

  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/help" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );
  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/exit" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );

  const result = runChatLoopInTerminal(userAgent);
  expect(result).resolves.toBeUndefined();
  await result;
  expect(log).toHaveBeenCalledTimes(1);
});

test("runChatLoopInTerminal should trigger initial call", async () => {
  spyOn(is, "CI").mockReturnValue(false);

  const engine = new ExecutionEngine({});

  const agent = AIAgent.from({});

  const user = engine.call(agent);

  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/exit" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );

  const call = spyOn(agent, "call").mockReturnValue(
    Promise.resolve({ text: "hello, this is a test response message" }),
  );

  const result = runChatLoopInTerminal(user, {
    initialCall: "hello, this is a test message",
  });
  expect(await result).toBeUndefined();
  expect(call).toHaveBeenCalledWith(
    createMessage("hello, this is a test message"),
    expect.anything(),
  );
});

test("runChatLoopInTerminal should call agent correctly", async () => {
  spyOn(is, "CI").mockReturnValue(false);

  const agent = AIAgent.from({});

  const engine = new ExecutionEngine({});

  const userAgent = engine.call(agent);

  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "hello, this is a test message" }) as unknown as ReturnType<
      typeof inquirer.prompt
    >,
  );
  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/exit" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );

  const call = spyOn(agent, "call").mockReturnValue(
    Promise.resolve({ text: "hello, this is a test response message" }),
  );

  expect(await runChatLoopInTerminal(userAgent)).toBeUndefined();
  expect(call).toHaveBeenCalledWith(
    createMessage("hello, this is a test message"),
    expect.anything(),
  );
});

test("runChatLoopInTerminal should work in CI environment", async () => {
  spyOn(is, "CI").mockReturnValue(true);

  const engine = new ExecutionEngine({});
  const agent = AIAgent.from({});
  const userAgent = engine.call(agent);

  const call = spyOn(agent, "call").mockReturnValue(
    Promise.resolve({ text: "CI environment response" }),
  );

  const log = spyOn(console, "log").mockImplementation(() => {});

  await runChatLoopInTerminal(userAgent, {
    initialCall: "test message in CI",
  });

  expect(call).toHaveBeenCalledWith(createMessage("test message in CI"), expect.anything());
  expect(log).toHaveBeenCalledWith({ text: "CI environment response" });

  await runChatLoopInTerminal(userAgent, {
    defaultQuestion: "default question in CI",
  });

  expect(call).toHaveBeenCalledWith(createMessage("default question in CI"), expect.anything());
  expect(log).toHaveBeenCalledWith({ text: "CI environment response" });
});
