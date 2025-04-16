import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { type Agent, ExecutionEngine } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { Command, type OptionValues } from "commander";
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
      if (path.startsWith("http")) {
        await downloadAndRunPackage(path, options);
        return;
      }

      const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

      await runEngine(path, absolutePath, options);
    })
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);
}

async function runEngine(originalPath: string, path: string, options: RunOptions) {
  if (options.modelName && !options.modelProvider) {
    throw new Error("please specify --model-provider when using the --model-name option");
  }

  const model = options.modelProvider
    ? await loadModel({ provider: options.modelProvider, name: options.modelName })
    : undefined;
  const engine = await ExecutionEngine.load({ path, model });

  let agent: Agent | undefined;
  if (options.agent) {
    agent = engine.agents[options.agent];
    if (!agent) {
      console.error(`Agent "${options.agent}" not found in ${originalPath}`);
      console.log("Available agents:");
      for (const agent of engine.agents) {
        console.log(`- ${agent.name}`);
      }
      throw new Error(`Agent "${options.agent}" not found in ${originalPath}`);
    }
  } else {
    agent = engine.agents[0];
    if (!agent) throw new Error(`No agents found in ${originalPath}`);
  }

  const user = engine.call(agent);

  await runChatLoopInTerminal(user, {});
}

async function downloadAndRunPackage(url: string, options: RunOptions) {
  let dir: string;
  if (options.downloadDir) {
    dir = isAbsolute(options.downloadDir)
      ? options.downloadDir
      : resolve(process.cwd(), options.downloadDir);
  } else {
    dir = getLocalPackagePathFromUrl(url);
  }
  await mkdir(dir, { recursive: true });
  await downloadAndExtract(url, dir);
  await runEngine(url, dir, options);
}

function getLocalPackagePathFromUrl(url: string) {
  const root = join(homedir(), ".aigne");
  const u = new URL(url);
  return join(root, u.hostname, u.pathname);
}
