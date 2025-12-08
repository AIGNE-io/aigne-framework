import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { exists } from "@aigne/agent-library/utils/fs.js";
import { logger } from "@aigne/core/utils/logger.js";
import { flat, isNonNullable, pick } from "@aigne/core/utils/type-utils.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { config } from "dotenv-flow";
import type { CommandModule } from "yargs";
import yargs from "yargs";
import { AIGNE_CLI_VERSION, CHAT_MODEL_OPTIONS } from "../constants.js";
import { isV1Package, toAIGNEPackage } from "../utils/agent-v1.js";
import { downloadAndExtract } from "../utils/download.js";
import { loadAIGNE } from "../utils/load-aigne.js";
import { isUrl } from "../utils/url.js";
import { withRunAgentCommonOptions } from "../utils/yargs.js";
import { agentCommandModule, cliAgentCommandModule } from "./app/agent.js";

export function createRunCommand({
  aigneFilePath,
}: {
  aigneFilePath?: string;
} = {}): CommandModule<unknown, { version?: boolean; path?: string; entryAgent?: string }> {
  return {
    // $0 must place after 'run' to make positional args work correctly
    command: ["run [path] [entry-agent]", "$0"],
    describe: "Run AIGNE for the specified path",
    builder: async (yargs) => {
      return yargs
        .positional("path", {
          type: "string",
          describe: "Path to the agents directory or URL to an aigne project",
          default: ".",
        })
        .positional("entry-agent", {
          type: "string",
          describe: "Name of the agent to run (defaults to the entry agent if not specified)",
        })
        .option("version", {
          type: "boolean",
          alias: "v",
          describe: "Show version number",
        })
        .help(false)
        .version(false)
        .strict(false);
    },
    handler: async (options) => {
      if (options.version) {
        console.log(AIGNE_CLI_VERSION);
        process.exit(0);
      }

      if (!options.entryAgent && options.path) {
        if (!(await exists(options.path)) && !isUrl(options.path)) {
          options.entryAgent = options.path;
          options.path = undefined;
        }
      }

      // Parse model options for loading application
      const opts = withRunAgentCommonOptions(
        yargs(process.argv).help(false).version(false).strict(false),
      ).parseSync();
      logger.level = opts.logLevel;

      const { aigne } = await loadApplication(aigneFilePath || options.path || ".", {
        modelOptions: pick(opts, CHAT_MODEL_OPTIONS),
        imageModelOptions: { model: opts.imageModel },
      });

      const subYargs = yargs().scriptName("").usage("aigne run <path> <agent> [...options]");

      if (aigne.cli.chat) {
        subYargs.command({
          ...agentCommandModule({ aigne, agent: aigne.cli.chat, chat: true }),
          command: "$0",
        });
      }

      // Allow user to run all of agents in the AIGNE instances
      const allAgents = flat(aigne.agents, aigne.skills, aigne.cli.chat, aigne.mcpServer.agents);
      for (const agent of allAgents) {
        subYargs.command(agentCommandModule({ aigne, agent }));
      }

      for (const cliAgent of aigne.cli.agents ?? []) {
        subYargs.command(
          cliAgentCommandModule({
            aigne,
            cliAgent,
          }),
        );
      }

      const argv = process.argv.slice(aigneFilePath ? 3 : 2);
      if (argv[0] === "run") argv.shift(); // remove 'run' command

      // For compatibility with old `run` command like: `aigne run --path /xx/xx --entry-agent xx --xx`
      if (argv[0] === "--path" || argv[0] === "--url") argv.shift(); // remove --path flag
      if (argv[0] === options.path) argv.shift(); // remove path/url args
      if (argv[0] === "--entry-agent") argv.shift();

      const firstAgent = aigne.agents[0]?.name;
      if (!options.entryAgent && firstAgent && !argv.some((i) => ["-h", "--help"].includes(i))) {
        argv.unshift(firstAgent);
      }

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

async function loadApplication(path: string, options: Parameters<typeof loadAIGNE>[0] = {}) {
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

  const aigne = await loadAIGNE({ ...options, path: dir });

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
