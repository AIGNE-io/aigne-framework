import { expect, spyOn, test } from "bun:test";
import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, AIGNE, UserAgent } from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";
import inquirer from "inquirer";

test("runChatLoopInTerminal should respond /help /exit commands", async () => {
  const aigne = new AIGNE({});

  const userAgent = UserAgent.from({
    context: aigne.newContext(),
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
  const aigne = new AIGNE({});

  const agent = AIAgent.from({
    inputKey: "message",
  });

  const user = aigne.invoke(agent);

  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/exit" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );

  const agentProcess = spyOn(agent, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([
      { delta: { json: { text: "hello, this is a test response message" } } },
    ]),
  );

  const result = runChatLoopInTerminal(user, {
    initialCall: "hello, this is a test message",
  });
  expect(await result).toBeUndefined();
  expect(agentProcess).toHaveBeenCalledWith(
    { message: "hello, this is a test message" },
    expect.anything(),
  );
});

test("runChatLoopInTerminal should invoke agent correctly", async () => {
  const agent = AIAgent.from({
    inputKey: "message",
  });

  const aigne = new AIGNE({});

  const userAgent = aigne.invoke(agent);

  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "hello, this is a test message" }) as unknown as ReturnType<
      typeof inquirer.prompt
    >,
  );
  spyOn(inquirer, "prompt").mockReturnValueOnce(
    Promise.resolve({ question: "/exit" }) as unknown as ReturnType<typeof inquirer.prompt>,
  );

  const agentProcess = spyOn(agent, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([
      { delta: { json: { text: "hello, this is a test response message" } } },
    ]),
  );

  expect(await runChatLoopInTerminal(userAgent)).toBeUndefined();
  expect(agentProcess).toHaveBeenCalledWith(
    { message: "hello, this is a test message" },
    expect.anything(),
  );
});
