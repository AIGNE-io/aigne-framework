import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { flat, isNonNullable } from "@aigne/core/utils/type-utils.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { config } from "dotenv-flow";
import type { CommandModule } from "yargs";
import yargs from "yargs";
import { isV1Package, toAIGNEPackage } from "../utils/agent-v1.js";
import { downloadAndExtract } from "../utils/download.js";
import { loadAIGNE } from "../utils/load-aigne.js";
import { agentCommandModule } from "./app.js";

export function createRunCommand({
  aigneFilePath,
}: {
  aigneFilePath?: string;
} = {}): CommandModule<unknown, { path?: string }> {
  return {
    command: "run [path]",
    describe: "Run AIGNE for the specified path",
    builder: async (yargs) => {
      return yargs
        .positional("path", {
          type: "string",
          describe: "Path to the agents directory or URL to an aigne project",
          default: ".",
        })
        .help(false)
        .version(false)
        .strict(false);
    },
    handler: async (options) => {
      const p = aigneFilePath || options.path;
      if (!p) throw new Error("No path specified");

      const { aigne, path } = await loadApplication(p);

      const subYargs = yargs().scriptName("").usage("aigne run <path> <agent> [...options]");

      if (aigne.cli.chat) {
        subYargs.command({
          ...agentCommandModule({ dir: path, agent: aigne.cli.chat }),
          command: "$0",
        });
      }

      // Allow user to run all of agents in the AIGNE instances
      for (const agent of flat(
        aigne.cli.agents,
        aigne.agents,
        aigne.skills,
        aigne.cli.chat,
        aigne.mcpServer.agents,
      )) {
        subYargs.command(agentCommandModule({ dir: path, agent }));
      }

      const argv = process.argv.slice((aigneFilePath ? 3 : 2) + 1);
      if (argv[0] === options.path) argv.shift();

      await subYargs
        .strict()
        .demandCommand()
        .alias("h", "help")
        .alias("v", "version")
        .fail((message, error, yargs) => {
          // We catch all errors below, here just print the help message non-error case like demandCommand
          if (!error) {
            yargs.showHelp();

            console.error(`\n${message}`);
            process.exit(1);
          }
        })
        .parseAsync(argv);
    },
  };
}

async function loadApplication(path: string) {
  const { cacheDir, dir } = prepareDirs(path);

  if (cacheDir) {
    await new Listr(
      [
        {
          title: "Download package",
          task: () => downloadPackage(path, cacheDir),
        },
        {
          title: "Extract package",
          task: () => extractPackage(cacheDir, dir),
        },
      ],
      {
        rendererOptions: {
          collapseSubtasks: false,
          showErrorMessage: false,
          timer: PRESET_TIMER,
        },
      },
    ).run();
  }

  // Load env files in the aigne directory
  config({ path: dir, silent: true });

  const aigne = await loadAIGNE({ path: dir });

  return { aigne, path: dir };
}

async function downloadPackage(url: string, cacheDir: string) {
  await rm(cacheDir, { recursive: true, force: true });

  await mkdir(cacheDir, { recursive: true });

  await downloadAndExtract(url, cacheDir);
}

async function extractPackage(cacheDir: string, dir: string) {
  await mkdir(dir, { recursive: true });

  if (await isV1Package(cacheDir)) {
    await toAIGNEPackage(cacheDir, dir);
  } else {
    await cp(cacheDir, dir, { recursive: true, force: true });
  }
}

function prepareDirs(path: string) {
  let dir: string;
  let cacheDir: string | undefined;

  if (!path.startsWith("http")) {
    dir = isAbsolute(path) ? path : resolve(process.cwd(), path);
  } else {
    dir = getLocalPackagePathFromUrl(path);
    cacheDir = getLocalPackagePathFromUrl(path, { subdir: ".download" });
  }

  return { cacheDir, dir };
}

function getLocalPackagePathFromUrl(url: string, { subdir }: { subdir?: string } = {}) {
  const root = [homedir(), ".aigne", subdir].filter(isNonNullable);
  const u = new URL(url);
  return join(...root, u.hostname, u.pathname);
}
