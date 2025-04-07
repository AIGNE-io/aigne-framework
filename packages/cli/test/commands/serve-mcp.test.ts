import { expect, mock, test } from "bun:test";
import { join } from "node:path";
import { createServeMCPCommand } from "@aigne/cli/commands/serve-mcp.js";
import { mockModule } from "@aigne/test-utils/mock-module.js";
import { detect } from "detect-port";

test("serve-mcp command should work with default options", async () => {
  const mockListen = mock();
  const mockExpress = mock(() => ({
    get: mock(),
    post: mock(),
    listen: mockListen,
  }));

  await using _ = await mockModule("express", () => ({
    default: mockExpress,
  }));

  const command = createServeMCPCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  process.chdir(testAgentsPath);
  await command.parseAsync(["", "serve-mcp"]);
  expect(mockListen).toHaveBeenCalledWith("3000", expect.any(Function));
});

test("serve-mcp command should work with custom options", async () => {
  const mockListen = mock();
  const mockExpress = mock(() => ({
    get: mock(),
    post: mock(),
    listen: mockListen,
  }));

  await using _ = await mockModule("express", () => ({
    default: mockExpress,
  }));

  const port = await detect();

  const command = createServeMCPCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  await command.parseAsync(["", "serve-mcp", "--port", port.toString(), testAgentsPath]);

  expect(mockListen).toHaveBeenCalledWith(port.toString(), expect.any(Function));
});
