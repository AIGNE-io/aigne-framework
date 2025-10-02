import { expect, spyOn, test } from "bun:test";
import { AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE } from "@aigne/cli/constants.js";
import { TerminalTracer } from "@aigne/cli/tracer/terminal.js";
import * as terminalInput from "@aigne/cli/ui/utils/terminal-input";
import { type AgentInvokeOptions, AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";
import * as prompts from "@inquirer/prompts";

test("TerminalTracer should work correctly", async () => {
  const model = new OpenAIChatModel({});

  const aigne = new AIGNE({ model });
  const context = aigne.newContext();

  const testAgent = AIAgent.from({
    inputKey: "message",
  });

  spyOn(model, "process").mockReturnValue(
    Promise.resolve({ text: "hello, this is a test response message" }),
  );

  const userAgent = aigne.invoke(testAgent);

  const tracer = new TerminalTracer(context);

  const { result } = await tracer.run(userAgent, { message: "hello" });

  expect(result).toMatchSnapshot();
});

test("TerminalTracer should raise error correctly", async () => {
  logger.level = LogLevel.INFO;
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const testAgent = AIAgent.from({
    inputKey: "message",
  });

  spyOn(testAgent, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([new Error("test error")]),
  );

  const userAgent = aigne.invoke(testAgent);

  const tracer = new TerminalTracer(context);

  const result = tracer.run(userAgent, { message: "hello" });

  expect(result).rejects.toThrowError("test error");
});

test("TerminalTracer should render output message with markdown highlight", async () => {
  const model = new OpenAIChatModel({});

  const aigne = new AIGNE({ model });
  const context = aigne.newContext();

  const tracer = new TerminalTracer(context);

  const originalIsTTY = process.stdout.isTTY;
  process.stdout.isTTY = true;

  expect(
    tracer.formatResult(new AIAgent({ inputKey: "message" }), context, {
      message: "## Hello\nI am from [**AIGNE**](https://www.aigne.io)",
    }),
  ).toMatchSnapshot();

  process.stdout.isTTY = originalIsTTY;
});

test("TerminalTracer should render output message without markdown highlight in non-tty", async () => {
  logger.level = LogLevel.INFO;
  const model = new OpenAIChatModel({});

  const aigne = new AIGNE({ model });
  const context = aigne.newContext();

  const tracer = new TerminalTracer(context);

  const originalIsTTY = process.stdout.isTTY;
  process.stdout.isTTY = false;

  expect(
    tracer.formatResult(new AIAgent({ outputKey: "message" }), context, {
      message: "## Hello\nI am from [**AIGNE**](https://www.aigne.io)",
    }),
  ).toMatchSnapshot();

  process.stdout.isTTY = originalIsTTY;
});

test("TerminalTracer.marked should stripe code block meta", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const tracer = new TerminalTracer(context);

  expect(
    tracer["marked"].parse(`\
hello

${"```"}ts file="test.ts" region="test-region"
function test() {
}
${"```"}
`),
  ).toMatchSnapshot();
});

test("TerminalTracer should add prompts for user input", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const agent = FunctionAgent.from(async (_, options) => {
    const name = await options.prompts?.input({ message: "What is your name?" });
    const age = await options.prompts?.number({ message: "What is your age?" });
    const color = await options.prompts?.select({
      message: "What is your favorite color?",
      choices: ["red", "green", "blue"],
    });

    return { name, age, color };
  });

  const tracer = new TerminalTracer(context);

  const input = spyOn(terminalInput, "terminalInput").mockResolvedValueOnce("John Doe");
  const number = spyOn(prompts, "number").mockReturnValueOnce(Promise.resolve(18) as any);
  const select = spyOn(prompts, "select").mockReturnValueOnce(Promise.resolve("red") as any);

  const { result } = await tracer.run(agent, {});

  expect(result).toEqual({
    name: "John Doe",
    age: 18,
    color: "red",
  });

  input.mockRestore();
  number.mockRestore();
  select.mockRestore();
});

test("TerminalTracer should add prompts whether taskRenderMode is hide/collapse", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const agent = FunctionAgent.from(async (_, options: AgentInvokeOptions) => {
    await options.context.invoke((options.context.agents as any)["child"], {}, options);
    return {};
  });
  const child = FunctionAgent.from(function child() {
    return {};
  });

  aigne.addAgent(child);

  const agentSpy = spyOn(agent, "process");
  const childSpy = spyOn(child, "process");

  const tracer = new TerminalTracer(context);

  agent.taskRenderMode = "hide";
  await tracer.run(agent, {});

  expect(agentSpy.mock.lastCall?.[1].prompts?.input).toBeFunction();
  expect(childSpy.mock.lastCall?.[1].prompts?.input).toBeFunction();
});

test("TerminalTracer should handle buy credits prompt", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const agent = FunctionAgent.from(() => ({}));

  const tracer = new TerminalTracer(context);

  const promptBuyCredits = spyOn(tracer, "promptBuyCredits").mockResolvedValueOnce("retry");

  spyOn(agent, "process")
    .mockImplementationOnce(() => {
      const e = new Error("You need to buy credits to continue.");
      (e as any).type = AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE;
      throw e;
    })
    .mockReturnValueOnce({ text: "This is a response after buying credits" });

  const result = await tracer.run(agent, {});

  expect(result.result).toEqual({ text: "This is a response after buying credits" });
  expect(promptBuyCredits).toHaveBeenCalledTimes(1);
});

test("TerminalTracer should exit if user choose exit for buy credits", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const agent = FunctionAgent.from(() => ({}));

  const tracer = new TerminalTracer(context);

  const promptBuyCredits = spyOn(tracer, "promptBuyCredits")
    .mockResolvedValueOnce("retry")
    .mockResolvedValueOnce("exit");

  const process = spyOn(agent, "process")
    .mockImplementationOnce(() => {
      const e = new Error("You need to buy credits to continue.");
      (e as any).type = AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE;
      throw e;
    })
    .mockImplementationOnce(() => {
      const e = new Error("You need to buy credits to continue.");
      (e as any).type = AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE;
      throw e;
    });

  expect(tracer.run(agent, {})).rejects.toThrowError("You need to buy credits to continue.");
  expect(process).toHaveBeenCalledTimes(2);
  expect(promptBuyCredits).toHaveBeenCalledTimes(2);
});

test("TerminalTracer should exit if user choose exit for buy credits", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const tracer = new TerminalTracer(context);

  const select = spyOn(prompts, "select")
    .mockResolvedValueOnce("exit")
    .mockResolvedValueOnce("retry");
  expect(await tracer["promptBuyCredits"](new Error("You need to buy credits to continue."))).toBe(
    "exit",
  );
  expect(await tracer["promptBuyCredits"](new Error("You need to buy credits to continue."))).toBe(
    "retry",
  );

  select.mockRestore();
});

test("TerminalTracer should hold only one prompt at a time", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const tracer = new TerminalTracer(context);

  const start = Promise.withResolvers();

  const select = spyOn(prompts, "select").mockImplementationOnce((async () => {
    await start.promise;
    return "retry";
  }) as any);

  const results = Promise.all(
    new Array(10)
      .fill(0)
      .map(() => tracer["promptBuyCredits"](new Error("You need to buy credits to continue."))),
  );

  start.resolve();

  expect(await results).toEqual(new Array(10).fill("retry"));
  expect(select).toHaveBeenCalledTimes(1);

  select.mockRestore();
});
