import { expect, spyOn, test } from "bun:test";
import { TerminalTracer } from "@aigne/cli/tracer/terminal.js";
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
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

  const tracer = new TerminalTracer(context, { printRequest: true });

  const { result } = await tracer.run(userAgent, { message: "hello" });

  expect(result).toMatchSnapshot();
});

test("TerminalTracer should raise error correctly", async () => {
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

test("TerminalTracer should", async () => {
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

  spyOn(prompts, "input").mockReturnValueOnce(Promise.resolve("John Doe") as any);
  spyOn(prompts, "number").mockReturnValueOnce(Promise.resolve(18) as any);
  spyOn(prompts, "select").mockReturnValueOnce(Promise.resolve("red") as any);

  const { result } = await tracer.run(agent, {});

  expect(result).toEqual({
    name: "John Doe",
    age: 18,
    color: "red",
  });
});
