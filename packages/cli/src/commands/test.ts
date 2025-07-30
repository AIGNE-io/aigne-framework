import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import type { CommandModule } from "yargs";
import { loadAIGNE } from "../utils/load-aigne.js";

interface TestOptions {
  path: string;
}

export function createTestCommand({
  aigneFilePath,
}: {
  aigneFilePath?: string;
} = {}): CommandModule<{}, TestOptions> {
  return {
    command: "test",
    describe: "Run tests in the specified agents directory",
    builder: (yargs) => {
      return yargs.option("path", {
        describe: "Path to the agents directory or URL to aigne project",
        type: "string",
        default: ".",
        alias: ["url"],
      });
    },
    handler: async (options) => {
      const path = aigneFilePath || options.path;
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      const aigne = await loadAIGNE(absolutePath);
      assert(aigne.rootDir);

      spawnSync("node", ["--test"], { cwd: aigne.rootDir, stdio: "inherit" });
    },
  };
}
