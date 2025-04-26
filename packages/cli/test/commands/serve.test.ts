import { type Mock, afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { Server } from "node:http";
import { join } from "node:path";
import { createServeCommand } from "@aigne/cli/commands/serve.js";
import { detect } from "detect-port";
import { application } from "express";

let listen: Mock<typeof application.listen>;

beforeEach(() => {
  listen = spyOn(application, "listen").mockImplementationOnce(((_port, _host, cb) => {
    if (typeof cb === "function") cb();
    return new Server();
  }) as typeof application.listen);
});

afterEach(() => {
  listen.mockRestore();
});

test("serve-mcp command should work with default options", async () => {
  const command = createServeCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["", "serve", "--mcp"]);
  expect(listen).toHaveBeenCalledWith(3000, "localhost", expect.any(Function));
  process.chdir(cwd);
});

test("serve-mcp command should work with custom options", async () => {
  const port = await detect();

  const command = createServeCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  await command.parseAsync([
    "",
    "serve",
    "--mcp",
    "--port",
    port.toString(),
    "--host",
    "0.0.0.0",
    testAgentsPath,
  ]);

  expect(listen).toHaveBeenLastCalledWith(port, "0.0.0.0", expect.any(Function));
});

test("serve-mcp command should use process.env.PORT", async () => {
  const port = await detect();

  const command = createServeCommand();

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  process.env.PORT = port.toString();

  await command.parseAsync(["", "serve", "--mcp", testAgentsPath]);

  expect(listen).toHaveBeenLastCalledWith(port, "localhost", expect.any(Function));

  process.env.PORT = "INVALID_PORT";
  expect(command.parseAsync(["", "serve", "--mcp", testAgentsPath])).rejects.toThrow(
    "parse PORT error",
  );
});
