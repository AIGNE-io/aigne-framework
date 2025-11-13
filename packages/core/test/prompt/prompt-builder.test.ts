import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { AFS, AFSHistory } from "@aigne/afs";
import {
  AIAgent,
  AIAgentToolChoice,
  AIGNE,
  ChatMessagesTemplate,
  FunctionAgent,
  ImageAgent,
  MCPAgent,
  PromptBuilder,
  SystemMessageTemplate,
  TeamAgent,
  UserMessageTemplate,
} from "@aigne/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { MockMemory } from "../_mocks/mock-memory.js";

test("PromptBuilder should build messages correctly", async () => {
  const context = new AIGNE().newContext();

  context.userContext = {
    name: "Alice",
  };

  const builder = PromptBuilder.from(`\
Test instructions

question: {{question}}

name (from userContext): {{name}}

userContext.name: {{userContext.name}}
`);

  const memory = new MockMemory({});
  await memory.record(
    {
      content: [
        {
          input: { message: "Hello" },
          output: { message: "Hello, How can I help you?" },
          source: "TestAgent",
        },
      ],
    },

    context,
  );

  const agent = AIAgent.from({
    memory,
    inputKey: "message",
  });

  const prompt1 = await builder.build({
    agent,
    input: { message: "Hello", question: "What is AI?" },
    context,
  });

  expect(prompt1.messages).toMatchInlineSnapshot(`
    [
      {
        "content": 
    "Test instructions

    question: What is AI?

    name (from userContext): Alice

    userContext.name: Alice
    "
    ,
        "role": "system",
      },
      {
        "content": [
          {
            "text": "Hello",
            "type": "text",
          },
        ],
        "role": "user",
      },
      {
        "content": [
          {
            "text": "Hello, How can I help you?",
            "type": "text",
          },
        ],
        "role": "agent",
      },
      {
        "content": [
          {
            "text": "Hello",
            "type": "text",
          },
        ],
        "role": "user",
      },
    ]
  `);

  const prompt2 = await builder.build({
    input: { name: "foo" },
    context,
  });
  expect(prompt2.messages).toMatchInlineSnapshot(`
    [
      {
        "content": 
    "Test instructions

    question: 

    name (from userContext): foo

    userContext.name: Alice
    "
    ,
        "name": undefined,
        "role": "system",
      },
    ]
  `);
});

test("PromptBuilder should build response format correctly", async () => {
  const context = new AIGNE().newContext();

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    outputSchema: z.object({
      name: z.string(),
      age: z.number().optional(),
    }),
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.responseFormat).toEqual({
    type: "json_schema",
    jsonSchema: {
      name: "output",
      schema: expect.objectContaining({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
        additionalProperties: false,
      }),
      strict: true,
    },
  });
});

test("PromptBuilder should build skills correctly", async () => {
  const context = new AIGNE().newContext();

  const skill = FunctionAgent.from({
    name: "TestSkill",
    description: "Test skill description",
    process: () => ({}),
    inputSchema: z.object({
      name: z.string(),
      age: z.number().optional(),
    }),
  });

  const teamAgentSkill = TeamAgent.from({
    name: "TestTeamAgent",
    skills: [
      AIAgent.from({
        name: "TestSkillInTeamAgent1",
      }),
      AIAgent.from({
        name: "TestSkillInTeamAgent2",
      }),
    ],
  });

  // MCPAgent is not invokable, so we use it as a skill container
  const mcpAgentSkill = new MCPAgent({
    name: "TestMCPAgent",
    client: new Client({
      name: "TestClient",
      version: "1.0.0",
    }),
    skills: [
      AIAgent.from({
        name: "TestMCPSkill1",
        instructions: "TestMCPSkill1 instructions",
      }),
      AIAgent.from({
        name: "TestMCPSkill2",
        instructions: "TestMCPSkill2 instructions",
      }),
    ],
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    skills: [skill, teamAgentSkill, mcpAgentSkill],
    toolChoice: skill,
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.tools).toEqual([
    {
      type: "function",
      function: {
        name: "TestSkill",
        description: "Test skill description",
        parameters: expect.objectContaining({
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name"],
          additionalProperties: false,
        }),
      },
    },
    // TeamAgent as skill, nested skills should no longer be included in the tools
    {
      type: "function",
      function: {
        name: "TestTeamAgent",
        parameters: {},
      },
    },
    // MCPAgent is not invokable, so it should not be included in the tools, and the nested skills should be included
    {
      type: "function",
      function: {
        name: "TestMCPSkill1",
        parameters: {},
      },
    },
    {
      type: "function",
      function: {
        name: "TestMCPSkill2",
        parameters: {},
      },
    },
  ]);

  expect(prompt.toolChoice).toEqual({
    type: "function",
    function: {
      name: skill.name,
      description: skill.description,
    },
  });
});

test("PromptBuilder should unique skills correctly", async () => {
  const context = new AIGNE().newContext();

  const skill = FunctionAgent.from({
    name: "TestSkill",
    description: "Test skill description",
    process: () => ({}),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    skills: [skill, skill],
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.tools).toHaveLength(1);
});

test("PromptBuilder should build toolChoice with router mode correctly", async () => {
  const context = new AIGNE().newContext();

  const skill = FunctionAgent.from({
    name: "TestSkill",
    description: "Test skill description",
    process: () => ({}),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    skills: [skill],
    toolChoice: AIAgentToolChoice.router,
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.toolChoice).toEqual("required");
});

test("PromptBuilder from string", async () => {
  const context = new AIGNE().newContext();

  const builder = PromptBuilder.from("Hello, {{agentName}}!");

  const prompt = await builder.build({ input: { agentName: "Alice" }, context });

  expect(prompt).toEqual({
    messages: [
      {
        role: "system",
        content: "Hello, Alice!",
      },
    ],
  });
});

test("PromptBuilder from MCP prompt result", async () => {
  const context = new AIGNE().newContext();

  const prompt: GetPromptResult = {
    description: "Test prompt",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Hello",
        },
      },
      {
        role: "user",
        content: {
          type: "resource",
          resource: {
            uri: "echo://Hello",
            text: "Resource echo: Hello",
            mimeType: "text/plain",
          },
        },
      },
      {
        role: "user",
        content: {
          type: "resource",
          resource: {
            uri: "test://image-resource",
            blob: Buffer.from("FAKE IMAGE FROM RESOURCE").toString("base64"),
            mimeType: "image/png",
          },
        },
      },
      {
        role: "user",
        content: {
          type: "image",
          mimeType: "image/png",
          data: Buffer.from("FAKE IMAGE").toString("base64"),
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "How can I help you?",
        },
      },
    ],
  };

  const promptBuilder = PromptBuilder.from(prompt);
  expect(await promptBuilder.build({ context })).toEqual(
    expect.objectContaining({
      messages: [
        {
          role: "user",
          content: "Hello",
        },
        {
          role: "user",
          content: "Resource echo: Hello",
        },
        {
          role: "user",
          content: [
            { type: "url", url: Buffer.from("FAKE IMAGE FROM RESOURCE").toString("base64") },
          ],
        },
        {
          role: "user",
          content: [{ type: "url", url: Buffer.from("FAKE IMAGE").toString("base64") }],
        },
        {
          role: "agent",
          content: "How can I help you?",
        },
      ],
    }),
  );
});

test("PromptBuilder from file", async () => {
  const context = new AIGNE().newContext();

  const path = join(import.meta.dirname, "test-prompt.txt");

  const builder = PromptBuilder.from({ path });

  const prompt = await builder.build({
    input: { agentName: "Alice", language: "English" },
    context,
  });

  expect(prompt).toMatchSnapshot();
});

test("PromptBuilder should build image prompt correctly", async () => {
  const builder = PromptBuilder.from("Draw an image about {{topic}}");

  expect(
    await builder.buildImagePrompt({
      input: { topic: "a cat" },
      agent: ImageAgent.from({ instructions: builder }),
    }),
  ).toEqual({
    prompt: "Draw an image about a cat",
  });
});

test("PromptBuilder should build with afs correctly", async () => {
  const builder = new PromptBuilder({
    instructions: ChatMessagesTemplate.from([
      SystemMessageTemplate.from("Test instructions"),
      UserMessageTemplate.from("User message is: {{message}}"),
    ]),
  });

  const afs = new AFS().mount(new AFSHistory());

  spyOn(afs, "search").mockResolvedValueOnce({
    list: [
      {
        id: "1",
        path: "/modules/history/1",
        content: `Test file content 1`,
      },
      {
        id: "2",
        path: "/modules/history/2",
        content: `Test file content 2`,
      },
      {
        id: "3",
        path: "/modules/history/3",
        metadata: {
          execute: {
            name: "echo",
            inputSchema: zodToJsonSchema(z.object({ text: z.string() })),
          },
        },
      },
    ],
  });

  const agent = AIAgent.from({
    inputKey: "message",
    afs,
  });

  // Build without AFS history
  const result = await builder.build({
    agent,
    input: { message: "Hello, I'm Bob, I'm from ArcBlock" },
  });

  expect(result.messages).toMatchInlineSnapshot(`
    [
      {
        "content": 
    "Test instructions

    <afs_usage>
    AFS (Agentic File System) provides tools to interact with a virtual file system,
    allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
    Use these tools to manage and retrieve files as needed.

    Provided modules:
    - path: /modules/history
      name: history


    Global tools to interact with the AFS:
    1. afs_list: Browse directory contents like filesystem ls/tree command - shows files and folders in a given path
    2. afs_search: Find files by content keywords - use specific keywords related to what you're looking for
    3. afs_read: Read file contents - path must be an exact file path from list or search results
    4. afs_write: Write content to a file in the AFS
    5. afs_exec: Execute a executable tool from the available modules
    </afs_usage>

    <afs_executable_tools>
    Here are the executable tools available in the AFS you can use:

    - path: /modules/history/3
      name: echo
      inputSchema:
        type: object
        properties:
          text:
            type: string
        required:
          - text
        additionalProperties: false
        $schema: http://json-schema.org/draft-07/schema#

    </afs_executable_tools>

    <related-memories>
    - content: Test file content 1
    - content: Test file content 2

    </related-memories>
    "
    ,
        "role": "system",
      },
      {
        "content": "User message is: Hello, I'm Bob, I'm from ArcBlock",
        "name": undefined,
        "role": "user",
      },
    ]
  `);

  const listSpy = spyOn(afs, "list").mockResolvedValueOnce({
    list: [
      {
        id: "1",
        path: "/history/1",
        content: { input: { message: "I'm Bob" }, output: { message: "Hello, Bob!" } },
      },
      {
        id: "1",
        path: "/history/1",
        content: { input: { message: "Hello" }, output: { message: "Hello, How can I help you?" } },
      },
    ],
  });

  const result1 = await builder.build({
    agent,
    input: { message: "Hello, I'm Bob, I'm from ArcBlock" },
  });

  expect(listSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/modules/history",
        {
          "limit": 10,
          "orderBy": [
            [
              "createdAt",
              "desc",
            ],
          ],
        },
      ],
    ]
  `);

  expect(result1).toMatchInlineSnapshot(
    { toolAgents: expect.anything() },
    `
    {
      "messages": [
        {
          "content": 
    "Test instructions

    <afs_usage>
    AFS (Agentic File System) provides tools to interact with a virtual file system,
    allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
    Use these tools to manage and retrieve files as needed.

    Provided modules:
    - path: /modules/history
      name: history


    Global tools to interact with the AFS:
    1. afs_list: Browse directory contents like filesystem ls/tree command - shows files and folders in a given path
    2. afs_search: Find files by content keywords - use specific keywords related to what you're looking for
    3. afs_read: Read file contents - path must be an exact file path from list or search results
    4. afs_write: Write content to a file in the AFS
    5. afs_exec: Execute a executable tool from the available modules
    </afs_usage>
    "
    ,
          "role": "system",
        },
        {
          "content": [
            {
              "text": "Hello",
              "type": "text",
            },
          ],
          "role": "user",
        },
        {
          "content": [
            {
              "text": "Hello, How can I help you?",
              "type": "text",
            },
          ],
          "role": "agent",
        },
        {
          "content": [
            {
              "text": "I'm Bob",
              "type": "text",
            },
          ],
          "role": "user",
        },
        {
          "content": [
            {
              "text": "Hello, Bob!",
              "type": "text",
            },
          ],
          "role": "agent",
        },
        {
          "content": "User message is: Hello, I'm Bob, I'm from ArcBlock",
          "name": undefined,
          "role": "user",
        },
      ],
      "modelOptions": undefined,
      "outputFileType": undefined,
      "responseFormat": undefined,
      "toolAgents": Anything,
      "toolChoice": "auto",
      "tools": [
        {
          "function": {
            "description": "Browse directory contents in the AFS like filesystem ls/tree command - shows files and folders in the specified path",
            "name": "afs_list",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "options": {
                  "additionalProperties": false,
                  "properties": {
                    "limit": {
                      "description": "Maximum number of entries to return",
                      "type": "number",
                    },
                    "maxDepth": {
                      "description": "Maximum depth to list files",
                      "type": "number",
                    },
                    "recursive": {
                      "description": "Whether to list files recursively",
                      "type": "boolean",
                    },
                  },
                  "required": [],
                  "type": "object",
                },
                "path": {
                  "description": "The directory path to browse (e.g., '/', '/docs', '/src')",
                  "type": "string",
                },
              },
              "required": [
                "path",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
        {
          "function": {
            "description": "Find files by searching content using keywords - returns matching files with their paths",
            "name": "afs_search",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "options": {
                  "additionalProperties": false,
                  "properties": {
                    "limit": {
                      "description": "Maximum number of entries to return",
                      "type": "number",
                    },
                  },
                  "required": [],
                  "type": "object",
                },
                "path": {
                  "description": "The directory path to search in (e.g., '/', '/docs')",
                  "type": "string",
                },
                "query": {
                  "description": "Keywords to search for in file contents (e.g., 'function authentication', 'database config')",
                  "type": "string",
                },
              },
              "required": [
                "path",
                "query",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
        {
          "function": {
            "description": "Read file contents from the AFS - path must be an exact file path from list or search results",
            "name": "afs_read",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "path": {
                  "description": "Exact file path from list or search results (e.g., '/docs/api.md', '/src/utils/helper.js')",
                  "type": "string",
                },
              },
              "required": [
                "path",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
        {
          "function": {
            "description": "Create or update a file in the AFS with new content - overwrites existing files",
            "name": "afs_write",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "content": {
                  "description": "The text content to write to the file",
                  "type": "string",
                },
                "path": {
                  "description": "Full file path where to write content (e.g., '/docs/new-file.md', '/src/component.js')",
                  "type": "string",
                },
              },
              "required": [
                "path",
                "content",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
        {
          "function": {
            "description": "Execute a function or command available in the AFS modules",
            "name": "afs_exec",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "args": {
                  "description": "JSON stringified arguments to pass to the executable, must be an object matching the input schema of the executable",
                  "type": "string",
                },
                "path": {
                  "description": "The exact path to the executable entry in AFS",
                  "type": "string",
                },
              },
              "required": [
                "path",
                "args",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
      ],
    }
  `,
  );
});

test("PromptBuilder should refine system messages by config", async () => {
  const builder = new PromptBuilder({
    instructions: ChatMessagesTemplate.from([
      SystemMessageTemplate.from("System message 1"),
      UserMessageTemplate.from("User message 1"),
      SystemMessageTemplate.from("System message 2"),
    ]),
  });

  const agent = AIAgent.from({
    autoMergeSystemMessages: false,
    autoReorderSystemMessages: false,
  });

  expect((await builder.build({ agent })).messages).toMatchInlineSnapshot(`
    [
      {
        "content": "System message 1",
        "name": undefined,
        "role": "system",
      },
      {
        "content": "System message 2",
        "name": undefined,
        "role": "system",
      },
      {
        "content": "User message 1",
        "name": undefined,
        "role": "user",
      },
    ]
  `);

  agent.autoReorderSystemMessages = true;
  expect((await builder.build({ agent })).messages).toMatchInlineSnapshot(`
    [
      {
        "content": "System message 1",
        "name": undefined,
        "role": "system",
      },
      {
        "content": "System message 2",
        "name": undefined,
        "role": "system",
      },
      {
        "content": "User message 1",
        "name": undefined,
        "role": "user",
      },
    ]
  `);

  agent.autoMergeSystemMessages = true;
  expect((await builder.build({ agent })).messages).toMatchInlineSnapshot(`
    [
      {
        "content": 
    "System message 1
    System message 2"
    ,
        "role": "system",
      },
      {
        "content": "User message 1",
        "name": undefined,
        "role": "user",
      },
    ]
  `);
});
