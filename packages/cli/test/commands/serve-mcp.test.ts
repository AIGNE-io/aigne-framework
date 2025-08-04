import { afterEach, beforeEach, expect, type Mock, spyOn, test } from "bun:test";
import { Server } from "node:http";
import { join } from "node:path";
import { createServeMCPCommand } from "@aigne/cli/commands/serve-mcp.js";
import { detect } from "detect-port";
import { application } from "express";
import yargs from "yargs";

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
  const command = yargs().command(createServeMCPCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  const cwd = process.cwd();
  process.chdir(testAgentsPath);
  await command.parseAsync(["serve-mcp"]);
  expect(listen).toHaveBeenCalledWith(3000, "localhost", expect.any(Function));
  process.chdir(cwd);
});

test("serve-mcp command should work with custom options", async () => {
  const port = await detect();

  const command = yargs().command(createServeMCPCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  await command.parseAsync([
    "serve-mcp",
    "--port",
    port.toString(),
    "--host",
    "0.0.0.0",
    "--path",
    testAgentsPath,
  ]);

  expect(listen).toHaveBeenLastCalledWith(port, "0.0.0.0", expect.any(Function));
});

test("serve-mcp command should use process.env.PORT", async () => {
  const port = await detect();

  const command = yargs().command(createServeMCPCommand());

  const testAgentsPath = join(import.meta.dirname, "../../test-agents");

  process.env.PORT = port.toString();

  const error = spyOn(console, "error").mockImplementation(() => {});

  await command.parseAsync(["serve-mcp", "--path", testAgentsPath]);

  expect(listen).toHaveBeenLastCalledWith(port, "localhost", expect.any(Function));

  process.env.PORT = "INVALID_PORT";
  spyOn(process, "exit").mockReturnValueOnce(undefined as never);
  expect(command.parseAsync(["serve-mcp", "--path", testAgentsPath])).rejects.toThrow(
    "parse PORT error",
  );

  error.mockRestore();
});
