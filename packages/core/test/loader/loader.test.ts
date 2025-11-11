import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, AIGNE, ChatModel, MCPAgent } from "@aigne/core";
import { load, loadAgent } from "@aigne/core/loader/index.js";
import { mapCliAgent } from "@aigne/core/utils/agent-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ClaudeChatModel, OpenAIChatModel, OpenAIImageModel } from "../_mocks/mock-models.js";

const loadModel = (options: any) => new OpenAIChatModel(options);

test("AIGNE.load should load agents correctly", async () => {
  const aigne = await AIGNE.load(join(import.meta.dirname, "../../test-agents"), {
    model: (options) =>
      loadModel({
        model: typeof options?.model === "string" ? options?.model : undefined,
        modelOptions: options,
      }),
    imageModel: (options) =>
      new OpenAIImageModel({
        model: typeof options?.model === "string" ? options?.model : undefined,
        modelOptions: options,
      }),
  });

  expect(aigne).toEqual(
    expect.objectContaining({
      name: "test_aigne_project",
      description: "A test project for the aigne agent",
    }),
  );

  expect(aigne.agents.length).toBe(5);

  const chat = aigne.agents[0];
  expect(chat).toEqual(
    expect.objectContaining({
      name: "chat",
    }),
  );
  assert(chat, "chat agent should be defined");

  expect(chat.skills.length).toBe(1);
  expect(chat.skills[0]).toEqual(expect.objectContaining({ name: "evaluateJs" }));

  expect(aigne.model).toBeInstanceOf(ChatModel);
  expect(aigne.model?.options?.modelOptions).toMatchInlineSnapshot(`
    {
      "customOption": 1,
      "model": "gpt-4o-mini",
      "reasoningEffort": "high",
      "temperature": 0.8,
    }
  `);

  expect(chat.model?.options?.modelOptions).toMatchInlineSnapshot(`
    {
      "customOption": 1,
      "model": "gpt-4o-mini",
      "reasoningEffort": "minimal",
      "temperature": 0.7,
    }
  `);

  assert(aigne.model, "model should be defined");

  expect(aigne.imageModel).toBeInstanceOf(OpenAIImageModel);
  expect(aigne.imageModel?.options?.modelOptions).toMatchInlineSnapshot(`
    {
      "model": "openai/gpt-image-1",
      "quality": "standard",
    }
  `);

  expect({
    agents: aigne.agents.map((agent) => ({
      name: agent.name,
      description: agent.description,
      taskTitle: agent.taskTitle,
    })),
    skills: aigne.skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
    })),
    mcpServer: {
      agents: aigne.mcpServer?.agents.map((agent) => ({
        name: agent.name,
        description: agent.description,
      })),
    },
    cli: {
      agents: aigne.cli?.agents?.map((i) =>
        mapCliAgent(i, (i) => ({ name: i.name, description: i.description })),
      ),
    },
  }).toMatchSnapshot();
});

test("loader should use override options", async () => {
  const model = new ClaudeChatModel();
  const testAgent = AIAgent.from({ name: "test-agent" });
  const testSkill = AIAgent.from({ name: "test-skill" });

  const aigne = await AIGNE.load(join(import.meta.dirname, "../../test-agents"), {
    model,
    agents: [testAgent],
    skills: [testSkill],
  });

  expect(aigne.model).toBe(model);
  expect([...aigne.agents]).toEqual([
    expect.objectContaining({
      name: "chat",
    }),
    expect.objectContaining({
      name: "chat-with-prompt",
    }),
    expect.objectContaining({
      name: "test-team-agent",
    }),
    expect.objectContaining({
      name: "test-image-agent",
    }),
    expect.objectContaining({
      name: "test-relative-prompt-paths",
    }),
    testAgent,
  ]);
  expect([...aigne.skills]).toEqual([expect.objectContaining({ name: "evaluateJs" }), testSkill]);
});

test("loader should error if agent file is not supported", async () => {
  const aigne = loadAgent(join(import.meta.dirname, "./not-exist-agent-library/test.txt"));
  expect(aigne).rejects.toThrow("Unsupported agent file type");
});

test("load should process path correctly", async () => {
  const stat = spyOn(nodejs.fs, "stat");
  const readFile = spyOn(nodejs.fs, "readFile");

  // mock a non-existing file
  stat.mockReturnValueOnce(Promise.reject(new Error("not found")));
  expect(load("aigne.yaml", { model: loadModel })).rejects.toThrow("not found");

  // mock a yaml file with invalid content
  stat.mockReturnValueOnce(
    Promise.resolve({ isFile: () => true }) as ReturnType<typeof nodejs.fs.stat>,
  );
  readFile.mockReturnValueOnce(Promise.resolve("[this is not a valid yaml}"));
  expect(load("invalid-yaml/aigne.yaml", { model: loadModel })).rejects.toThrow(
    "Failed to parse aigne.yaml",
  );
  expect(readFile).toHaveBeenLastCalledWith("invalid-yaml/aigne.yaml", "utf8");

  // mock a valid yaml but invalid properties
  stat.mockReturnValueOnce(
    Promise.resolve({ isFile: () => true }) as ReturnType<typeof nodejs.fs.stat>,
  );
  readFile.mockReturnValueOnce(Promise.resolve("chat_model: 123"));
  expect(load("invalid-properties/aigne.yaml", { model: loadModel })).rejects.toThrow(
    "Failed to validate aigne.yaml",
  );
  expect(readFile).toHaveBeenLastCalledWith("invalid-properties/aigne.yaml", "utf8");

  // mock a directory with a .yaml file
  stat.mockReturnValueOnce(
    Promise.resolve({ isFile: () => true }) as ReturnType<typeof nodejs.fs.stat>,
  );
  readFile.mockReturnValueOnce(Promise.resolve("chat_model: gpt-4o-mini"));
  expect(load("foo", { model: loadModel })).resolves.toEqual(
    expect.objectContaining({
      model: expect.anything(),
      agents: [],
      skills: [],
    }),
  );
  expect(readFile).toHaveBeenLastCalledWith("foo/aigne.yaml", "utf8");

  // mock a directory with a .yml file
  stat
    .mockReturnValueOnce(
      Promise.resolve({ isFile: () => false }) as ReturnType<typeof nodejs.fs.stat>,
    )
    .mockReturnValueOnce(
      Promise.resolve({ isFile: () => true }) as ReturnType<typeof nodejs.fs.stat>,
    );
  readFile.mockReturnValueOnce(Promise.resolve("chat_model: gpt-4o-mini"));
  expect(load("bar", { model: loadModel })).resolves.toEqual(
    expect.objectContaining({
      model: expect.anything(),
      agents: [],
      skills: [],
    }),
  );
  expect(readFile).toHaveBeenLastCalledWith("bar/aigne.yml", "utf8");

  stat.mockRestore();
  readFile.mockRestore();
});

test("loadAgent should load MCP agent from url correctly", async () => {
  const testMcp = MCPAgent.from({
    name: "test-mcp",
    client: new Client({ name: "test-mcp-cleint", version: "0.0.1" }),
  });

  const from = spyOn(MCPAgent, "from").mockReturnValueOnce(testMcp);

  const readFile = spyOn(nodejs.fs, "readFile").mockReturnValueOnce(
    Promise.resolve(`\
type: mcp
url: http://localhost:3000/sse
`),
  );

  expect(await loadAgent("./remote-mcp.yaml")).toBe(testMcp);
  expect(from).toHaveBeenLastCalledWith(
    expect.objectContaining({
      url: "http://localhost:3000/sse",
    }),
  );

  readFile.mockRestore();
});

test("loadAgent should load MCP agent from command correctly", async () => {
  const fsMcp = MCPAgent.from({
    name: "filesystem",
    client: new Client({ name: "test-mcp-client", version: "0.0.1" }),
  });
  const from = spyOn(MCPAgent, "from").mockReturnValueOnce(fsMcp);

  const readFile = spyOn(nodejs.fs, "readFile").mockReturnValueOnce(
    Promise.resolve(`\
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
`),
  );

  expect(await loadAgent("./local-mcp.yaml")).toBe(fsMcp);
  expect(from).toHaveBeenLastCalledWith(
    expect.objectContaining({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    }),
  );

  readFile.mockRestore();
});

test("loadAgent should error if MCP agent options is not valid", async () => {
  spyOn(nodejs.fs, "readFile").mockReturnValueOnce(
    Promise.resolve(`\
type: mcp
`),
  );

  expect(loadAgent("./local-mcp.yaml")).rejects.toThrow("Missing url or command in mcp agent");
});

test("loadAgent should support nested relative prompt paths", async () => {
  const aigne = await AIGNE.load(join(import.meta.dirname, "../../test-agents"));

  const agent = aigne.agents["test-relative-prompt-paths"];

  assert(agent instanceof AIAgent);

  expect(await agent.instructions.build({})).toMatchInlineSnapshot(`
    {
      "messages": [
        {
          "content": 
    "You are a professional chatbot.

    Please output in native English

    This is content of prompt-c.md

    This is content of prompt-d.md


    "
    ,
          "name": undefined,
          "role": "system",
        },
      ],
      "modelOptions": undefined,
      "outputFileType": undefined,
      "responseFormat": undefined,
      "toolAgents": undefined,
      "toolChoice": undefined,
      "tools": undefined,
    }
  `);
});

test("loadAgent should load agent with multi roles instructions", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-agent-with-multi-roles-instructions.yaml"),
  );

  assert(agent instanceof AIAgent);

  expect(
    await agent.instructions.build({
      input: { topic: "AIGNE is the best framework to build AI applications." },
    }),
  ).toMatchInlineSnapshot(`
    {
      "messages": [
        {
          "content": 
    "You are a smart agent that helps with code editing and understanding.

    <topic>
    AIGNE is the best framework to build AI applications.
    </topic>
    "
    ,
          "name": undefined,
          "role": "system",
        },
        {
          "content": "This is a user instruction.",
          "name": undefined,
          "role": "user",
        },
        {
          "content": "This is an agent instruction.",
          "name": undefined,
          "role": "agent",
          "toolCalls": undefined,
        },
        {
          "content": "Latest user instruction about AIGNE is the best framework to build AI applications.",
          "name": undefined,
          "role": "user",
        },
      ],
      "modelOptions": undefined,
      "outputFileType": undefined,
      "responseFormat": undefined,
      "toolAgents": undefined,
      "toolChoice": undefined,
      "tools": undefined,
    }
  `);
});
