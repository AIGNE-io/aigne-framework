import { expect, mock, test } from "bun:test";
import { join } from "node:path";
import { createServeCommand } from "@aigne/cli/commands/serve.js";
import { detect } from "detect-port";
import { mockModule } from "../_mocks_/mock-module.js";

test("serve-mcp command should work with default options", async () => {
  const mockListen = mock().mockImplementationOnce((_, cb) => cb());
  const mockExpress = mock(() => ({
    use: mock(),
    get: mock(),
    post: mock(),
    listen: mockListen,
  }));

  await using _ = await mockModule("express", () => ({
    default: mockExpress,
  }));

  const command = createServeCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["", "serve", "--mcp"]);
  expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
  process.chdir(cwd);
});

test("serve-mcp command should work with custom options", async () => {
  const mockListen = mock().mockImplementationOnce((_, cb) => cb());
  const mockExpress = mock(() => ({
    use: mock(),
    get: mock(),
    post: mock(),
    listen: mockListen,
  }));

  await using _ = await mockModule("express", () => ({
    default: mockExpress,
  }));

  const port = await detect();

  const command = createServeCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  await command.parseAsync(["", "serve", "--mcp", "--port", port.toString(), testAgentsPath]);

  expect(mockListen).toHaveBeenLastCalledWith(port, expect.any(Function));
});

test("serve-mcp command should use process.env.PORT", async () => {
  const mockListen = mock().mockImplementationOnce((_, cb) => cb());
  const mockExpress = mock(() => ({
    use: mock(),
    get: mock(),
    post: mock(),
    listen: mockListen,
  }));

  await using _ = await mockModule("express", () => ({
    default: mockExpress,
  }));

  const port = await detect();

  const command = createServeCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  process.env.PORT = port.toString();

  await command.parseAsync(["", "serve", "--mcp", testAgentsPath]);

  expect(mockListen).toHaveBeenLastCalledWith(port, expect.any(Function));

  process.env.PORT = "INVALID_PORT";
  expect(command.parseAsync(["", "serve", "--mcp", testAgentsPath])).rejects.toThrow(
    "parse PORT error",
  );
});
