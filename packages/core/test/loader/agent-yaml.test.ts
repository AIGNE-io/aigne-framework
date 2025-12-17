import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AFS } from "@aigne/afs";
import {
  type Agent,
  AIAgent,
  AIGNE,
  ProcessMode,
  type PromptBuilder,
  stringToAgentResponseStream,
  TeamAgent,
  TransformAgent,
} from "@aigne/core";
import { loadAgentFromYamlFile } from "@aigne/core/loader/agent-yaml.js";
import { loadAgent } from "@aigne/core/loader/index.js";
import { pick } from "@aigne/core/utils/type-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { ZodType } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { OpenAIChatModel } from "../_mocks/mock-models.js";

test("loadAgentFromYaml should load AIAgent correctly", async () => {
  const agent = await loadAgent(join(import.meta.dirname, "../../test-agents/chat.yaml"), {
    model: (o) =>
      new OpenAIChatModel({
        model: typeof o?.model === "string" ? o.model : undefined,
        modelOptions: o,
      }),
  });

  expect(agent).toBeInstanceOf(AIAgent);
  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");

  expect({
    name: agent.name,
    model: {
      ...agent.model?.options?.modelOptions,
      model: agent.model?.options?.model,
    },
    alias: agent.alias,
    description: agent.description,
    instructions: extractInstructions(agent.instructions),
    auto_reorder_system_messages: agent.autoReorderSystemMessages,
    auto_merge_system_messages: agent.autoMergeSystemMessages,
    input_key: agent.inputKey,
    output_key: agent.outputKey,
    input_file_key: agent.inputFileKey,
    output_file_key: agent.outputFileKey,
    keep_text_in_tool_uses: agent.keepTextInToolUses,
    catch_tools_error: agent.catchToolsError,
    skills: agent.skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      input_schema: zodToJsonSchema(skill.inputSchema),
      output_schema: zodToJsonSchema(skill.outputSchema),
      default_input: skill.defaultInput,
    })),
    includeInputInOutput: agent.includeInputInOutput,
    toolCallsConcurrency: agent.toolCallsConcurrency,
  }).toMatchSnapshot();
});

test("loadAgentFromYaml should error if agent.yaml file is invalid", async () => {
  spyOn(nodejs.fs, "readFile")
    .mockReturnValueOnce(Promise.reject(new Error("no such file or directory")))
    .mockReturnValueOnce(Promise.resolve("[this is not a valid yaml}"))
    .mockReturnValueOnce(Promise.resolve("name: 123"));

  expect(loadAgentFromYamlFile("./not-exist-aigne.yaml", {})).rejects.toThrow(
    "no such file or directory",
  );

  expect(loadAgentFromYamlFile("./invalid-aigne.yaml", {})).rejects.toThrow(
    "Failed to parse agent definition",
  );

  expect(loadAgentFromYamlFile("./invalid-content-aigne.yaml", {})).rejects.toThrow(
    "Failed to validate agent definition",
  );
});

test("loadAgentFromYaml should load mcp agent correctly", async () => {
  spyOn(nodejs.fs, "readFile")
    .mockReturnValueOnce(
      Promise.resolve(`\
type: mcp
url: http://localhost:3000/sse
`),
    )
    .mockReturnValueOnce(
      Promise.resolve(`\
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
`),
    );

  expect(await loadAgentFromYamlFile("./remote-mcp.yaml", {})).toMatchInlineSnapshot(`
    {
      "model": undefined,
      "skills": undefined,
      "type": "mcp",
      "url": "http://localhost:3000/sse",
    }
  `);

  expect(await loadAgentFromYamlFile("./local-mcp.yaml", {})).toMatchInlineSnapshot(`
    {
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        ".",
      ],
      "command": "npx",
      "model": undefined,
      "skills": undefined,
      "type": "mcp",
    }
  `);
});

test("loadAgentFromYaml should load TeamAgent correctly", async () => {
  const agent = await loadAgent(join(import.meta.dirname, "../../test-agents/team.yaml"), {});

  expect(agent).toBeInstanceOf(TeamAgent);
  assert(agent instanceof TeamAgent, "agent should be an instance of AIAgent");

  expect(agent).toEqual(
    expect.objectContaining({
      name: "test-team-agent",
      description: "Test team agent",
      mode: ProcessMode.parallel,
    }),
  );

  expect(agent.skills.length).toBe(2);
  expect(agent.iterateOn).toBe("sections");
});

test("loadAgentFromYaml should load AIAgent with prompt file correctly", async () => {
  const model = new OpenAIChatModel();

  const aigne = new AIGNE({ model });

  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/chat-with-prompt.yaml"),
    {},
  );

  expect(agent).toBeInstanceOf(AIAgent);
  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");

  expect(extractInstructions(agent.instructions)).toMatchSnapshot();

  const modelProcess = spyOn(model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("Hello, this is a test response message"),
  );
  await aigne.invoke(agent, {
    language: "English",
  });
  expect(pick(modelProcess.mock.lastCall?.at(0) as any, "messages")).toMatchSnapshot({});
});

test("loadAgentFromYaml should load nested agent correctly", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/nested-agent.yaml"),
    {},
  );

  expect(agent).toBeInstanceOf(TeamAgent);
  expect(agent.name).toMatchInlineSnapshot(`"test-nested-agent"`);
  expect(agent.description).toMatchInlineSnapshot(`"Test nested agent"`);

  const flatten = (agent: Agent): unknown => {
    return {
      name: agent.name,
      instructions: agent instanceof AIAgent ? extractInstructions(agent.instructions) : undefined,
      inputSchema:
        agent["_inputSchema"] instanceof ZodType
          ? zodToJsonSchema(agent["_inputSchema"])
          : undefined,
      outputSchema:
        agent["_outputSchema"] instanceof ZodType
          ? zodToJsonSchema(agent["_outputSchema"])
          : undefined,
      skills: agent.skills.map((i) => flatten(i)),
    };
  };

  expect(flatten(agent)).toMatchSnapshot();
});

test("loadAgentFromYaml should load transform agent correctly", async () => {
  const agent = await loadAgent(join(import.meta.dirname, "../../test-agents/transform.yaml"), {});

  expect(agent).toBeInstanceOf(TransformAgent);
  assert(agent instanceof TransformAgent);
  expect(agent.name).toMatchInlineSnapshot(`"transform-agent"`);
  expect(agent.description).toMatchInlineSnapshot(`
    "A Transform Agent that processes input data using JSONata expressions.
    "
  `);
  expect(agent["jsonata"]).toMatchInlineSnapshot(`
    "{
      userId: user_id,
      userName: user_name,
      createdAt: created_at
    }
    "
  `);
});

test("loadAgentFromYaml should load external schema agent correctly", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/external-schema-agent.yaml"),
    {},
  );

  expect(zodToJsonSchema(agent.inputSchema)).toMatchSnapshot();
  expect(zodToJsonSchema(agent.outputSchema)).toMatchSnapshot();
});

test("loadAgentFromYaml should load nested external schema agent correctly", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/external-schema-agent-nested.yaml"),
    {},
  );

  expect(zodToJsonSchema(agent.inputSchema)).toMatchSnapshot();
  expect(zodToJsonSchema(agent.outputSchema)).toMatchSnapshot();
});

test("loadAgentFromYaml should support various styles of naming", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-agent-input-naming.yaml"),
    {},
  );

  expect(zodToJsonSchema(agent.inputSchema)).toMatchSnapshot();
  expect(zodToJsonSchema(agent.outputSchema)).toMatchSnapshot();
});

test("loadAgentFromYaml should support default input", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-agent-with-default-input.yaml"),
    {},
  );

  expect({
    name: agent.name,
    skills: agent.skills.map((i) => ({
      name: i.name,
      input_schema: zodToJsonSchema(i.inputSchema),
      default_input: i.defaultInput,
    })),
  }).toMatchSnapshot();
});

test("loadAgentFromYaml should support hooks", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-agent-with-hooks.yaml"),
    {},
  );

  expect({
    name: agent.name,
    hooks: agent.hooks.map((i) =>
      Object.fromEntries(Object.entries(i).map(([k, v]) => [k, k === "priority" ? v : v?.name])),
    ),
    skills: agent.skills.map((i) => ({
      name: i.name,
      hooks: agent.hooks.map((i) =>
        Object.fromEntries(Object.entries(i).map(([k, v]) => [k, k === "priority" ? v : v?.name])),
      ),
    })),
  }).toMatchSnapshot();
});

test("loadAgentFromYaml should support reflection for TeamAgent", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/team-agent-with-reflection.yaml"),
    {},
  );

  assert(agent instanceof TeamAgent, "agent should be an instance of TeamAgent");

  expect({
    name: agent.name,
    skills: agent.skills.map((i) => ({
      name: i.name,
    })),
    reflection: agent.reflection && {
      ...agent.reflection,
      reviewer: {
        name: agent.reflection.reviewer.name,
      },
    },
  }).toMatchSnapshot();
});

test("loadAgentFromYaml should support reflection for TeamAgent with inline reviewer", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/team-agent-with-reflection-inline.yaml"),
    {},
  );

  assert(agent instanceof TeamAgent, "agent should be an instance of TeamAgent");

  expect({
    name: agent.name,
    skills: agent.skills.map((i) => ({
      name: i.name,
    })),
    reflection: agent.reflection && {
      ...agent.reflection,
      reviewer: {
        name: agent.reflection.reviewer.name,
      },
    },
  }).toMatchSnapshot();
});

function extractInstructions(builder: PromptBuilder): string {
  if (typeof builder.instructions === "string") return builder.instructions;
  return builder.instructions?.messages.map((i) => `${i.role}: ${i.content}`).join("\n\n") || "";
}

test("loadAgentFromYaml should load AIAgent with AFS correctly", async () => {
  const agent = await loadAgent(join(import.meta.dirname, "../../test-agents/test-afs.yaml"), {
    afs: {
      availableModules: [
        { module: "history", load: (options) => ({ name: "AFSHistory", options }) },
        { module: "local-fs", load: (options) => ({ name: "AFSLocalFS", options }) },
      ],
    },
  });

  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");

  expect(agent.afs).toBeInstanceOf(AFS);
});

test("loadAgentFromYaml should load AIAgent with AFS drivers correctly", async () => {
  // Track options passed to create functions
  let moduleOptions: any;
  let driverOptions: any;

  // Mock module for testing
  const createMockModule = (options: any) => {
    moduleOptions = options;
    return {
      name: "local-fs",
      description: "Mock local-fs module",
    };
  };

  // Mock driver for testing
  const createMockDriver = (options: any) => {
    driverOptions = options;
    return {
      name: "i18n",
      description: "Mock i18n driver",
      capabilities: { dimensions: ["language" as const] },
      canHandle: (view: { language?: string }) => !!view.language,
      process: async () => ({ result: { id: "test", path: "/test", content: "translated" } }),
    };
  };

  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-afs-driver.yaml"),
    {
      afs: {
        availableModules: [{ module: "local-fs", create: createMockModule }],
        availableDrivers: [{ driver: "i18n", create: createMockDriver }],
      },
    },
  );

  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");
  expect(agent.afs).toBeInstanceOf(AFS);
  expect(agent.afs?.drivers).toHaveLength(1);
  expect(agent.afs?.drivers[0]?.name).toBe("i18n");

  // Verify options are passed as-is from YAML (not camelized)
  expect(moduleOptions).toEqual({ local_path: "./test-docs" });
  expect(driverOptions).toEqual({
    default_source_language: "zh",
    supported_languages: ["en", "ja"],
  });
});

test("loadAgentFromYaml should load AIAgent with AFS storage config correctly", async () => {
  // Mock module for testing
  const createMockModule = () => ({
    name: "local-fs",
    description: "Mock local-fs module",
  });

  // Mock driver for testing
  const createMockDriver = () => ({
    name: "i18n",
    description: "Mock i18n driver",
    capabilities: { dimensions: ["language" as const] },
    canHandle: (view: { language?: string }) => !!view.language,
    process: async () => ({ result: { id: "test", path: "/test", content: "translated" } }),
  });

  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-afs-storage.yaml"),
    {
      afs: {
        availableModules: [{ module: "local-fs", create: createMockModule }],
        availableDrivers: [{ driver: "i18n", create: createMockDriver }],
      },
    },
  );

  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");
  expect(agent.afs).toBeInstanceOf(AFS);

  // Verify that AFS was created with storage config
  // The storage config should be passed through to AFS constructor
  expect(agent.afs?.drivers).toHaveLength(1);
});

test("loadAgentFromYaml should inline function correctly", async () => {
  const agent = await loadAgent(
    join(import.meta.dirname, "../../test-agents/test-inline-function.yaml"),
    {},
  );

  expect(agent.invoke({ num: 2 })).resolves.toMatchInlineSnapshot(`
    {
      "result": 4,
    }
  `);
});
