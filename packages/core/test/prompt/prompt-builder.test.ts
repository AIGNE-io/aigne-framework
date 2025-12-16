import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import {
  AIAgent,
  AIAgentToolChoice,
  AIGNE,
  ChatMessagesTemplate,
  FunctionAgent,
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
    await builder.buildPrompt({
      input: { topic: "a cat" },
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
    data: [
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
    You can use these tools to manage and retrieve files as needed.


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
    data: [
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
    You can use these tools to manage and retrieve files as needed.


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
            "description": "Browse directory structure as a tree view. Use when exploring directory contents or understanding file organization.",
            "name": "afs_list",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "options": {
                  "additionalProperties": false,
                  "properties": {
                    "disableGitignore": {
                      "description": "Disable .gitignore filtering, default is enabled",
                      "type": "boolean",
                    },
                    "format": {
                      "default": "tree",
                      "description": "Output format, either 'tree' or 'list' (default: 'tree')",
                      "enum": [
                        "tree",
                        "list",
                      ],
                      "type": "string",
                    },
                    "maxChildren": {
                      "description": "Maximum number of children to list per directory",
                      "type": "number",
                    },
                    "maxDepth": {
                      "description": "Tree depth limit (default: 1)",
                      "type": "number",
                    },
                  },
                  "required": [],
                  "type": "object",
                },
                "path": {
                  "description": "Absolute directory path to browse",
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
            "description": "Search file contents by keywords. Use when finding files containing specific text or code patterns.",
            "name": "afs_search",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "options": {
                  "additionalProperties": false,
                  "properties": {
                    "caseSensitive": {
                      "description": "Case-sensitive search (default: false)",
                      "type": "boolean",
                    },
                    "limit": {
                      "description": "Max results to return",
                      "type": "number",
                    },
                  },
                  "required": [],
                  "type": "object",
                },
                "path": {
                  "description": "Absolute directory path to search in",
                  "type": "string",
                },
                "query": {
                  "description": "Search keywords or patterns",
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
            "description": "Read complete file contents. Use when you need to review, analyze, or understand file content before making changes.",
            "name": "afs_read",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "path": {
                  "description": "Absolute file path to read",
                  "type": "string",
                },
                "withLineNumbers": {
                  "description": "Include line numbers in output (required when planning to edit the file)",
                  "type": "boolean",
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
            "description": "Create new file or append content to existing file. Use when creating files, rewriting entire files, or appending to files.",
            "name": "afs_write",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "append": {
                  "default": false,
                  "description": "Append mode: add content to end of file (default: false, overwrites file)",
                  "type": "boolean",
                },
                "content": {
                  "description": "Complete file content or content to append",
                  "type": "string",
                },
                "path": {
                  "description": "Absolute file path to write",
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
            "description": "Apply precise line-based patches to modify file content. Use when making targeted changes without rewriting the entire file.",
            "name": "afs_edit",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "patches": {
                  "description": "List of patches to apply sequentially",
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "delete": {
                        "description": "Delete mode: true to delete lines, false to replace",
                        "type": "boolean",
                      },
                      "end_line": {
                        "description": "End line number (0-based, exclusive)",
                        "type": "integer",
                      },
                      "replace": {
                        "description": "New content to replace the line range",
                        "type": "string",
                      },
                      "start_line": {
                        "description": "Start line number (0-based, inclusive)",
                        "type": "integer",
                      },
                    },
                    "required": [
                      "start_line",
                      "end_line",
                      "delete",
                    ],
                    "type": "object",
                  },
                  "minItems": 1,
                  "type": "array",
                },
                "path": {
                  "description": "Absolute file path to edit",
                  "type": "string",
                },
              },
              "required": [
                "path",
                "patches",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
        {
          "function": {
            "description": "Permanently delete files or directories. Use when removing unwanted files or cleaning up temporary data.",
            "name": "afs_delete",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "path": {
                  "description": "Absolute file or directory path to delete",
                  "type": "string",
                },
                "recursive": {
                  "default": false,
                  "description": "Allow directory deletion (default: false, required for directories)",
                  "type": "boolean",
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
            "description": "Rename or move files and directories. Use when reorganizing files, changing names, or moving to different locations.",
            "name": "afs_rename",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "newPath": {
                  "description": "Absolute new file or directory path",
                  "type": "string",
                },
                "oldPath": {
                  "description": "Absolute current file or directory path",
                  "type": "string",
                },
                "overwrite": {
                  "default": false,
                  "description": "Overwrite if destination exists (default: false)",
                  "type": "boolean",
                },
              },
              "required": [
                "oldPath",
                "newPath",
              ],
              "type": "object",
            },
          },
          "type": "function",
        },
        {
          "function": {
            "description": "Execute functions or commands from AFS modules. Use when running operations provided by mounted modules.",
            "name": "afs_exec",
            "parameters": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "args": {
                  "description": "JSON string of arguments matching the function's input schema",
                  "type": "string",
                },
                "path": {
                  "description": "Absolute path to the executable function in AFS",
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

test("PromptBuilder should support all builtin variables", async () => {
  const builder = new PromptBuilder({
    instructions: `\
{% if $afs.enabled %}
## AFS

{{ $afs.description }}

${"```"}yaml alt="$afs.histories"
{{ $afs.histories | yaml.stringify }}
${"```"}

${"```"}yaml alt="$afs.modules"
{{ $afs.modules | yaml.stringify }}
${"```"}

${"```"}yaml alt="$afs.skills"
{{ $afs.skills | yaml.stringify }}
${"```"}
{% endif %}

## Agent Skills
${"```"}yaml alt="$agent.skills"
{{ $agent.skills | yaml.stringify }}
${"```"}
`,
  });

  const afs = new AFS().mount(new AFSHistory());

  const agent = AIAgent.from({
    afs,
    historyConfig: {
      disabled: true,
    },
    skills: [
      FunctionAgent.from({
        name: "TestSkill1",
        description: "Test skill 1 description",
        process: () => ({}),
      }),
      FunctionAgent.from({
        name: "TestSkill2",
        description: "Test skill 2 description",
        process: () => ({}),
      }),
    ],
  });

  spyOn(afs, "list").mockResolvedValue({
    data: [
      {
        id: "1",
        path: "/modules/history/1",
        content: {
          input: { message: "hello" },
          output: { message: "Hello, How can I assist you today?" },
        },
      },
    ],
  });

  expect((await builder.build({ agent })).messages).toMatchInlineSnapshot(`
    [
      {
        "content": 
    "
    ## AFS

    AFS (Agentic File System) provides tools to interact with a virtual file system,
    allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
    You can use these tools to manage and retrieve files as needed.


    \`\`\`yaml alt="$afs.histories"
    - role: user
      content:
        message: hello
    - role: agent
      content:
        message: Hello, How can I assist you today?

    \`\`\`

    \`\`\`yaml alt="$afs.modules"
    - path: /modules/history
      name: history

    \`\`\`

    \`\`\`yaml alt="$afs.skills"
    - name: afs_list
      description: Browse directory structure as a tree view. Use when exploring
        directory contents or understanding file organization.
    - name: afs_search
      description: Search file contents by keywords. Use when finding files containing
        specific text or code patterns.
    - name: afs_read
      description: Read complete file contents. Use when you need to review, analyze,
        or understand file content before making changes.
    - name: afs_write
      description: Create new file or append content to existing file. Use when
        creating files, rewriting entire files, or appending to files.
    - name: afs_edit
      description: Apply precise line-based patches to modify file content. Use when
        making targeted changes without rewriting the entire file.
    - name: afs_delete
      description: Permanently delete files or directories. Use when removing unwanted
        files or cleaning up temporary data.
    - name: afs_rename
      description: Rename or move files and directories. Use when reorganizing files,
        changing names, or moving to different locations.
    - name: afs_exec
      description: Execute functions or commands from AFS modules. Use when running
        operations provided by mounted modules.

    \`\`\`


    ## Agent Skills
    \`\`\`yaml alt="$agent.skills"
    - name: TestSkill1
      description: Test skill 1 description
    - name: TestSkill2
      description: Test skill 2 description

    \`\`\`
    "
    ,
        "role": "system",
      },
    ]
  `);
});
