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

  const agent = AIAgent.from({
    inputKey: "message",
  });

  const prompt1 = await builder.build({
    agent,
    input: { message: "Hello", question: "What is AI?" },
    context,
  });

  expect(prompt1.userMessage).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "text": "Hello",
          "type": "text",
        },
      ],
      "role": "user",
    }
  `);

  const prompt2 = await builder.build({
    input: { name: "foo" },
    context,
  });
  expect(prompt2.userMessage).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "text": 
    "Test instructions

    question: 

    name (from userContext): foo

    userContext.name: Alice
    "
    ,
          "type": "text",
        },
      ],
      "role": "user",
    }
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

  expect(prompt.userMessage).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "text": "Hello, Alice!",
          "type": "text",
        },
      ],
      "role": "user",
    }
  `);
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
  expect((await promptBuilder.build({ context })).userMessage).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "text": "Hello",
          "type": "text",
        },
        {
          "text": "Resource echo: Hello",
          "type": "text",
        },
        {
          "type": "url",
          "url": "RkFLRSBJTUFHRSBGUk9NIFJFU09VUkNF",
        },
        {
          "type": "url",
          "url": "RkFLRSBJTUFHRQ==",
        },
        {
          "text": "How can I help you?",
          "type": "text",
        },
      ],
      "role": "user",
    }
  `);
});

test("PromptBuilder from file", async () => {
  const context = new AIGNE().newContext();

  const path = join(import.meta.dirname, "test-prompt.txt");

  const builder = PromptBuilder.from({ path });

  const prompt = await builder.build({
    input: { agentName: "Alice", language: "English" },
    context,
  });

  expect(prompt.userMessage).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "text": 
    "## instructions

    You are Alice, a professional customer service.

    Output in English

    "
    ,
          "type": "text",
        },
      ],
      "role": "user",
    }
  `);
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
      SystemMessageTemplate.from(
        "Test instructions\n{{ $afs.description }}\n{{ $afs.modules | yaml.stringify }}",
      ),
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

  expect([...(await result.session.getMessages()), result.userMessage]).toMatchInlineSnapshot(`
    [
      {
        "content": [
          {
            "text": 
    "Test instructions
    AFS (Agentic File System) provides tools to interact with a virtual file system,
    allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
    You can use these tools to manage and retrieve files as needed.

    - path: /modules/history
      name: history
    "
    ,
            "type": "text",
          },
        ],
        "role": "system",
      },
      {
        "content": [
          {
            "text": "User message is: Hello, I'm Bob, I'm from ArcBlock",
            "type": "text",
          },
        ],
        "role": "user",
      },
    ]
  `);

  spyOn(afs, "list")
    .mockResolvedValueOnce({
      // for compact query
      data: [],
    })
    .mockResolvedValueOnce({
      data: [
        {
          id: "1",
          path: "/history/1",
          content: {
            input: { message: "I'm Bob" },
            output: { message: "Hello, Bob!" },
            messages: [
              { role: "user", content: "I'm Bob" },
              { role: "agent", content: "Hello, Bob!" },
            ],
          },
        },
        {
          id: "1",
          path: "/history/1",
          content: {
            input: { message: "Hello" },
            output: { message: "Hello, How can I help you?" },
            messages: [
              { role: "user", content: "Hello" },
              { role: "agent", content: "Hello, How can I help you?" },
            ],
          },
        },
      ],
    });

  const result1 = await builder.build({
    agent,
    input: { message: "Hello, I'm Bob, I'm from ArcBlock" },
  });

  expect([...(await result1.session.getMessages()), result1.userMessage]).toMatchInlineSnapshot(
    `
    [
      {
        "content": [
          {
            "text": 
    "Test instructions
    AFS (Agentic File System) provides tools to interact with a virtual file system,
    allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
    You can use these tools to manage and retrieve files as needed.

    - path: /modules/history
      name: history
    "
    ,
            "type": "text",
          },
        ],
        "role": "system",
      },
      {
        "content": "Hello",
        "role": "user",
      },
      {
        "content": "Hello, How can I help you?",
        "role": "agent",
      },
      {
        "content": "I'm Bob",
        "role": "user",
      },
      {
        "content": "Hello, Bob!",
        "role": "agent",
      },
      {
        "content": [
          {
            "text": "User message is: Hello, I'm Bob, I'm from ArcBlock",
            "type": "text",
          },
        ],
        "role": "user",
      },
    ]
  `,
  );
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

  expect(await (await builder.build({ agent })).userMessage).toMatchInlineSnapshot(
    `
      {
        "content": [
          {
            "text": 
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
        description: >-
          List contents within the Agentic File System (AFS)

          - Returns files and directories at the specified AFS path

          - Supports recursive listing with configurable depth

          - Supports glob pattern filtering to match specific files

          - By default respects .gitignore rules to filter out ignored files

          - Use this tool when you need to explore AFS contents or understand file
          organization


          Usage:

          - The path must be an absolute AFS path starting with "/" (e.g., "/",
          "/docs", "/memory/user")

          - This is NOT a local system file path - it operates within the AFS virtual
          file system

          - Use maxDepth to control recursion depth (default: 1, current directory
          only)

          - Use pattern to filter entries by glob pattern:
            - "*.ts" - match TypeScript files in current directory
            - "**/*.js" - match all JavaScript files recursively
            - "src/**/*.{ts,tsx}" - match TypeScript files in src directory
          - Results are filtered by .gitignore by default; set disableGitignore to
          include ignored files
      - name: afs_search
        description: >-
          Search file contents within the Agentic File System (AFS)

          - Searches for files containing specific text, keywords, or patterns

          - Returns matching entries with their content and metadata

          - Supports case-sensitive and case-insensitive search modes

          - Use this tool when you need to find files by their content


          Usage:

          - The path must be an absolute AFS path starting with "/" (e.g., "/",
          "/docs", "/memory")

          - This is NOT a local system file path - it operates within the AFS virtual
          file system

          - The query can be keywords, phrases, or text patterns to search for

          - Use limit to control the number of results returned

          - Search is case-insensitive by default; set caseSensitive to true for exact
          case matching
      - name: afs_read
        description: >-
          Read file contents from the Agentic File System (AFS)

          - Returns the content of a file at the specified AFS path

          - By default reads up to 2000 lines, use offset/limit for large files

          - Lines longer than 2000 characters will be truncated


          Usage:

          - The path must be an absolute AFS path starting with "/" (e.g.,
          "/docs/readme.md")

          - Use offset to start reading from a specific line (0-based)

          - Use limit to control number of lines returned (default: 2000)

          - Check truncated field to know if file was partially returned
      - name: afs_write
        description: >-
          Write or create files in the Agentic File System (AFS)

          - Creates a new file or overwrites an existing file with the provided
          content

          - Supports append mode to add content to the end of existing files

          - Use this tool when creating new files or completely replacing file
          contents


          Usage:

          - The path must be an absolute AFS path starting with "/" (e.g.,
          "/docs/new-file.md", "/memory/user/notes")

          - This is NOT a local system file path - it operates within the AFS virtual
          file system

          - By default, this tool overwrites the entire file content

          - Use append mode to add content to the end of an existing file without
          replacing it

          - For partial edits to existing files, prefer using afs_edit instead
      - name: afs_edit
        description: >-
          Performs exact string replacements in files within the Agentic File System
          (AFS).


          Usage:

          - You must use afs_read at least once before editing to understand the file
          content

          - The path must be an absolute AFS path starting with "/" (e.g.,
          "/docs/readme.md")

          - Preserve exact indentation (tabs/spaces) as it appears in the file

          - The edit will FAIL if oldString is not found in the file

          - The edit will FAIL if oldString appears multiple times (unless replaceAll
          is true)

          - Use replaceAll to replace/rename strings across the entire file
      - name: afs_delete
        description: >-
          Permanently delete files or directories from the Agentic File System (AFS)

          - Removes files or directories at the specified AFS path

          - Supports recursive deletion for directories with contents

          - Use with caution as deletion is permanent


          Usage:

          - The path must be an absolute AFS path starting with "/" (e.g.,
          "/docs/old-file.md", "/temp")

          - This is NOT a local system file path - it operates within the AFS virtual
          file system

          - To delete a directory, you MUST set recursive=true

          - Deleting a non-empty directory without recursive=true will fail

          - This operation cannot be undone
      - name: afs_rename
        description: >-
          Rename or move files and directories within the Agentic File System (AFS)

          - Renames a file or directory to a new name

          - Can also move files/directories to a different location

          - Optionally overwrites existing files at the destination


          Usage:

          - Both paths must be absolute AFS paths starting with "/" (e.g.,
          "/docs/old-name.md" -> "/docs/new-name.md")

          - This is NOT a local system file path - it operates within the AFS virtual
          file system

          - To move a file, specify a different directory in newPath (e.g.,
          "/docs/file.md" -> "/archive/file.md")

          - If newPath already exists, the operation will fail unless overwrite=true

          - Moving directories moves all contents recursively
      - name: afs_exec
        description: >-
          Execute files marked as executable in the Agentic File System (AFS)

          - Runs executable entries (functions, agents, skills) registered at a given
          AFS path

          - Passes arguments to the executable and returns its output

          - Use this to invoke dynamic functionality stored in AFS


          Usage:

          - The path must be an absolute AFS path to an executable entry (e.g.,
          "/skills/summarize", "/agents/translator")

          - This is NOT a local system file path - it operates within the AFS virtual
          file system

          - Use afs_list to discover available executables (look for entries with
          execute metadata)

          - Arguments must be a valid JSON string matching the executable's input
          schema

          - The executable's input/output schema can be found in its metadata

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
            "type": "text",
          },
        ],
        "role": "user",
      }
    `,
  );
});
