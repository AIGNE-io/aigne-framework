import { beforeEach, expect, spyOn, test } from "bun:test";
import { AIAgent, AIGNE } from "@aigne/core";
import { DIDSpacesMemory } from "@aigne/did-space-memory";
import { OpenAIChatModel } from "@aigne/openai";
import { SpaceClient } from "@blocklet/did-space-js";
import { stringify } from "yaml";

// Mock SpaceClient
const mockSpaceClient = {
  send: spyOn(SpaceClient.prototype, "send"),
};

beforeEach(() => {
  // Clear all mocks before each test
  mockSpaceClient.send.mockClear();
  mockSpaceClient.send.mockReset();
});

test("DIDSpacesMemory simple example", async () => {
  // #region example-did-spaces-memory-simple
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
  });

  const engine = new AIGNE({ model });

  const memory = new DIDSpacesMemory({
    url: "https://example.com/did-spaces",
    auth: { authorization: "Bearer test-token" },
  });

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

  // #endregion example-did-spaces-memory-simple
});

test("DIDSpacesMemory retrieve should read all memory from DID Spaces", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
  });
  const engine = new AIGNE({ model });

  // Mock the GetObjectCommand response
  const mockMemoryData = stringify([
    { content: "User likes blue color." },
    { content: "User likes play basketball." },
  ]);

  // Create a mock stream that can be iterated
  const mockStream = {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(mockMemoryData, "utf-8");
    },
  };

  // Mock multiple calls since initializeReadmeFiles might make additional calls
  // Use mockResolvedValue for default behavior (for initialization)
  mockSpaceClient.send.mockResolvedValue({
    statusCode: 404,
    statusMessage: "Not Found",
    data: null,
  });

  const memory = new DIDSpacesMemory({
    url: "https://example.com/did-spaces",
    auth: { authorization: "Bearer test-token" },
  });

  // Wait a bit to let initialization complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock the ListObjectCommand for exists() method
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 200,
    data: null,
  });

  // Mock the GetObjectCommand for read() method
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 200,
    data: mockStream,
  });

  const modelProcess = spyOn(model, "process");

  modelProcess.mockReturnValueOnce(
    Promise.resolve({
      json: {
        memories: [{ content: "User likes blue color." }],
      },
    }),
  );

  const result = await memory.retrieve({ search: "What color do I like?" }, engine.newContext());

  expect(result).toEqual({
    memories: [
      {
        id: expect.any(String),
        content: "User likes blue color.",
        createdAt: expect.any(String),
      },
    ],
  });
});

test("DIDSpacesMemory record should write memory to DID Spaces", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
  });
  const engine = new AIGNE({ model });

  const memory = new DIDSpacesMemory({
    url: "https://example.com/did-spaces",
    auth: { authorization: "Bearer test-token" },
  });

  // Wait for initialization to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Create a mock stream for empty existing memories
  const mockEmptyStream = {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("", "utf-8");
    },
  };

  // Clear previous mocks and set new ones
  mockSpaceClient.send.mockClear();
  mockSpaceClient.send.mockReset();

  // Mock the GetObjectCommand response (existing memories)
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 200,
    data: mockEmptyStream,
  });

  // Mock the PutObjectCommand response
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 200,
    data: "",
  });

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

  expect(result).toEqual({
    memories: [
      {
        id: expect.any(String),
        content: "User likes blue color.",
        createdAt: expect.any(String),
      },
    ],
  });
});

test("DIDSpacesMemory should handle empty memory file", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
  });
  const engine = new AIGNE({ model });

  const memory = new DIDSpacesMemory({
    url: "https://example.com/did-spaces",
    auth: { authorization: "Bearer test-token" },
  });

  // Wait for initialization to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Clear previous mocks and set new ones
  mockSpaceClient.send.mockClear();
  mockSpaceClient.send.mockReset();

  // Mock the ListObjectCommand response (file not found) for exists() method
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 404,
    statusMessage: "Not Found",
    data: null,
  });

  const result = await memory.retrieve({ search: "What do I like?" }, engine.newContext());

  expect(result).toEqual({
    memories: [],
  });
});

test("DIDSpacesMemory should handle DID Spaces API errors", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_OPENAI_API_KEY",
  });
  const engine = new AIGNE({ model });

  const memory = new DIDSpacesMemory({
    url: "https://example.com/did-spaces",
    auth: { authorization: "Bearer test-token" },
  });

  // Wait for initialization to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Clear previous mocks and set new ones
  mockSpaceClient.send.mockClear();
  mockSpaceClient.send.mockReset();

  // Create a mock stream for empty existing memories
  const mockEmptyStream = {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("", "utf-8");
    },
  };

  // Mock the GetObjectCommand response (existing memories)
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 200,
    data: mockEmptyStream,
  });

  // Mock the PutObjectCommand response (error)
  mockSpaceClient.send.mockResolvedValueOnce({
    statusCode: 500,
    statusMessage: "Internal Server Error",
    data: null,
  });

  const modelProcess = spyOn(model, "process");

  modelProcess.mockReturnValueOnce(
    Promise.resolve({
      json: {
        memories: [{ content: "User likes blue color." }],
      },
    }),
  );

  // 期望抛出错误，而不是返回空数组
  await expect(
    memory.record(
      {
        content: [{ input: { message: "I like blue color." } }],
      },
      engine.newContext(),
    ),
  ).rejects.toThrow("Internal Server Error");
});
