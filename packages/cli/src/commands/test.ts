import { spawnSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";
import { Command } from "commander";

export function createTestCommand(): Command {
  return new Command("test")
    .description("Run tests in the specified agents directory")
    .option(
      "--url, --path <path_or_url>",
      "Path to the agents directory or URL to aigne project",
      ".",
    )
    .action(async (options: { path: string }) => {
      const { path } = options;
      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      spawnSync("node", ["--test"], { cwd: absolutePath, stdio: "inherit" });
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}
