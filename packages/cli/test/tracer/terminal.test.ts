import { expect, spyOn, test } from "bun:test";
import { TerminalTracer } from "@aigne/cli/tracer/terminal.js";
import { AIAgent, ExecutionEngine, createMessage } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";

test("TerminalTracer should work correctly", async () => {
  const model = new OpenAIChatModel({});

  const engine = new ExecutionEngine({ model });
  const context = engine.newContext();

  const testAgent = AIAgent.from({});

  spyOn(model, "process").mockReturnValue(
    Promise.resolve({ text: "hello, this is a test response message" }),
  );

  const userAgent = engine.call(testAgent);

  const tracer = new TerminalTracer(context);

  const { result } = await tracer.run(userAgent, createMessage("hello"));

  expect(result).toMatchSnapshot();
});

test("TerminalTracer should raise error correctly", async () => {
  const engine = new ExecutionEngine();
  const context = engine.newContext();

  const testAgent = AIAgent.from({});

  spyOn(testAgent, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([new Error("test error")]),
  );

  const userAgent = engine.call(testAgent);

  const tracer = new TerminalTracer(context);

  const result = tracer.run(userAgent, createMessage("hello"));

  expect(result).rejects.toThrowError("test error");
});

test("TerminalTracer should render output message with markdown highlight", async () => {
  const model = new OpenAIChatModel({});

  const engine = new ExecutionEngine({ model });
  const context = engine.newContext();

  const testAgent = AIAgent.from({});

  spyOn(model, "process").mockReturnValue(
    Promise.resolve({ text: "## Hello\nI am from [**AIGNE**](https://www.aigne.io)" }),
  );

  const userAgent = engine.call(testAgent);

  const tracer = new TerminalTracer(context);

  const formatAIResponse = spyOn(tracer, "formatAIResponse");

  await tracer.run(userAgent, createMessage("hello"));

  expect(formatAIResponse.mock.results.at(-1)).toMatchSnapshot();
});
