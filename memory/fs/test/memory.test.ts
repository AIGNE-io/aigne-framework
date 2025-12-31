import { expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { stringify } from "yaml";
import { FSMemory, MEMORY_FILE_NAME } from "../src/memory.js";

test("FSMemory simple example", async () => {
  // #region example-fs-memory-simple
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
  });

  const engine = new AIGNE({ model });

  const memory = new FSMemory({ rootDir: "/PATH/TO/MEMORY_FOLDER" });

  const agent = AIAgent.from({
    inputKey: "message",
    memory,
  });

  spyOn(memory, "retrieve").mockReturnValueOnce(Promise.resolve({ memories: [] }));
  spyOn(memory, "record").mockReturnValueOnce(Promise.resolve({ memories: [] }));
  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "Great! I will remember that you like blue color.",
    }),
  );

  const result1 = await engine.invoke(agent, { message: "I like blue color" });

  expect(result1).toEqual({
    message: "Great! I will remember that you like blue color.",
  });
  console.log(result1);
  // Output: { message: 'Great! I will remember that you like blue color.' }

  spyOn(memory, "retrieve").mockReturnValueOnce(
    Promise.resolve({
      memories: [
        {
          id: "memory1",
          content: "You like blue color.",
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  );
  spyOn(memory, "record").mockReturnValueOnce(Promise.resolve({ memories: [] }));
  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "You like blue color.",
    }),
  );

  const result2 = await engine.invoke(agent, {
    message: "What color do I like?",
  });
  expect(result2).toEqual({ message: "You like blue color." });
  console.log(result2);
  // Output: { message: 'You like blue color.' }

  // #endregion example-fs-memory-simple
});

test("FSMemory retrieve should read all memory from file", async () => {
  const dir = join(tmpdir(), randomUUID());
  await mkdir(dir, { recursive: true });
  try {
    await writeFile(
      join(dir, MEMORY_FILE_NAME),
      stringify([
        { content: "User likes blue color." },
        { content: "User likes play basketball." },
      ]),
      "utf-8",
    );

    const model = new OpenAIChatModel({
      apiKey: "YOUR_OPENAI_API_KEY",
    });

    const engine = new AIGNE({ model });

    const memory = new FSMemory({ rootDir: dir });

    const modelProcess = spyOn(model, "process");

    modelProcess.mockReturnValueOnce(
      Promise.resolve({
        json: {
          memories: [{ content: "User likes blue color." }],
        },
      }),
    );

    const result = await memory.retrieve({ search: "What color do I like?" }, engine.newContext());

    expect(modelProcess.mock.lastCall?.[0].messages).toMatchInlineSnapshot(`
      [
        {
          "content": [
            {
              "text": 
      "You retrieve only the most relevant memories for the current conversation.

      ## IMPORTANT: All existing memories are available in the allMemory variable

      ## Process:
      1. Read the existing memories from the allMemory variable
      2. Extract key topics from the conversation or search query
      3. Match memory contents against these topics

      ## Existing Memories:
      <existing-memory>
      - content: User likes blue color.
      - content: User likes play basketball.

      </existing-memory>

      ## Search Query:
      <search-query>
      What color do I like?
      </search-query>
      "
      ,
              "type": "text",
            },
          ],
          "role": "user",
        },
      ]
    `);

    expect(result).toEqual({
      memories: [
        {
          id: expect.any(String),
          content: "User likes blue color.",
          createdAt: expect.any(String),
        },
      ],
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("FSMemory retrieve should write all memory into memory file", async () => {
  const dir = join(tmpdir(), randomUUID());
  await mkdir(dir, { recursive: true });
  try {
    const model = new OpenAIChatModel({
      apiKey: "YOUR_OPENAI_API_KEY",
    });

    const engine = new AIGNE({ model });

    const memory = new FSMemory({ rootDir: dir });

    const modelProcess = spyOn(model, "process");

    modelProcess.mockReturnValueOnce(
      Promise.resolve({
        json: {
          memories: [{ content: "User likes blue color." }],
        },
      }),
    );

    const result = await memory.record(
      {
        content: [{ input: { message: "I like blue color." } }],
      },
      engine.newContext(),
    );

    expect(modelProcess.mock.lastCall?.[0].messages).toMatchInlineSnapshot(`
      [
        {
          "content": [
            {
              "text": 
      "You manage memory based on conversation analysis and the existing memories.

      ## IMPORTANT: All existing memories are available in the allMemory variable. DO NOT call any tools.

      ## FIRST: Determine If Memory Updates Needed
      - Analyze if the conversation contains ANY information worth remembering
      - Examples of content NOT worth storing:
        * General questions ("What's the weather?", "How do I do X?")
        * Greetings and small talk ("Hello", "How are you?", "Thanks")
        * System instructions or commands ("Show me", "Find", "Save")
        * General facts not specific to the user
        * Duplicate information already stored
      - If conversation lacks meaningful personal information to store:
        * Return the existing memories unchanged

      ## Your Workflow:
      1. Read the existing memories from the allMemory variable
      2. Extract key topics from the conversation
      3. DECIDE whether to create/update/delete memories based on the conversation
      4. Return ALL memories including your updates (remove any duplicates)

      ## Memory Handling:
      - CREATE: Add new memory objects for new topics
      - UPDATE: Modify existing memories if substantial new information is available
      - DELETE: Remove obsolete memories when appropriate

      ## Memory Structure:
      - Each memory has an id, content, and createdAt fields
      - Keep the existing structure when returning updated memories

      ## Operation Decision Rules:
      - CREATE only for truly new topics not covered in any existing memory
      - UPDATE only when new information is meaningfully different
      - NEVER update for just rephrasing or minor differences
      - DELETE only when information becomes obsolete

      ## IMPORTANT: Your job is to return the complete updated memory collection.
      Return ALL memories (existing and new) in your response.

      ## Existing Memories:
      <existing-memory>

      </existing-memory>

      ## Conversation:
      <conversation>
      [{"input":{"message":"I like blue color."}}]
      </conversation>
      "
      ,
              "type": "text",
            },
          ],
          "role": "user",
        },
      ]
    `);

    expect(result).toEqual({
      memories: [
        {
          id: expect.any(String),
          content: "User likes blue color.",
          createdAt: expect.any(String),
        },
      ],
    });

    expect(await readFile(join(dir, MEMORY_FILE_NAME), "utf-8")).toEqual(
      stringify([{ content: "User likes blue color." }]),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
