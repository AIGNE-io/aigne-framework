import { expect, mock, spyOn, test } from "bun:test";
import {
  AIAgent,
  AIGNE,
  type ContextEventMap,
  FunctionAgent,
  type MessageQueueListener,
} from "@aigne/core";
import {
  arrayToAgentProcessAsyncGenerator,
  readableStreamToArray,
} from "@aigne/core/utils/stream-utils.js";
import type { Listener } from "@aigne/core/utils/typed-event-emitter.js";

test("AIGNEContext should subscribe/unsubscribe correctly", async () => {
  const context = new AIGNE({}).newContext();

  const listener: MessageQueueListener = mock();

  context.subscribe("test_topic", listener);

  context.publish("test_topic", { message: "hello" });
  expect(listener).toBeCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(expect.objectContaining({ message: { message: "hello" } }));

  context.unsubscribe("test_topic", listener);
  context.publish("test_topic", { message: "hello" });
  expect(listener).toBeCalledTimes(1);
});

test("AIGNEContext should emit/on correctly", async () => {
  for (const listenMethod of ["on", "once"] as const) {
    const agent = AIAgent.from({
      inputKey: "message",
    });

    const parentContext = new AIGNE({}).newContext();
    const context = parentContext.newContext();

    const onAgentStarted = mock();
    const onAgentSucceed = mock();
    const onAgentFailed = mock();

    parentContext[listenMethod]("agentStarted", onAgentStarted);
    parentContext[listenMethod]("agentSucceed", onAgentSucceed);
    parentContext[listenMethod]("agentFailed", onAgentFailed);

    context.emit("agentStarted", { agent, input: { message: "hello" } });
    expect(onAgentStarted).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contextId: context.id,
        parentContextId: parentContext.id,
        agent,
        input: { message: "hello" },
      }),
    );

    context.emit("agentSucceed", { agent, output: { message: "hello" } });
    expect(onAgentSucceed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contextId: context.id,
        parentContextId: parentContext.id,
        agent,
        output: { message: "hello" },
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
  const agent = AIAgent.from({
    inputKey: "message",
  });

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
        { delta: { json: { message: "hello, this is a test response message" } } },
      ]),
    )
    .mockReturnValueOnce(arrayToAgentProcessAsyncGenerator([new Error("test error")]));

  const result1 = context.invoke(agent, { message: "hello" });

  expect(result1).resolves.toEqual({ message: "hello, this is a test response message" });
  expect(onAgentStarted).toHaveBeenLastCalledWith(
    expect.objectContaining({
      contextId: expect.any(String),
      parentContextId: context.id,
      agent,
      input: expect.objectContaining({ message: "hello" }),
    }),
  );
  expect(onAgentSucceed).toHaveBeenLastCalledWith(
    expect.objectContaining({
      contextId: expect.any(String),
      parentContextId: context.id,
      agent,
      output: expect.objectContaining({ message: "hello, this is a test response message" }),
    }),
  );

  const result2 = context.invoke(agent, { message: "hello" });

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

test("AIGNEContext should get/set userContext correctly", async () => {
  const context = new AIGNE({}).newContext({ userContext: { userId: "test_user_id" } });
  expect(context.userContext).toEqual({ userId: "test_user_id" });

  context.userContext = { userId: "new_user_id" };
  expect(context.userContext).toEqual({ userId: "new_user_id" });
});

test("AIGNEContext.invoke should update userContext/memories/hooks correctly", async () => {
  const aigne = new AIGNE({});

  const agent = FunctionAgent.from(() => ({}));

  const agentProcess = spyOn(agent, "process");

  await aigne.invoke(
    agent,
    { message: "hello" },
    {
      userContext: { userId: "test_user_id" },
      memories: [{ content: "test memory content" }],
      hooks: { onStart: () => {} },
    },
  );

  expect(agentProcess).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({
      context: expect.objectContaining({
        userContext: { userId: "test_user_id" },
        memories: [{ content: "test memory content" }],
        hooks: [expect.objectContaining({ onStart: expect.any(Function) })],
      }),
    }),
  );
});

test("AIGNEContext.invoke should check output is a record type", async () => {
  const aigne = new AIGNE({});

  // biome-ignore lint/security/noGlobalEval: just for testing
  const agent = FunctionAgent.from(() => eval("4 * 4"));

  expect(
    await readableStreamToArray(await aigne.invoke(agent, {}, { streaming: true }), {
      catchError: true,
    }),
  ).toMatchInlineSnapshot(`
    [
      [Error: expect to return a record type such as {result: ...}, but got (number): 16],
    ]
  `);

  expect(aigne.invoke(agent, {})).rejects.toThrow(
    "expect to return a record type such as {result: ...}, but got (number): 16",
  );
});

test("AIGNEContext.newContext with reset should share events/messageQueue/skills/agents", async () => {
  const agent = FunctionAgent.from(() => ({}));
  const skill = FunctionAgent.from(() => ({}));

  const aigne = new AIGNE({
    agents: [agent],
    skills: [skill],
  });

  const context = aigne.newContext();

  expect(context.agents).toEqual([agent]);
  expect(context.skills).toEqual([skill]);

  const newContext = context.newContext({ reset: true });

  expect(newContext.agents).toEqual([agent]);
  expect(newContext.skills).toEqual([skill]);
  expect(context.messageQueue).toBe(newContext.messageQueue);
  expect(context["internal"].events).toBe(newContext["internal"].events);
});
