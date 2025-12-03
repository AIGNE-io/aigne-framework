import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";
import zodToJsonSchema from "zod-to-json-schema";

test("getAFSSkills should return all AFS skills", async () => {
  const afs = new AFS();

  expect(
    (await getAFSSkills(afs)).map((i) => ({
      name: i.name,
      description: i.description,
      inputSchema: zodToJsonSchema(i.inputSchema),
      outputSchema: zodToJsonSchema(i.outputSchema),
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Get a tree view of directory contents in the AFS - shows hierarchical structure of files and folders",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "options": {
              "additionalProperties": false,
              "properties": {
                "maxDepth": {
                  "description": "Maximum depth to display in the tree view",
                  "type": "number",
                },
              },
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
        "name": "afs_list",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Find files by searching content using keywords - returns matching files with their paths",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "options": {
              "additionalProperties": false,
              "properties": {
                "limit": {
                  "description": "Maximum number of entries to return",
                  "type": "number",
                },
              },
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
        "name": "afs_search",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Read file contents from the AFS - path must be an exact file path from list or search results",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_read",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Create or update a file in the AFS with new content - overwrites existing files",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_write",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Execute a function or command available in the AFS modules",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_exec",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
    ]
  `);
});

test("AFS'skill list should invoke afs.list", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  const listSpy = spyOn(afs, "list").mockResolvedValue({ list: [] });

  assert(list);
  expect(await list.invoke({ path: "/foo/bar", options: { maxDepth: 2 } })).toMatchInlineSnapshot(`
    {
      "options": {
        "maxDepth": 2,
      },
      "result": "",
      "status": "success",
      "tool": "afs_list",
    }
  `);

  expect(listSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/bar",
        {
          "maxDepth": 2,
        },
      ],
    ]
  `);
});

test("AFS'skill read should invoke afs.read", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const readSpy = spyOn(afs, "read").mockResolvedValue({
    result: { id: "foo", path: "/foo", content: "bar" },
  });

  assert(read);
  expect(await read.invoke({ path: "/foo" })).toMatchInlineSnapshot(`
    {
      "path": "/foo",
      "result": {
        "content": "bar",
        "id": "foo",
        "path": "/foo",
      },
      "status": "success",
      "tool": "afs_read",
    }
  `);

  expect(readSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
      ],
    ]
  `);
});

test("AFS'skill write should invoke afs.write", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const write = skills.find((i) => i.name === "afs_write");

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    result: {
      id: "foo",
      path: "/foo",
      content: "bar",
    },
  });

  assert(write);
  expect(await write.invoke({ path: "/foo", content: "bar" })).toMatchInlineSnapshot(`
    {
      "path": "/foo",
      "result": {
        "content": "bar",
        "id": "foo",
        "path": "/foo",
      },
      "status": "success",
      "tool": "afs_write",
    }
  `);

  expect(writeSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
        {
          "content": "bar",
        },
      ],
    ]
  `);
});
