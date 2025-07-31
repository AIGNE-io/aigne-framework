import assert from "node:assert";
import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import type { Agent, AIGNE } from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { isNonNullable } from "@aigne/core/utils/type-utils.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { select } from "@inquirer/prompts";
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer";
import { config } from "dotenv-flow";
import type { CommandModule } from "yargs";
import { isV1Package, toAIGNEPackage } from "../utils/agent-v1.js";
import { downloadAndExtract } from "../utils/download.js";
import { loadAIGNE, type RunOptions } from "../utils/load-aigne.js";
import {
  createRunAIGNECommand,
  parseAgentInputByCommander,
  runAgentWithAIGNE,
} from "../utils/run-with-aigne.js";

export function createRunCommand({
  aigneFilePath,
}: {
  aigneFilePath?: string;
} = {}): CommandModule {
  return {
    command: "run [path]",
    describe: "Run AIGNE from the specified agent",
    builder: (yargs) => {
      return createRunAIGNECommand(yargs)
        .positional("path", {
          describe: "Path to the agents directory or URL to aigne project",
          type: "string",
          default: ".",
          alias: ["url"],
        })
        .option("entry-agent", {
          describe: "Name of the agent to run (defaults to the first agent found)",
          type: "string",
        })
        .option("cache-dir", {
          describe: "Directory to download the package to (defaults to the ~/.aigne/xxx)",
          type: "string",
        })
        .strict(false);
    },
    handler: async (argv) => {
      const options = argv as unknown as RunOptions;
      const path = aigneFilePath || options.path;

      if (options.logLevel) logger.level = options.logLevel;

      const { cacheDir, dir } = prepareDirs(path, options);

      const { aigne, agent } = await new Listr<{
        aigne: AIGNE;
        agent: Agent;
      }>(
        [
          {
            title: "Prepare environment",
            task: (_, task) => {
              if (cacheDir) {
                return task.newListr([
                  {
                    title: "Download package",
                    task: () => downloadPackage(path, cacheDir),
                  },
                  {
                    title: "Extract package",
                    task: () => extractPackage(cacheDir, dir),
                  },
                ]);
              }
            },
          },
          {
            title: "Initialize AIGNE",
            task: async (ctx, task) => {
              // Load env files in the aigne directory
              config({ path: dir, silent: true });

              const aigne = await loadAIGNE(
                dir,
                { ...options, model: options.model || process.env.MODEL },
                {
                  inquirerPromptFn: (prompt) => {
                    return task
                      .prompt(ListrInquirerPromptAdapter as any)
                      .run(select, prompt)
                      .then((res: boolean) => ({ [prompt.name]: res }));
                  },
                },
              );

              ctx.aigne = aigne;
            },
          },
          {
            task: (ctx) => {
              const { aigne } = ctx;
              assert(aigne);

              let entryAgent: Agent | undefined;

              if (options.entryAgent) {
                entryAgent = aigne.agents[options.entryAgent];
                if (!entryAgent) {
                  throw new Error(`\
Agent "${options.entryAgent}" not found in ${aigne.rootDir}

Available agents:
${aigne.agents.map((agent) => `  - ${agent.name}`).join("\n")}
`);
                }
              } else {
                entryAgent = aigne.agents[0];
                if (!entryAgent) throw new Error(`No any agent found in ${aigne.rootDir}`);
              }

              ctx.agent = entryAgent;
            },
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

      assert(aigne);
      assert(agent);

      const input = await parseAgentInputByCommander(agent, options);

      try {
        await runAgentWithAIGNE(aigne, agent, { ...options, input });
      } finally {
        await aigne.shutdown();
      }
    },
  };
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

function prepareDirs(path: string, options: RunOptions) {
  let dir: string;
  let cacheDir: string | undefined;

  if (!path.startsWith("http")) {
    dir = isAbsolute(path) ? path : resolve(process.cwd(), path);
  } else if (options.cacheDir) {
    dir = isAbsolute(options.cacheDir)
      ? options.cacheDir
      : resolve(process.cwd(), options.cacheDir);
    cacheDir = join(dir, ".download");
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
