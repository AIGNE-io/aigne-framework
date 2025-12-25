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
        "description": 
    "List contents within the Agentic File System (AFS)
    - Returns files and directories at the specified AFS path
    - Supports recursive listing with configurable depth
    - Supports glob pattern filtering to match specific files
    - By default respects .gitignore rules to filter out ignored files
    - Use this tool when you need to explore AFS contents or understand file organization

    Usage:
    - The path must be an absolute AFS path starting with "/" (e.g., "/", "/docs", "/memory/user")
    - This is NOT a local system file path - it operates within the AFS virtual file system
    - Use maxDepth to control recursion depth (default: 1, current directory only)
    - Use pattern to filter entries by glob pattern:
      - "*.ts" - match TypeScript files in current directory
      - "**/*.js" - match all JavaScript files recursively
      - "src/**/*.{ts,tsx}" - match TypeScript files in src directory
    - Results are filtered by .gitignore by default; set disableGitignore to include ignored files"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "options": {
              "additionalProperties": false,
              "properties": {
                "disableGitignore": {
                  "description": "Set to true to include files normally ignored by .gitignore rules. Default: false (respects .gitignore)",
                  "type": "boolean",
                },
                "maxChildren": {
                  "description": "Maximum number of entries to return per directory. Useful for large directories to avoid overwhelming output",
                  "type": "number",
                },
                "maxDepth": {
                  "description": "Maximum depth of directory recursion. 1 = current directory only, 2 = include subdirectories, etc. Default: 1",
                  "type": "number",
                },
                "pattern": {
                  "description": "Glob pattern to filter entries by path",
                  "type": "string",
                },
              },
              "type": "object",
            },
            "path": {
              "description": "Absolute AFS path to list (e.g., '/', '/docs', '/memory/user'). Must start with '/'",
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
              "additionalProperties": {},
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
        "description": 
    "Search file contents within the Agentic File System (AFS)
    - Searches for files containing specific text, keywords, or patterns
    - Returns matching entries with their content and metadata
    - Supports case-sensitive and case-insensitive search modes
    - Use this tool when you need to find files by their content

    Usage:
    - The path must be an absolute AFS path starting with "/" (e.g., "/", "/docs", "/memory")
    - This is NOT a local system file path - it operates within the AFS virtual file system
    - The query can be keywords, phrases, or text patterns to search for
    - Use limit to control the number of results returned
    - Search is case-insensitive by default; set caseSensitive to true for exact case matching"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "options": {
              "additionalProperties": false,
              "properties": {
                "caseSensitive": {
                  "description": "Set to true for case-sensitive matching. Default: false (case-insensitive)",
                  "type": "boolean",
                },
                "limit": {
                  "description": "Maximum number of results to return. Useful for limiting output size",
                  "type": "number",
                },
              },
              "type": "object",
            },
            "path": {
              "description": "Absolute AFS path to search in (e.g., '/', '/docs', '/memory'). Must start with '/'",
              "type": "string",
            },
            "query": {
              "description": "Text, keywords, or patterns to search for in file contents",
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
        "description": 
    "Read file contents from the Agentic File System (AFS)
    - Returns the content of a file at the specified AFS path
    - By default reads up to 2000 lines, use offset/limit for large files
    - Lines longer than 2000 characters will be truncated

    Usage:
    - The path must be an absolute AFS path starting with "/" (e.g., "/docs/readme.md")
    - Use offset to start reading from a specific line (0-based)
    - Use limit to control number of lines returned (default: 2000)
    - Check truncated field to know if file was partially returned"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "limit": {
              "description": "Maximum number of lines to read (default: 2000)",
              "maximum": 2000,
              "minimum": 1,
              "type": "integer",
            },
            "offset": {
              "description": "Line number to start reading from (0-based, default: 0)",
              "minimum": 0,
              "type": "integer",
            },
            "path": {
              "description": "Absolute AFS path to the file to read (e.g., '/docs/readme.md'). Must start with '/'",
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
          "properties": {
            "data": {},
            "message": {
              "type": "string",
            },
            "offset": {
              "type": "number",
            },
            "path": {
              "type": "string",
            },
            "returnedLines": {
              "type": "number",
            },
            "status": {
              "type": "string",
            },
            "tool": {
              "type": "string",
            },
            "totalLines": {
              "type": "number",
            },
            "truncated": {
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
        "description": 
    "Write or create files in the Agentic File System (AFS)
    - Creates a new file or overwrites an existing file with the provided content
    - Supports append mode to add content to the end of existing files
    - Use this tool when creating new files or completely replacing file contents

    Usage:
    - The path must be an absolute AFS path starting with "/" (e.g., "/docs/new-file.md", "/memory/user/notes")
    - This is NOT a local system file path - it operates within the AFS virtual file system
    - By default, this tool overwrites the entire file content
    - Use append mode to add content to the end of an existing file without replacing it
    - For partial edits to existing files, prefer using afs_edit instead"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "append": {
              "default": false,
              "description": "Set to true to append content to the end of an existing file. Default: false (overwrites entire file)",
              "type": "boolean",
            },
            "content": {
              "description": "The content to write to the file. In overwrite mode, this replaces the entire file",
              "type": "string",
            },
            "path": {
              "description": "Absolute AFS path for the file to write (e.g., '/docs/new-file.md'). Must start with '/'",
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
        "description": 
    "Performs exact string replacements in files within the Agentic File System (AFS).

    Usage:
    - You must use afs_read at least once before editing to understand the file content
    - The path must be an absolute AFS path starting with "/" (e.g., "/docs/readme.md")
    - Preserve exact indentation (tabs/spaces) as it appears in the file
    - The edit will FAIL if oldString is not found in the file
    - The edit will FAIL if oldString appears multiple times (unless replaceAll is true)
    - Use replaceAll to replace/rename strings across the entire file"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "newString": {
              "description": "The text to replace it with (must be different from oldString)",
              "type": "string",
            },
            "oldString": {
              "description": "The exact text to replace. Must match file content exactly including whitespace",
              "type": "string",
            },
            "path": {
              "description": "Absolute AFS path to the file to edit (e.g., '/docs/readme.md'). Must start with '/'",
              "type": "string",
            },
            "replaceAll": {
              "default": false,
              "description": "Replace all occurrences of oldString (default: false)",
              "type": "boolean",
            },
          },
          "required": [
            "path",
            "oldString",
            "newString",
          ],
          "type": "object",
        },
        "name": "afs_edit",
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
            "snippet": {
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
            "snippet",
          ],
          "type": "object",
        },
      },
      {
        "description": 
    "Permanently delete files or directories from the Agentic File System (AFS)
    - Removes files or directories at the specified AFS path
    - Supports recursive deletion for directories with contents
    - Use with caution as deletion is permanent

    Usage:
    - The path must be an absolute AFS path starting with "/" (e.g., "/docs/old-file.md", "/temp")
    - This is NOT a local system file path - it operates within the AFS virtual file system
    - To delete a directory, you MUST set recursive=true
    - Deleting a non-empty directory without recursive=true will fail
    - This operation cannot be undone"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "path": {
              "description": "Absolute AFS path to delete (e.g., '/docs/old-file.md', '/temp'). Must start with '/'",
              "type": "string",
            },
            "recursive": {
              "default": false,
              "description": "MUST be set to true to delete directories. Default: false (files only)",
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
        "description": 
    "Rename or move files and directories within the Agentic File System (AFS)
    - Renames a file or directory to a new name
    - Can also move files/directories to a different location
    - Optionally overwrites existing files at the destination

    Usage:
    - Both paths must be absolute AFS paths starting with "/" (e.g., "/docs/old-name.md" -> "/docs/new-name.md")
    - This is NOT a local system file path - it operates within the AFS virtual file system
    - To move a file, specify a different directory in newPath (e.g., "/docs/file.md" -> "/archive/file.md")
    - If newPath already exists, the operation will fail unless overwrite=true
    - Moving directories moves all contents recursively"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "newPath": {
              "description": "New absolute AFS path (e.g., '/docs/new-name.md'). Must start with '/'",
              "type": "string",
            },
            "oldPath": {
              "description": "Current absolute AFS path (e.g., '/docs/old-name.md'). Must start with '/'",
              "type": "string",
            },
            "overwrite": {
              "default": false,
              "description": "Set to true to overwrite if destination already exists. Default: false (fails if exists)",
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
        "description": 
    "Execute files marked as executable in the Agentic File System (AFS)
    - Runs executable entries (functions, agents, skills) registered at a given AFS path
    - Passes arguments to the executable and returns its output
    - Use this to invoke dynamic functionality stored in AFS

    Usage:
    - The path must be an absolute AFS path to an executable entry (e.g., "/skills/summarize", "/agents/translator")
    - This is NOT a local system file path - it operates within the AFS virtual file system
    - Use afs_list to discover available executables (look for entries with execute metadata)
    - Arguments must be a valid JSON string matching the executable's input schema
    - The executable's input/output schema can be found in its metadata"
    ,
        "inputSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": true,
          "properties": {
            "args": {
              "description": "JSON string of arguments matching the executable's input schema (e.g., '{"text": "hello"}')",
              "type": "string",
            },
            "path": {
              "description": "Absolute AFS path to the executable (e.g., '/skills/summarize'). Must start with '/'",
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
