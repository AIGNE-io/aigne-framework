import { describe, expect, test } from "bun:test";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { AgentSession } from "../../src/prompt/agent-session.js";

describe("AgentSession", () => {
  test("should load history from AFS and create new message entry", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    if (!historyPath) throw new Error("History module not found");

    await afs.write(`${historyPath}/new`, {
      userId: "user-001",
      sessionId: "session-001",
      agentId: "assistant",
      content: {
        input: { text: "Hello" },
        output: { text: "Hi there!" },
        messages: [
          { role: "user", content: "Hello" },
          { role: "agent", content: "Hi there!" },
        ],
      },
    });

    await afs.write(`${historyPath}/new`, {
      userId: "user-001",
      sessionId: "session-001",
      agentId: "assistant",
      content: {
        input: { text: "How are you?" },
        output: { text: "I'm doing well, thanks!" },
        messages: [
          { role: "user", content: "How are you?" },
          { role: "agent", content: "I'm doing well, thanks!" },
        ],
      },
    });

    const session = new AgentSession({
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      afs,
      maxHistoryItems: 10,
    });

    const messages = await session.getMessages();
    expect(messages).toHaveLength(4);
    expect(messages[0]).toEqual({ role: "user", content: "Hello" });
    expect(messages[1]).toEqual({ role: "agent", content: "Hi there!" });
    expect(messages[2]).toEqual({ role: "user", content: "How are you?" });
    expect(messages[3]).toEqual({ role: "agent", content: "I'm doing well, thanks!" });

    await session.startMessage(
      { text: "What's your name?" },
      { role: "user", content: "What's your name?" },
    );

    await session.appendCurrentMessages({ role: "tool", content: "Looking up name..." });

    await session.endMessage(
      { text: "I'm an AI assistant." },
      { role: "agent", content: "I'm an AI assistant." },
    );

    const allEntries = (
      await afs.list(`${historyPath}/by-session/session-001`, {
        filter: { userId: "user-001", agentId: "assistant" },
      })
    ).data;

    expect(allEntries).toHaveLength(3);
  });

  test("should filter by agentId when loading history", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    if (!historyPath) throw new Error("History module not found");

    await afs.write(`${historyPath}/new`, {
      userId: "user-001",
      sessionId: "session-001",
      agentId: "assistant",
      content: {
        messages: [
          { role: "user", content: "Hello assistant" },
          { role: "agent", content: "Hi!" },
        ],
      },
    });

    await afs.write(`${historyPath}/new`, {
      userId: "user-001",
      sessionId: "session-001",
      agentId: "coder",
      content: {
        messages: [
          { role: "user", content: "Hello coder" },
          { role: "agent", content: "Hi from coder!" },
        ],
      },
    });

    const assistantSession = new AgentSession({
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      afs,
    });

    const assistantMessages = await assistantSession.getMessages();

    expect(assistantMessages).toHaveLength(2);
    expect(assistantMessages[0]).toEqual({ role: "user", content: "Hello assistant" });
    expect(assistantMessages[1]).toEqual({ role: "agent", content: "Hi!" });

    const coderSession = new AgentSession({
      sessionId: "session-001",
      userId: "user-001",
      agentId: "coder",
      afs,
    });

    const coderMessages = await coderSession.getMessages();

    expect(coderMessages).toHaveLength(2);
    expect(coderMessages[0]).toEqual({ role: "user", content: "Hello coder" });
    expect(coderMessages[1]).toEqual({ role: "agent", content: "Hi from coder!" });
  });

  test("should handle entries with only input/output (no messages)", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    if (!historyPath) throw new Error("History module not found");

    await afs.write(`${historyPath}/new`, {
      userId: "user-001",
      sessionId: "session-001",
      agentId: "assistant",
      content: {
        input: { message: "foo" },
        output: { message: "bar" },
      },
    });

    const session = new AgentSession({
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      afs,
    });

    const messages = await session.getMessages();

    expect(messages).toHaveLength(0);
  });

  test("should work without AFS", async () => {
    const session = new AgentSession({
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
    });

    const messages = await session.getMessages();
    expect(messages).toHaveLength(0);

    await session.startMessage({ text: "Hello" }, { role: "user", content: "Hello" });

    await session.appendCurrentMessages({ role: "agent", content: "Hi there!" });

    await session.endMessage({ text: "Hi there!" }, { role: "agent", content: "Hi there!" });

    const updatedMessages = await session.getMessages();
    expect(updatedMessages).toHaveLength(3);
    expect(updatedMessages[0]).toEqual({ role: "user", content: "Hello" });
    expect(updatedMessages[1]).toEqual({ role: "agent", content: "Hi there!" });
    expect(updatedMessages[2]).toEqual({ role: "agent", content: "Hi there!" });
  });

  test("should respect maxHistoryItems limit", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    if (!historyPath) throw new Error("History module not found");

    for (let i = 0; i < 5; i++) {
      await afs.write(`${historyPath}/new`, {
        userId: "user-001",
        sessionId: "session-001",
        agentId: "assistant",
        content: {
          messages: [
            { role: "user", content: `Message ${i}` },
            { role: "agent", content: `Response ${i}` },
          ],
        },
      });
    }

    const session = new AgentSession({
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      afs,
      maxHistoryItems: 3,
    });

    const messages = await session.getMessages();

    expect(messages).toHaveLength(6);

    const loadedContents = messages.map((m) => m.content);
    expect(
      loadedContents.filter((c) => typeof c === "string" && c.startsWith("Message")),
    ).toHaveLength(3);
    expect(
      loadedContents.filter((c) => typeof c === "string" && c.startsWith("Response")),
    ).toHaveLength(3);
  });

  test("should support system messages", async () => {
    const session = new AgentSession({
      sessionId: "session-001",
    });

    await session.setSystemMessages({
      role: "system",
      content: "You are a helpful assistant.",
    });

    await session.startMessage({ text: "Hello" }, { role: "user", content: "Hello" });

    const messages = await session.getMessages();

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: "system", content: "You are a helpful assistant." });
    expect(messages[1]).toEqual({ role: "user", content: "Hello" });
  });
});
