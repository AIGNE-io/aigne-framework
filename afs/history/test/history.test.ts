import { describe, expect, test } from "bun:test";
import assert from "node:assert";
import { AFS, type AFSEntry } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

test("AFS should record history correctly", async () => {
  const history = new AFSHistory({ storage: { url: ":memory:" } });
  const afs = new AFS().mount(history);

  const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
  assert(historyPath);

  // Write a history entry to /by-session/session-001/new
  const writeResult = await afs.write(`${historyPath}/by-session/session-001/new`, {
    agentId: "assistant",
    userId: "user-001",
    sessionId: "session-001",
    content: {
      input: { message: "foo" },
      output: { message: "bar" },
    },
  });

  expect({ ...writeResult.data }).toMatchInlineSnapshot(
    {
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(String),
      path: expect.stringMatching(/^\/modules\/history\/by-session\/session-001\/[0-9a-f-]{36}$/),
    },
    `
    {
      "agentId": "assistant",
      "content": {
        "input": {
          "message": "foo",
        },
        "output": {
          "message": "bar",
        },
      },
      "createdAt": Any<Date>,
      "id": Any<String>,
      "linkTo": null,
      "metadata": {
        "scope": "session",
      },
      "path": StringMatching /^\\/modules\\/history\\/by-session\\/session-001\\/[0-9a-f-]{36}$/,
      "sessionId": "session-001",
      "summary": null,
      "updatedAt": Any<Date>,
      "userId": "user-001",
    }
  `,
  );

  // Root path should return virtual path entries
  const rootEntries: AFSEntry[] = (await afs.list(historyPath)).data;

  expect(rootEntries).toMatchInlineSnapshot(`
    [
      {
        "description": "Retrieve history entries by session ID.",
        "id": "by-session",
        "path": "/modules/history/by-session",
      },
      {
        "description": "Retrieve history entries by user ID.",
        "id": "by-user",
        "path": "/modules/history/by-user",
      },
      {
        "description": "Retrieve history entries by agent ID.",
        "id": "by-agent",
        "path": "/modules/history/by-agent",
      },
    ]
  `);

  // Read the created history entry using virtual path
  const readEntry = await afs.read(writeResult.data.path);

  expect(readEntry.data).toEqual(writeResult.data);
});

describe("Virtual Path Support", () => {
  test("should query by session using virtual path", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write multiple history entries with different sessions
    await afs.write(`${historyPath}/by-session/session-001/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "hello" },
        output: { message: "hi" },
      },
    });

    await afs.write(`${historyPath}/by-session/session-002/new`, {
      sessionId: "session-002",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "world" },
        output: { message: "earth" },
      },
    });

    // Query by session using virtual path
    const session1Entries: AFSEntry[] = (await afs.list(`${historyPath}/by-session/session-001`))
      .data;

    expect(session1Entries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "assistant",
          "content": {
            "input": {
              "message": "hello",
            },
            "output": {
              "message": "hi",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "session",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );
  });

  test("should query by user using virtual path", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    await afs.write(`${historyPath}/by-user/user-001/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "user1" },
        output: { message: "response1" },
      },
    });

    await afs.write(`${historyPath}/by-user/user-002/new`, {
      sessionId: "session-001",
      userId: "user-002",
      agentId: "assistant",
      content: {
        input: { message: "user2" },
        output: { message: "response2" },
      },
    });

    // Query by user using virtual path
    const user1Entries: AFSEntry[] = (await afs.list(`${historyPath}/by-user/user-001`)).data;

    expect(user1Entries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "assistant",
          "content": {
            "input": {
              "message": "user1",
            },
            "output": {
              "message": "response1",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "user",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );
  });

  test("should query by agent using virtual path", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    await afs.write(`${historyPath}/by-agent/assistant/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "help" },
        output: { message: "ok" },
      },
    });

    await afs.write(`${historyPath}/by-agent/coder/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "coder",
      content: {
        input: { message: "code" },
        output: { message: "done" },
      },
    });

    // Query by agent using virtual path
    const coderEntries: AFSEntry[] = (await afs.list(`${historyPath}/by-agent/coder`)).data;

    expect(coderEntries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "coder",
          "content": {
            "input": {
              "message": "code",
            },
            "output": {
              "message": "done",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "agent",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );
  });

  test("should query by combined dimensions using virtual path + filter", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Create entries with different combinations
    await afs.write(`${historyPath}/by-session/session-001/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "msg1" },
        output: { message: "resp1" },
      },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    await afs.write(`${historyPath}/by-session/session-001/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "coder",
      content: {
        input: { message: "msg2" },
        output: { message: "resp2" },
      },
    });

    await afs.write(`${historyPath}/by-session/session-002/new`, {
      sessionId: "session-002",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "msg3" },
        output: { message: "resp3" },
      },
    });

    // Query by session + agent (using filter parameter)
    const sessionAgentEntries: AFSEntry[] = (
      await afs.list(`${historyPath}/by-session/session-001`, {
        filter: { agentId: "assistant" },
      })
    ).data;

    expect(sessionAgentEntries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "assistant",
          "content": {
            "input": {
              "message": "msg1",
            },
            "output": {
              "message": "resp1",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "session",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );

    // Query by user + session (using filter parameter)
    const userSessionEntries: AFSEntry[] = (
      await afs.list(`${historyPath}/by-user/user-001`, {
        filter: { sessionId: "session-001" },
      })
    ).data;

    expect(userSessionEntries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "coder",
          "content": {
            "input": {
              "message": "msg2",
            },
            "output": {
              "message": "resp2",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "session",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
        {
          "agentId": "assistant",
          "content": {
            "input": {
              "message": "msg1",
            },
            "output": {
              "message": "resp1",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "session",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );

    // Query by user + session + agent (using filter parameter)
    const fullFilterEntries: AFSEntry[] = (
      await afs.list(`${historyPath}/by-user/user-001`, {
        filter: { sessionId: "session-001", agentId: "coder" },
      })
    ).data;

    expect(fullFilterEntries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "coder",
          "content": {
            "input": {
              "message": "msg2",
            },
            "output": {
              "message": "resp2",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "session",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );
  });

  test("should merge virtual path filter with explicit filter options", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    await afs.write(`${historyPath}/by-session/session-001/new`, {
      sessionId: "session-001",
      userId: "user-001",
      agentId: "assistant",
      content: {
        input: { message: "test" },
        output: { message: "result" },
      },
    });

    // Use virtual path with additional filter options
    const entries: AFSEntry[] = (
      await afs.list(`${historyPath}/by-session/session-001`, {
        filter: { agentId: "assistant" },
      })
    ).data;

    expect(entries).toMatchInlineSnapshot(
      [
        {
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          id: expect.any(String),
          path: expect.any(String),
        },
      ],
      `
      [
        {
          "agentId": "assistant",
          "content": {
            "input": {
              "message": "test",
            },
            "output": {
              "message": "result",
            },
          },
          "createdAt": Any<Date>,
          "id": Any<String>,
          "linkTo": null,
          "metadata": {
            "scope": "session",
          },
          "path": Any<String>,
          "sessionId": "session-001",
          "summary": null,
          "updatedAt": Any<Date>,
          "userId": "user-001",
        },
      ]
    `,
    );
  });

  test("should return empty for invalid virtual path", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write a test entry
    await afs.write(`${historyPath}/by-session/session-test/new`, {
      sessionId: "session-test",
      userId: "user-test",
      agentId: "test",
      content: {
        input: { message: "test" },
        output: { message: "result" },
      },
    });

    // Invalid path returns empty array (module returns empty, AFS wraps with module entry)
    const entries: AFSEntry[] = (await afs.list(`${historyPath}/invalid/path`)).data;

    // AFS returns the module entry itself when subpath returns empty
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe("history");
  });

  test("should auto-generate UUID path when writing to /new", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write to /by-session/{sessionId}/new should auto-generate UUID path
    const writeResult = await afs.write(`${historyPath}/by-session/auto-session/new`, {
      sessionId: "auto-session",
      userId: "auto-user",
      agentId: "auto-agent",
      content: {
        input: { message: "auto generated" },
        output: { message: "uuid path" },
      },
    });

    // Path should be virtual path format with UUID
    expect(writeResult.data.path).toMatch(
      /^\/modules\/history\/by-session\/auto-session\/[0-9a-f-]{36}$/,
    );
    expect(writeResult.data.sessionId).toBe("auto-session");
    expect(writeResult.data.id).toMatch(/^[0-9a-f-]{36}$/);

    // Should be able to read using the generated virtual path
    const readResult = await afs.read(writeResult.data.path);
    expect(readResult.data?.content.input.message).toBe("auto generated");
    expect(readResult.data?.path).toBe(writeResult.data.path);
  });
});

describe("Compact Routes", () => {
  test("should write compact entry to @metadata/compact/new path", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    const writeResult = await afs.write(
      `${historyPath}/by-session/session-001/@metadata/compact/new`,
      {
        agentId: "assistant",
        userId: "user-001",
        content: {
          summary: "This is a compressed summary of the conversation.",
        },
        metadata: {
          latestEntryId: "entry-003",
        },
      },
    );

    expect(writeResult.data).toMatchInlineSnapshot(
      {
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: expect.any(String),
        path: expect.any(String),
      },
      `
      {
        "agentId": "assistant",
        "content": {
          "summary": "This is a compressed summary of the conversation.",
        },
        "createdAt": Any<Date>,
        "id": Any<String>,
        "metadata": {
          "latestEntryId": "entry-003",
          "scope": "session",
        },
        "path": Any<String>,
        "sessionId": "session-001",
        "updatedAt": Any<Date>,
        "userId": "user-001",
      }
    `,
    );
  });

  test("should list compact entries", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write multiple compact entries
    await afs.write(`${historyPath}/by-session/session-001/@metadata/compact/new`, {
      agentId: "assistant",
      content: { summary: "First compact" },
      metadata: { latestEntryId: "entry-001" },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    await afs.write(`${historyPath}/by-session/session-001/@metadata/compact/new`, {
      agentId: "assistant",
      content: { summary: "Second compact" },
      metadata: { latestEntryId: "entry-002" },
    });

    // List compact entries (default order is createdAt desc, so latest first)
    const listResult = await afs.list(`${historyPath}/by-session/session-001/@metadata/compact`);

    expect(listResult.data).toHaveLength(2);
    expect(listResult.data[0]?.content.summary).toBe("Second compact");
    expect(listResult.data[1]?.content.summary).toBe("First compact");
  });

  test("should read compact entry by ID", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write a compact entry
    const writeResult = await afs.write(
      `${historyPath}/by-session/session-001/@metadata/compact/new`,
      {
        agentId: "assistant",
        content: { summary: "Test compact entry" },
        metadata: { latestEntryId: "entry-001" },
      },
    );

    const compactId = writeResult.data.id;

    // Read by ID
    const readResult = await afs.read(
      `${historyPath}/by-session/session-001/@metadata/compact/${compactId}`,
    );

    expect(readResult.data).toMatchInlineSnapshot(
      {
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: expect.any(String),
        path: expect.any(String),
      },
      `
      {
        "agentId": "assistant",
        "content": {
          "summary": "Test compact entry",
        },
        "createdAt": Any<Date>,
        "id": Any<String>,
        "metadata": {
          "latestEntryId": "entry-001",
          "scope": "session",
        },
        "path": Any<String>,
        "sessionId": "session-001",
        "updatedAt": Any<Date>,
        "userId": null,
      }
    `,
    );
  });

  test("should filter compact entries by agentId", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write compact entries for different agents
    await afs.write(`${historyPath}/by-session/session-001/@metadata/compact/new`, {
      agentId: "assistant",
      content: { summary: "Assistant compact" },
      metadata: { latestEntryId: "entry-001" },
    });

    await afs.write(`${historyPath}/by-session/session-001/@metadata/compact/new`, {
      agentId: "coder",
      content: { summary: "Coder compact" },
      metadata: { latestEntryId: "entry-002" },
    });

    // Filter by agentId
    const listResult = await afs.list(`${historyPath}/by-session/session-001/@metadata/compact`, {
      filter: { agentId: "assistant" },
    });

    expect(listResult.data).toHaveLength(1);
    expect(listResult.data[0]?.agentId).toBe("assistant");
    expect(listResult.data[0]?.content.summary).toBe("Assistant compact");
  });

  test("should get latest compact entry using orderBy and limit", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write multiple compact entries
    await afs.write(`${historyPath}/by-session/session-001/@metadata/compact/new`, {
      agentId: "assistant",
      content: { summary: "First compact" },
      metadata: { latestEntryId: "entry-001" },
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    await afs.write(`${historyPath}/by-session/session-001/@metadata/compact/new`, {
      agentId: "assistant",
      content: { summary: "Latest compact" },
      metadata: { latestEntryId: "entry-002" },
    });

    // Get latest using orderBy and limit
    const listResult = await afs.list(`${historyPath}/by-session/session-001/@metadata/compact`, {
      filter: { agentId: "assistant" },
      orderBy: [["createdAt", "desc"]],
      limit: 1,
    });

    expect(listResult.data).toHaveLength(1);
    expect(listResult.data[0]?.content.summary).toBe("Latest compact");
  });

  test("should support compact for user and agent paths", async () => {
    const history = new AFSHistory({ storage: { url: ":memory:" } });
    const afs = new AFS().mount(history);

    const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;
    assert(historyPath);

    // Write user compact
    const userCompact = await afs.write(`${historyPath}/by-user/user-001/@metadata/compact/new`, {
      content: { summary: "User long-term memory" },
    });

    expect(userCompact.data.metadata?.scope).toBe("user");
    expect(userCompact.data.userId).toBe("user-001");

    // Write agent compact
    const agentCompact = await afs.write(
      `${historyPath}/by-agent/assistant/@metadata/compact/new`,
      {
        content: { summary: "Agent knowledge" },
      },
    );

    expect(agentCompact.data.metadata?.scope).toBe("agent");
    expect(agentCompact.data.agentId).toBe("assistant");

    // List user compacts
    const userList = await afs.list(`${historyPath}/by-user/user-001/@metadata/compact`);
    expect(userList.data).toHaveLength(1);
    expect(userList.data[0]?.content.summary).toBe("User long-term memory");

    // List agent compacts
    const agentList = await afs.list(`${historyPath}/by-agent/assistant/@metadata/compact`);
    expect(agentList.data).toHaveLength(1);
    expect(agentList.data[0]?.content.summary).toBe("Agent knowledge");
  });
});
