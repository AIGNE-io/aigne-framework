import { expect, spyOn, test } from "bun:test";
import { TerminalTracer } from "@aigne/cli/tracer/terminal.js";
import { AIAgent, ExecutionEngine, createMessage } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

test("TerminalTracer should work correctly", async () => {
  const model = new OpenAIChatModel({});

  const engine = new ExecutionEngine({ model });
  const context = engine.newContext();

  const testAgent = AIAgent.from({});

  spyOn(model, "process").mockReturnValue(
    Promise.resolve({ text: "hello, this is a test response message" }),
  );

  const userAgent = engine.call(testAgent);

  const tracer = new TerminalTracer(context, { verbose: true });

  const { result } = await tracer.run(userAgent, createMessage("hello"));

  expect(result).toEqual(
    expect.objectContaining({
      $message: "hello, this is a test response message",
    }),
  );
});

test("TerminalTracer should raise error correctly", async () => {
  const engine = new ExecutionEngine();
  const context = engine.newContext();

  const testAgent = AIAgent.from({});

  spyOn(testAgent, "process").mockReturnValue(Promise.reject(new Error("test error")));

  const userAgent = engine.call(testAgent);

  const tracer = new TerminalTracer(context, { verbose: true });

  const result = tracer.run(userAgent, createMessage("hello"));

  expect(result).rejects.toThrowError("test error");
});
