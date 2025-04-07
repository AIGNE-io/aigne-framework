import { expect, spyOn, test } from "bun:test";
import * as childProcess from "node:child_process";
import { join } from "node:path";
import { createTestCommand } from "../../src/commands/test.js";

test("test command should spawn node --test process with correct arguments", async () => {
  const spawnSyncMock = spyOn(childProcess, "spawnSync").mockReturnValue(
    {} as childProcess.SpawnSyncReturns<string>,
  );

  const command = createTestCommand();

  // default run test in current directory
  await command.parseAsync(["", "test"]);

  expect(spawnSyncMock).toHaveBeenNthCalledWith(
    1,
    "node",
    ["--test"],
    expect.objectContaining({
      cwd: process.cwd(),
      stdio: "inherit",
    }),
  );

  // run test in specified directory
  await command.parseAsync(["", "test", "test/path"]);

  expect(spawnSyncMock).toHaveBeenNthCalledWith(
    2,
    "node",
    ["--test"],
    expect.objectContaining({
      cwd: join(process.cwd(), "test/path"),
      stdio: "inherit",
    }),
  );

  // run test in specified directory of absolute path
  await command.parseAsync(["", "test", "/tmp"]);

  expect(spawnSyncMock).toHaveBeenNthCalledWith(
    3,
    "node",
    ["--test"],
    expect.objectContaining({
      cwd: "/tmp",
      stdio: "inherit",
    }),
  );
});
