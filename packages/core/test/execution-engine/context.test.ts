import { expect, mock, test } from "bun:test";
import {
  AIAgent,
  ExecutionEngine,
  type MessageQueueListener,
  createMessage,
  createPublishMessage,
} from "@aigne/core";

test("ExecutionContext should subscribe/unsubscribe correctly", async () => {
  const context = new ExecutionEngine({}).newContext();

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

test("ExecutionContext should emit/on correctly", async () => {
  for (const listenMethod of ["on", "once"] as const) {
    const agent = AIAgent.from({});

    const parentContext = new ExecutionEngine({}).newContext();
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
