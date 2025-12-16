import { expect, test } from "bun:test";
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
        "description": "Browse directory structure as a tree view. Use when exploring directory contents or understanding file organization.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_list",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "data": {},
            "message": {
              "type": "string",
            },
            "options": {
              "additionalProperties": false,
              "properties": {
                "disableGitignore": {
                  "type": "boolean",
                },
                "format": {
                  "enum": [
                    "tree",
                    "list",
                  ],
                  "type": "string",
                },
                "maxChildren": {
                  "type": "number",
                },
                "maxDepth": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "path": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
          },
          "required": [
            "status",
            "tool",
            "path",
          ],
          "type": "object",
        },
      },
      {
        "description": "Search file contents by keywords. Use when finding files containing specific text or code patterns.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_search",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "data": {
              "type": "array",
            },
            "message": {
              "type": "string",
            },
            "options": {
              "additionalProperties": false,
              "properties": {
                "caseSensitive": {
                  "type": "boolean",
                },
                "limit": {
                  "type": "number",
                },
              },
              "type": "object",
            },
            "path": {
              "type": "string",
            },
            "query": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
          },
          "required": [
            "status",
            "tool",
            "path",
            "query",
            "data",
          ],
          "type": "object",
        },
      },
      {
        "description": "Read complete file contents. Use when you need to review, analyze, or understand file content before making changes.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_read",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "data": {},
            "message": {
              "type": "string",
            },
            "path": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
            "withLineNumbers": {
              "type": "boolean",
            },
          },
          "required": [
            "status",
            "tool",
            "path",
          ],
          "type": "object",
        },
      },
      {
        "description": "Create new file or append content to existing file. Use when creating files, rewriting entire files, or appending to files.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_write",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "message": {
              "type": "string",
            },
            "path": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
          },
          "required": [
            "status",
            "tool",
            "path",
          ],
          "type": "object",
        },
      },
      {
        "description": "Apply precise line-based patches to modify file content. Use when making targeted changes without rewriting the entire file.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_edit",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "data": {
              "type": "string",
            },
            "message": {
              "type": "string",
            },
            "path": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
          },
          "required": [
            "status",
            "tool",
            "path",
            "message",
            "data",
          ],
          "type": "object",
        },
      },
      {
        "description": "Permanently delete files or directories. Use when removing unwanted files or cleaning up temporary data.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_delete",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "message": {
              "type": "string",
            },
            "path": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
          },
          "required": [
            "status",
            "tool",
            "path",
          ],
          "type": "object",
        },
      },
      {
        "description": "Rename or move files and directories. Use when reorganizing files, changing names, or moving to different locations.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_rename",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "message": {
              "type": "string",
            },
            "newPath": {
              "type": "string",
            },
            "oldPath": {
              "type": "string",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
          },
          "required": [
            "status",
            "tool",
            "oldPath",
            "newPath",
          ],
          "type": "object",
        },
      },
      {
        "description": "Execute functions or commands from AFS modules. Use when running operations provided by mounted modules.",
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
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
        "name": "afs_exec",
        "outputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "data": {
              "additionalProperties": {},
              "type": "object",
            },
          },
          "required": [
            "data",
          ],
          "type": "object",
        },
      },
    ]
  `);
});
