import { expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FSMemory, MEMORY_FILE_NAME } from "@aigne/agent-library/fs-memory/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { stringify } from "yaml";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

test("FSMemory simple example", async () => {
  // #region example-fs-memory-simple
  const model = new OpenAIChatModel();

  const engine = new AIGNE({ model });

  const memory = new FSMemory({ rootDir: "/PATH/TO/MEMORY_FOLDER" });

  const agent = AIAgent.from({
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

    const model = new OpenAIChatModel();

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

    expect(modelProcess).toHaveBeenLastCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining("What color do I like?"),
          }),
        ]),
      }),
      expect.anything(),
    );

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
    const model = new OpenAIChatModel();

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

    expect(modelProcess).toHaveBeenLastCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining("I like blue color."),
          }),
        ]),
      }),
      expect.anything(),
    );

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
