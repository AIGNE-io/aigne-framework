import { expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MCPAgent } from "@aigne/core";

test(
  "MCPAgent from command",
  async () => {
    const dir = await realpath(await mkdtemp(join(tmpdir(), "mcp-agent-test-")));

    const filesystem = await MCPAgent.from({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", dir],
    });

    try {
      const tools = [
        "read_file",
        "read_multiple_files",
        "write_file",
        "edit_file",
        "create_directory",
        "list_directory",
        "directory_tree",
        "move_file",
        "search_files",
        "get_file_info",
        "list_allowed_directories",
      ];

      expect(filesystem.skills.map((i) => i.name)).toEqual(tools);

      const listAllowedDirectories = await filesystem.skills.list_allowed_directories?.call({});
      expect(listAllowedDirectories).toEqual({
        content: [
          {
            type: "text",
            text: expect.stringContaining(dir),
          },
        ],
      });

      const writeResult = await filesystem.skills.write_file?.call({
        path: join(dir, "/foo.txt"),
        content: "Hello, AIGNE!",
      });
      expect(writeResult).toEqual({
        content: [
          {
            type: "text",
            text: expect.stringMatching(/successfully\s+wrote\s+to\s/i),
          },
        ],
      });

      const readResult = await filesystem.skills.read_file?.call({
        path: join(dir, "/foo.txt"),
      });
      expect(readResult).toEqual({
        content: [
          {
            type: "text",
            text: expect.stringContaining("Hello, AIGNE!"),
          },
        ],
      });
    } finally {
      await filesystem.destroy();
      await rm(dir, { recursive: true, force: true });
    }
  },
  {
    timeout: 30000,
  },
);
