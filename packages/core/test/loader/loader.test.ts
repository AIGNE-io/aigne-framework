import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, ChatModel, ExecutionEngine, MCPAgent, createMessage } from "@aigne/core";
import { load, loadAgent } from "@aigne/core/loader/index.js";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";
import { mockModule } from "@aigne/test-utils/mock-module.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { nanoid } from "nanoid";

test("ExecutionEngine.load should load agents correctly", async () => {
  const engine = await ExecutionEngine.load({
    path: join(import.meta.dirname, "../../test-agents"),
  });

  expect(engine.agents.length).toBe(1);

  const chat = engine.agents[0];
  expect(chat).toEqual(
    expect.objectContaining({
      name: "chat",
    }),
  );
  assert(chat, "chat agent should be defined");

  expect(chat.tools.length).toBe(1);
  expect(chat.tools[0]).toEqual(expect.objectContaining({ name: "evaluateJs" }));

  expect(engine.model).toBeInstanceOf(ChatModel);
  assert(engine.model, "model should be defined");

  spyOn(engine.model, "call")
    .mockReturnValueOnce(
      Promise.resolve({
        toolCalls: [
          {
            id: nanoid(),
            type: "function",
            function: { name: "evaluateJs", arguments: { code: "1 + 1" } },
          },
        ],
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ text: "1 + 2 = 3" }));

  const result = await engine.call(chat, "1 + 2 = ?");
  expect(result).toEqual(expect.objectContaining(createMessage("1 + 2 = 3")));
});

test("loader should use override options", async () => {
  const model = new ClaudeChatModel({});
  const testAgent = AIAgent.from({ name: "test-agent" });
  const testTool = AIAgent.from({ name: "test-tool" });

  const engine = await ExecutionEngine.load({
    path: join(import.meta.dirname, "../../test-agents"),
    model,
    agents: [testAgent],
    tools: [testTool],
  });

  expect(engine.model).toBe(model);
  expect([...engine.agents]).toEqual([
    expect.objectContaining({
      name: "chat",
    }),
    testAgent,
  ]);
  expect([...engine.tools]).toEqual([expect.objectContaining({ name: "evaluateJs" }), testTool]);
});

test("loader should error if agent file is not supported", async () => {
  const engine = loadAgent(join(import.meta.dirname, "./not-exist-agent-library/test.txt"));
  expect(engine).rejects.toThrow("Unsupported agent file type");
});

test("load should process path correctly", async () => {
  const stat = mock();
  const exists = mock();
  const readFile = mock();

  await using _ = await mockModule("node:fs/promises", () => ({ stat, exists, readFile }));

  // mock a non-existing file
  stat.mockReturnValueOnce(Promise.reject(new Error("no such file or directory")));
  expect(load({ path: "aigne.yaml" })).rejects.toThrow("no such file or directory");

  // mock a yaml file with invalid content
  stat.mockReturnValueOnce(Promise.resolve({ isDirectory: () => false }));
  readFile.mockReturnValueOnce(Promise.resolve("[this is not a valid yaml}"));
  expect(load({ path: "invalid-yaml/aigne.yaml" })).rejects.toThrow("Failed to parse aigne.yaml");
  expect(readFile).toHaveBeenLastCalledWith("invalid-yaml/aigne.yaml", "utf8");

  // mock a valid yaml but invalid properties
  stat.mockReturnValueOnce(Promise.resolve({ isDirectory: () => false }));
  readFile.mockReturnValueOnce("chat_model: 123");
  expect(load({ path: "invalid-properties/aigne.yaml" })).rejects.toThrow(
    "Failed to validate aigne.yaml",
  );
  expect(readFile).toHaveBeenLastCalledWith("invalid-properties/aigne.yaml", "utf8");

  // mock a directory with a .yaml file
  stat.mockReturnValueOnce(Promise.resolve({ isDirectory: () => true }));
  exists.mockReturnValueOnce(Promise.resolve(true));
  readFile.mockReturnValueOnce("chat_model: gpt-4o-mini");
  expect(load({ path: "foo" })).resolves.toEqual({
    model: expect.anything(),
    agents: [],
    tools: [],
  });
  expect(readFile).toHaveBeenLastCalledWith("foo/aigne.yaml", "utf8");

  // mock a directory with a .yml file
  stat.mockReturnValueOnce(Promise.resolve({ isDirectory: () => true }));
  exists.mockReturnValueOnce(Promise.resolve(false)).mockReturnValueOnce(Promise.resolve(true));
  readFile.mockReturnValueOnce("chat_model: gpt-4o-mini");
  expect(load({ path: "bar" })).resolves.toEqual({
    model: expect.anything(),
    agents: [],
    tools: [],
  });
  expect(readFile).toHaveBeenLastCalledWith("bar/aigne.yml", "utf8");
});

test("load should load model correctly", async () => {
  const stat = mock().mockReturnValue(Promise.resolve({ isDirectory: () => false }));
  const readFile = mock();

  await using _ = await mockModule("node:fs/promises", () => ({ stat, readFile }));

  readFile.mockReturnValueOnce(Promise.resolve("chat_model: gpt-4o"));
  expect((await load({ path: "aigne.yaml" })).model).toBeInstanceOf(OpenAIChatModel);

  readFile.mockReturnValueOnce(
    Promise.resolve(`\
chat_model:
  provider: openai
  name: gpt-4o
`),
  );
  expect((await load({ path: "aigne.yaml" })).model).toBeInstanceOf(OpenAIChatModel);

  readFile.mockReturnValueOnce(
    Promise.resolve(`\
chat_model:
  provider: claude
  name: claude-3.5
`),
  );
  expect((await load({ path: "aigne.yaml" })).model).toBeInstanceOf(ClaudeChatModel);

  readFile.mockReturnValueOnce(
    Promise.resolve(`\
chat_model:
  provider: xai
  name: grok-2-latest
`),
  );
  expect((await load({ path: "aigne.yaml" })).model).toBeInstanceOf(XAIChatModel);
});

test("loadAgent should load MCP agent from url correctly", async () => {
  const testMcp = MCPAgent.from({
    name: "test-mcp",
    client: new Client({ name: "test-mcp-cleint", version: "0.0.1" }),
  });

  const from = spyOn(MCPAgent, "from").mockReturnValueOnce(testMcp);

  const readFile = mock().mockReturnValueOnce(`\
type: mcp
url: http://localhost:3000/sse
`);

  await using _ = await mockModule("node:fs/promises", () => ({
    readFile,
  }));

  expect(await loadAgent("./remote-mcp.yaml")).toBe(testMcp);
  expect(from).toHaveBeenLastCalledWith({
    url: "http://localhost:3000/sse",
  });
});

test("loadAgent should load MCP agent from command correctly", async () => {
  const fsMcp = MCPAgent.from({
    name: "filesystem",
    client: new Client({ name: "test-mcp-cleint", version: "0.0.1" }),
  });
  const from = spyOn(MCPAgent, "from").mockReturnValueOnce(fsMcp);

  const readFile = mock().mockReturnValueOnce(`\
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
`);

  await using _ = await mockModule("node:fs/promises", () => ({
    readFile,
  }));

  expect(await loadAgent("./local-mcp.yaml")).toBe(fsMcp);
  expect(from).toHaveBeenLastCalledWith({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
  });
});

test("loadAgent should error if MCP agent options is not valid", async () => {
  const readFile = mock().mockReturnValueOnce(`\
type: mcp
`);

  await using _ = await mockModule("node:fs/promises", () => ({
    readFile,
  }));

  expect(loadAgent("./local-mcp.yaml")).rejects.toThrow("Missing url or command in mcp agent");
});
