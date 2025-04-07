import { expect, mock, spyOn, test } from "bun:test";
import { AIAgent, ExecutionEngine, UserAgent, createMessage } from "@aigne/core";
import { runChatLoopInTerminal } from "@aigne/core/utils/run-chat-loop.js";
import inquirer from "inquirer";

test("runChatLoopInTerminal should respond /help /exit commands", async () => {
  const engine = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    context: engine.newContext(),
    process: () => ({ text: "hello" }),
  });

  const log = mock(() => {});

  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/help" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );
  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/exit" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );

  const result = runChatLoopInTerminal(userAgent, { log });
  expect(result).resolves.toBeUndefined();
  await result;
  expect(log).toHaveBeenCalledTimes(1);
});

test("runChatLoopInTerminal should trigger initial call", async () => {
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
  const agent = AIAgent.from({});

  const engine = new ExecutionEngine({});

  const user = engine.call(agent);

  const log = mock(() => {});

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

  const result = runChatLoopInTerminal(user, { log });
  expect(result).resolves.toBeUndefined();
  await result;
  expect(call).toHaveBeenCalledWith(
    createMessage("hello, this is a test message"),
    expect.anything(),
  );
  expect(log).toHaveBeenCalledWith({ text: "hello, this is a test response message" });
});

test("runChatLoopInTerminal should subscribe user agent stream", async () => {
  const engine = new ExecutionEngine({});

  const user = UserAgent.from({ context: engine.newContext(), subscribeTopic: "test_topic" });

  const log = mock((..._args) => {});
  const onResponse = mock((..._args) => {});

  runChatLoopInTerminal(user, { log, onResponse });
  user.publish("test_topic", "hello, this is a test message");
  // Check the response after a delay to allow the event loop to run
  setTimeout(() => {
    expect(onResponse.mock.calls).toEqual([
      [expect.objectContaining(createMessage("hello, this is a test message"))],
    ]);
  }, 0);
});
