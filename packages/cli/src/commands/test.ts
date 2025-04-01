import { spawnSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import {} from "@aigne/core";
import { Command } from "commander";

export function createTestCommand(): Command {
  const runCommand = new Command("test")
    .description("Run tests in the specified agents directory")
    .argument("[path]", "Path to the agents directory", ".")
    .action(async (path: string) => {
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);
      spawnSync("node", ["--test"], { cwd: absolutePath, stdio: "inherit" });
    });

  return runCommand;
}
