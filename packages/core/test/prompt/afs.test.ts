import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/afs";
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
        "description": "List all mounted AFS modules",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
        "name": "listModules",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "List files in the AFS (AIGNE File System)",
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
                "maxDepth": {
                  "description": "Maximum depth to list files",
                  "type": "number",
                },
                "recursive": {
                  "description": "Whether to list files recursively",
                  "type": "boolean",
                },
              },
              "type": "object",
            },
            "path": {
              "description": "The path to list files from",
              "type": "string",
            },
          },
          "required": [
            "path",
          ],
          "type": "object",
        },
        "name": "list",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Search files in the AFS (AIGNE File System)",
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
              "description": "The path to search files in",
              "type": "string",
            },
            "query": {
              "description": "The search query",
              "type": "string",
            },
          },
          "required": [
            "path",
            "query",
          ],
          "type": "object",
        },
        "name": "search",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Read a file from the AFS (AIGNE File System)",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "path": {
              "description": "The path to the file to read",
              "type": "string",
            },
          },
          "required": [
            "path",
          ],
          "type": "object",
        },
        "name": "read",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {},
          "type": "object",
        },
      },
      {
        "description": "Write a file to the AFS (AIGNE File System)",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "content": {
              "description": "The content to write to the file",
              "type": "string",
            },
            "path": {
              "description": "The path to the file to write",
              "type": "string",
            },
          },
          "required": [
            "path",
            "content",
          ],
          "type": "object",
        },
        "name": "write",
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

test("AFS'skill listModules should return all mounted modules", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const listModule = skills.find((i) => i.name === "listModules");

  assert(listModule);
  expect(await listModule.invoke({})).toMatchInlineSnapshot(`
    {
      "modules": [
        {
          "description": undefined,
          "moduleId": "AFSHistory",
          "path": "/history",
        },
      ],
    }
  `);
});

test("AFS'skill list should invoke afs.list", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "list");

  const listSpy = spyOn(afs, "list").mockResolvedValue({ list: [] });

  assert(list);
  expect(await list.invoke({ path: "/foo/bar", options: { maxDepth: 2 } })).toMatchInlineSnapshot(`
    {
      "list": [],
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
  const read = skills.find((i) => i.name === "read");

  const readSpy = spyOn(afs, "read").mockResolvedValue({ id: "foo", path: "/foo", content: "bar" });

  assert(read);
  expect(await read.invoke({ path: "/foo" })).toMatchInlineSnapshot(`
    {
      "file": {
        "content": "bar",
        "id": "foo",
        "path": "/foo",
      },
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
  const write = skills.find((i) => i.name === "write");

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    id: "foo",
    path: "/foo",
    content: "bar",
  });

  assert(write);
  expect(await write.invoke({ path: "/foo", content: "bar" })).toMatchInlineSnapshot(`
    {
      "file": {
        "content": "bar",
        "id": "foo",
        "path": "/foo",
      },
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
