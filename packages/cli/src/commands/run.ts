import assert from "node:assert";
import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { type Agent, AIGNE } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { logger } from "@aigne/core/utils/logger.js";
import { isNonNullable } from "@aigne/core/utils/type-utils.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import type { Command } from "commander";
import { config } from "dotenv-flow";
import { availableMemories, availableModels } from "../constants.js";
import { isV1Package, toAIGNEPackage } from "../utils/agent-v1.js";
import { downloadAndExtract } from "../utils/download.js";
import {
  createRunAIGNECommand,
  parseAgentInputByCommander,
  parseModelOption,
  type RunAIGNECommandOptions,
  runAgentWithAIGNE,
} from "../utils/run-with-aigne.js";

interface RunOptions extends RunAIGNECommandOptions {
  path: string;
  entryAgent?: string;
  cacheDir?: string;
}

export function createRunCommand({ aigneFilePath }: { aigneFilePath?: string } = {}): Command {
  return createRunAIGNECommand()
    .description("Run AIGNE from the specified agent")
    .option(
      "--url, --path <path_or_url>",
      "Path to the agents directory or URL to aigne project",
      ".",
    )
    .option(
      "--entry-agent <entry-agent>",
      "Name of the agent to run (defaults to the first agent found)",
    )
    .option(
      "--cache-dir <dir>",
      "Directory to download the package to (defaults to the ~/.aigne/xxx)",
    )
    .action(async (options: RunOptions) => {
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
            task: async (ctx) => {
              // Load env files in the aigne directory
              config({ path: dir, silent: true });

              const aigne = await loadAIGNE(dir, {
                ...options,
                model: options.model || process.env.MODEL,
              });
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
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}

async function loadAIGNE(path: string, options: RunOptions) {
  const models = availableModels();

  const model = options.model
    ? await loadModel(models, parseModelOption(options.model))
    : undefined;

  return await AIGNE.load(path, { models, memories: availableMemories, model });
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
