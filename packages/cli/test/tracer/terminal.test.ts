import { expect, spyOn, test } from "bun:test";
import { TerminalTracer } from "@aigne/cli/tracer/terminal.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";

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

  expect(
    tracer.formatResult(new AIAgent({ inputKey: "message" }), context, {
      message: "## Hello\nI am from [**AIGNE**](https://www.aigne.io)",
    }),
  ).toMatchSnapshot();
});
