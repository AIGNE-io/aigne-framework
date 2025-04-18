import assert from "node:assert";
import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { type Agent, ExecutionEngine } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { isNonNullable } from "@aigne/core/utils/type-utils.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { Command, type OptionValues } from "commander";
import { isV1Package, toAIGNEPackage } from "../utils/agent-v1.js";
import { downloadAndExtract } from "../utils/download.js";
import { runChatLoopInTerminal } from "../utils/run-chat-loop.js";

interface RunOptions extends OptionValues {
  agent?: string;
  downloadDir?: string;
  modelProvider?: string;
  modelName?: string;
}

export function createRunCommand(): Command {
  return new Command("run")
    .description("Run a chat loop with the specified agent")
    .argument("[path]", "Path to the agents directory or URL to aigne project", ".")
    .option("--agent <agent>", "Name of the agent to use (defaults to the first agent found)")
    .option(
      "--download-dir <dir>",
      "Directory to download the package to (defaults to the ~/.aigne/xxx)",
    )
    .option(
      "--model-provider <provider>",
      "Model provider to use, available providers: openai, claude, xai (defaults to the aigne.yaml definition or openai)",
    )
    .option(
      "--model-name <model>",
      "Model name to use, available models depend on the provider (defaults to the aigne.yaml definition or gpt-4o-mini)",
    )
    .action(async (path: string, options: RunOptions) => {
      const { downloadDir, dir } = prepareDirs(path, options);

      const { engine, agent } = await new Listr<{
        engine: ExecutionEngine;
        agent: Agent;
      }>(
        [
          {
            title: "Prepare environment",
            task: (_, task) => {
              if (downloadDir) {
                return task.newListr([
                  {
                    title: "Download package",
                    task: () => downloadPackage(path, downloadDir),
                  },
                  {
                    title: "Extract package",
                    task: () => extractPackage(downloadDir, dir),
                  },
                ]);
              }
            },
          },
          {
            title: "Initialize execution engine",
            task: async (ctx) => {
              const engine = await runEngine(dir, options);
              ctx.engine = engine;
            },
          },
          {
            task: (ctx) => {
              const { engine } = ctx;
              assert(engine);

              let agent: Agent | undefined;

              if (options.agent) {
                agent = engine.agents[options.agent];
                if (!agent) {
                  console.error(`Agent "${options.agent}" not found in ${path}`);
                  console.log("Available agents:");
                  for (const agent of engine.agents) {
                    console.log(`- ${agent.name}`);
                  }
                  throw new Error(`Agent "${options.agent}" not found in ${path}`);
                }
              } else {
                agent = engine.agents[0];
                if (!agent) throw new Error(`No agents found in ${path}`);
              }

              ctx.agent = agent;
            },
          },
        ],
        {
          rendererOptions: {
            collapseSubtasks: false,
            timer: PRESET_TIMER,
          },
        },
      ).run();

      assert(engine);
      assert(agent);

      const user = engine.call(agent);

      await runChatLoopInTerminal(user, {});

      await engine.shutdown();
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}

async function runEngine(path: string, options: RunOptions) {
  if (options.modelName && !options.modelProvider) {
    throw new Error("please specify --model-provider when using the --model-name option");
  }

  const model = options.modelProvider
    ? await loadModel({ provider: options.modelProvider, name: options.modelName })
    : undefined;

  return await ExecutionEngine.load({ path, model });
}

async function downloadPackage(url: string, downloadDir: string) {
  await rm(downloadDir, { recursive: true, force: true });

  await mkdir(downloadDir, { recursive: true });

  await downloadAndExtract(url, downloadDir);
}

async function extractPackage(downloadDir: string, dir: string) {
  if (await isV1Package(downloadDir)) {
    await toAIGNEPackage(downloadDir, dir);
  } else {
    await cp(downloadDir, dir, { recursive: true, force: true });
  }
}

function prepareDirs(path: string, options: RunOptions) {
  let dir: string;
  let downloadDir: string | undefined;

  if (!path.startsWith("http")) {
    dir = isAbsolute(path) ? path : resolve(process.cwd(), path);
  } else if (options.downloadDir) {
    dir = isAbsolute(options.downloadDir)
      ? options.downloadDir
      : resolve(process.cwd(), options.downloadDir);
    downloadDir = join(dir, ".download");
  } else {
    dir = getLocalPackagePathFromUrl(path);
    downloadDir = getLocalPackagePathFromUrl(path, { subdir: ".download" });
  }

  return { downloadDir, dir };
}

function getLocalPackagePathFromUrl(url: string, { subdir }: { subdir?: string } = {}) {
  const root = [homedir(), ".aigne", subdir].filter(isNonNullable);
  const u = new URL(url);
  return join(...root, u.hostname, u.pathname);
}
