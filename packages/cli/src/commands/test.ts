import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import { AIGNE } from "@aigne/core";
import { Command } from "commander";
import { availableMemories, availableModels } from "../constants.js";

export function createTestCommand({ aigneFilePath }: { aigneFilePath?: string } = {}): Command {
  return new Command("test")
    .description("Run tests in the specified agents directory")
    .option(
      "--url, --path <path_or_url>",
      "Path to the agents directory or URL to aigne project",
      ".",
    )
    .action(async (options: { path: string }) => {
      const path = aigneFilePath || options.path;
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      const aigne = await AIGNE.load(absolutePath, {
        models: availableModels(),
        memories: availableMemories,
      });
      assert(aigne.rootDir);

      spawnSync("node", ["--test"], { cwd: aigne.rootDir, stdio: "inherit" });
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
