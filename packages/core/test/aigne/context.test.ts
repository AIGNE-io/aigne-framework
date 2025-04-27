import { expect, mock, spyOn, test } from "bun:test";
import {
  AIAgent,
  AIGNE,
  type ContextEventMap,
  type MessageQueueListener,
  createMessage,
  createPublishMessage,
} from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";
import type { Listener } from "@aigne/core/utils/typed-event-emtter";

test("AIGNEContext should subscribe/unsubscribe correctly", async () => {
  const context = new AIGNE({}).newContext();

  const listener: MessageQueueListener = mock();

  context.subscribe("test_topic", listener);

  context.publish("test_topic", createPublishMessage("hello"));
  expect(listener).toBeCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(
    expect.objectContaining({ message: createMessage("hello") }),
  );

  context.unsubscribe("test_topic", listener);
  context.publish("test_topic", createPublishMessage("hello"));
  expect(listener).toBeCalledTimes(1);
});

test("AIGNEContext should emit/on correctly", async () => {
  for (const listenMethod of ["on", "once"] as const) {
    const agent = AIAgent.from({});

    const parentContext = new AIGNE({}).newContext();
    const context = parentContext.newContext();

    const onAgentStarted = mock();
    const onAgentSucceed = mock();
    const onAgentFailed = mock();

    parentContext[listenMethod]("agentStarted", onAgentStarted);
    parentContext[listenMethod]("agentSucceed", onAgentSucceed);
    parentContext[listenMethod]("agentFailed", onAgentFailed);

    context.emit("agentStarted", { agent, input: createMessage("hello") });
    expect(onAgentStarted).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contextId: context.id,
        parentContextId: parentContext.id,
        agent,
        input: createMessage("hello"),
      }),
    );

    context.emit("agentSucceed", { agent, output: createMessage("hello") });
    expect(onAgentSucceed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contextId: context.id,
        parentContextId: parentContext.id,
        agent,
        output: createMessage("hello"),
      }),
    );

    context.emit("agentFailed", { agent, error: new Error("test error") });
    expect(onAgentFailed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contextId: context.id,
        parentContextId: parentContext.id,
        agent,
        error: new Error("test error"),
      }),
    );

    if (listenMethod !== "once") {
      parentContext.off("agentStarted", onAgentStarted);
      parentContext.off("agentSucceed", onAgentSucceed);
      parentContext.off("agentFailed", onAgentFailed);
    }

    expect(parentContext.internal.messageQueue.events.listenerCount("agentStarted")).toBe(0);
    expect(parentContext.internal.messageQueue.events.listenerCount("agentSucceed")).toBe(0);
    expect(parentContext.internal.messageQueue.events.listenerCount("agentFailed")).toBe(0);
  }
});

test("AIGNEContext should receive agentStarted/agentSucceed/agentFailed message", async () => {
  const agent = AIAgent.from({});

  const parentContext = new AIGNE({}).newContext();
  const context = parentContext.newContext();

  const onAgentStarted: Listener<"agentStarted", ContextEventMap> = mock();
  const onAgentSucceed: Listener<"agentSucceed", ContextEventMap> = mock();
  const onAgentFailed: Listener<"agentFailed", ContextEventMap> = mock();

  context.on("agentStarted", onAgentStarted);
  context.on("agentSucceed", onAgentSucceed);
  context.on("agentFailed", onAgentFailed);

  spyOn(agent, "process")
    .mockReturnValueOnce(
      arrayToAgentProcessAsyncGenerator([
        { delta: { json: createMessage("hello, this is a test response message") } },
      ]),
    )
    .mockReturnValueOnce(arrayToAgentProcessAsyncGenerator([new Error("test error")]));

  const result1 = context.invoke(agent, "hello");

  expect(result1).resolves.toEqual(createMessage("hello, this is a test response message"));
  expect(onAgentStarted).toHaveBeenLastCalledWith(
    expect.objectContaining({
      contextId: expect.any(String),
      parentContextId: context.id,
      agent,
      input: expect.objectContaining(createMessage("hello")),
    }),
  );
  expect(onAgentSucceed).toHaveBeenLastCalledWith(
    expect.objectContaining({
      contextId: expect.any(String),
      parentContextId: context.id,
      agent,
      output: expect.objectContaining(createMessage("hello, this is a test response message")),
    }),
  );

  const result2 = context.invoke(agent, "hello");

  expect(result2).rejects.toThrowError("test error");
  expect(onAgentFailed).toHaveBeenLastCalledWith(
    expect.objectContaining({
      contextId: expect.any(String),
      parentContextId: context.id,
      agent,
      error: expect.objectContaining({
        message: "test error",
      }),
    }),
  );
});
