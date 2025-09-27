import { spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { logger } from "@aigne/core/utils/logger.js";
import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { joinURL } from "ufo";
import type { CommandModule } from "yargs";
import { downloadAndExtract } from "../utils/download.js";
import {
  type AgentInChildProcess,
  type LoadAIGNEInChildProcessResult,
  runAIGNEInChildProcess,
} from "../utils/workers/run-aigne-in-child-process.js";
import { type AgentRunCommonOptions, withAgentInputSchema } from "../utils/yargs.js";
import { serveMCPServerFromDir } from "./serve-mcp.js";

const NPM_PACKAGE_CACHE_TIME_MS = 1000 * 60 * 60 * 24; // 1 day

/**
 * Check if beta applications should be used based on environment variables
 */
function shouldUseBetaApps(): boolean {
  const envVar = process.env.AIGNE_USE_BETA_APPS;
  return envVar === "true" || envVar === "1";
}

const builtinApps = [
  {
    name: "doc-smith",
    packageName: "@aigne/doc-smith",
    describe: "Generate and maintain project docs — powered by agents.",
    aliases: ["docsmith", "doc"],
  },
  {
    name: "web-smith",
    packageName: "@aigne/web-smith",
    describe: "Generate and maintain project website pages — powered by agents.",
    aliases: ["websmith", "web"],
  },
];

export function createAppCommands(): CommandModule[] {
  return builtinApps.map((app) => ({
    command: app.name,
    describe: app.describe,
    aliases: app.aliases,
    builder: async (yargs) => {
      const dir = join(homedir(), ".aigne", "registry.npmjs.org", app.packageName);

      const { aigne, version } = await loadApplication({
        dir,
        packageName: app.packageName,
        install: true,
      });

      if (aigne.cli?.chat) {
        yargs.command({
          ...agentCommandModule({ dir, agent: aigne.cli.chat }),
          command: "$0",
        });
      }

      for (const agent of aigne.cli?.agents ?? []) {
        yargs.command(agentCommandModule({ dir, agent }));
      }

      yargs
        .option("model", {
          type: "string",
          description:
            "Model to use for the application, example: openai:gpt-4.1 or google:gemini-2.5-flash",
        })
        .command(serveMcpCommandModule({ name: app.name, dir }))
        .command(upgradeCommandModule({ packageName: app.packageName, dir }));

      yargs.version(`${app.name} v${version}`).alias("version", "v");

      return yargs.demandCommand();
    },
    handler: () => {},
  }));
}

const serveMcpCommandModule = ({
  name,
  dir,
}: {
  name: string;
  dir: string;
}): CommandModule<unknown, { host: string; port?: number; pathname: string }> => ({
  command: "serve-mcp",
  describe: `Serve ${name} a MCP server (streamable http)`,
  builder: (yargs) => {
    return yargs
      .option("host", {
        describe: "Host to run the MCP server on, use 0.0.0.0 to publicly expose the server",
        type: "string",
        default: "localhost",
      })
      .option("port", {
        describe: "Port to run the MCP server on",
        type: "number",
      })
      .option("pathname", {
        describe: "Pathname to the service",
        type: "string",
        default: "/mcp",
      });
  },
  handler: async (options) => {
    await serveMCPServerFromDir({ ...options, dir });
  },
});

const upgradeCommandModule = ({
  packageName,
  dir,
}: {
  packageName: string;
  dir: string;
}): CommandModule<
  unknown,
  {
    beta?: boolean;
    targetVersion?: string;
    force?: boolean;
  }
> => ({
  command: "upgrade",
  describe: `Upgrade ${packageName} to the latest version`,
  builder: (argv) => {
    return argv
      .option("beta", {
        type: "boolean",
        describe: "Use beta versions if available",
      })
      .option("target-version", {
        type: "string",
        describe: "Specify a version to upgrade to (default is latest)",
        alias: ["to", "target"],
      })
      .option("force", {
        type: "boolean",
        describe: "Force upgrade even if already at latest version",
        default: false,
      });
  },
  handler: async ({ beta, targetVersion, force }) => {
    beta ??= shouldUseBetaApps();

    let app = await loadApplication({ packageName, dir });

    const npm = await getNpmTgzInfo(packageName, { beta, version: targetVersion });

    if (!app || force || npm.version !== app.version) {
      if (force) await rm(dir, { force: true, recursive: true });

      await installApp({ packageName, dir, beta, version: targetVersion });
      app = await loadApplication({ dir, packageName, install: true });

      console.log(`\n✅ Upgraded ${packageName} to version ${app.version}`);
      return;
    }

    console.log(`\n✅ ${packageName} is already at the latest version (${app.version})`);
  },
});

export const agentCommandModule = ({
  dir,
  agent,
}: {
  dir: string;
  agent: AgentInChildProcess;
}): CommandModule<unknown, AgentRunCommonOptions> => {
  return {
    command: agent.name,
    aliases: agent.alias || [],
    describe: agent.description || "",
    builder: async (yargs) => {
      return withAgentInputSchema(yargs, { inputSchema: jsonSchemaToZod(agent.inputSchema) });
    },
    handler: async (options) => {
      if (options.logLevel) logger.level = options.logLevel;

      await runAIGNEInChildProcess("invokeCLIAgentFromDir", {
        dir,
        agent: agent.name,
        input: options,
      });

      process.exit(0);
    },
  };
};

interface LoadApplicationOptions {
  packageName: string;
  dir: string;
  install?: boolean;
}

interface LoadApplicationResult {
  aigne: LoadAIGNEInChildProcessResult;
  version: string;
  isCache?: boolean;
}

export async function loadApplication(
  options: LoadApplicationOptions & { install: true },
): Promise<LoadApplicationResult>;
export async function loadApplication(
  options: LoadApplicationOptions & { install?: false },
): Promise<LoadApplicationResult | null>;
export async function loadApplication(
  options: LoadApplicationOptions,
): Promise<LoadApplicationResult | null> {
  const { dir, packageName } = options;

  const check = await checkInstallation(dir);

  if (check && !check.expired) {
    const aigne = await runAIGNEInChildProcess("loadAIGNE", dir).catch((error) => {
      console.warn(`⚠️ Failed to load ${packageName}, trying to reinstall:`, error.message);
    });

    if (aigne) {
      return { aigne, version: check.version, isCache: true };
    }
  }

  if (!options.install) return null;

  const result = await installApp({ dir, packageName, beta: check?.version?.includes("beta") });

  return {
    aigne: await runAIGNEInChildProcess("loadAIGNE", dir),
    version: result.version,
  };
}

interface InstallationMetadata {
  installedAt?: number;
}

async function readInstallationMetadata(dir: string): Promise<InstallationMetadata | undefined> {
  return safeParseJSON<InstallationMetadata>(
    await readFile(join(dir, ".aigne-cli.json"), "utf-8").catch(() => "{}"),
  );
}

async function writeInstallationMetadata(dir: string, metadata: InstallationMetadata) {
  await writeFile(join(dir, ".aigne-cli.json"), JSON.stringify(metadata, null, 2));
}

async function checkInstallation(
  dir: string,
  { cacheTimeMs = NPM_PACKAGE_CACHE_TIME_MS }: { cacheTimeMs?: number } = {},
): Promise<{ version: string; expired: boolean } | null> {
  const s = await stat(join(dir, "package.json")).catch(() => null);

  if (!s) return null;

  const version = safeParseJSON<{ version: string }>(
    await readFile(join(dir, "package.json"), "utf-8"),
  )?.version;
  if (!version) return null;

  const installedAt = (await readInstallationMetadata(dir))?.installedAt;

  if (!installedAt) return null;

  const now = Date.now();
  const expired = now - installedAt > cacheTimeMs;

  return { version, expired };
}

export async function installApp({
  dir,
  packageName,
  beta,
  version,
}: {
  dir: string;
  packageName: string;
  beta?: boolean;
  version?: string;
}) {
  return await new Listr<{ url: string; version: string }>(
    [
      {
        title: `Fetching ${packageName} metadata`,
        task: async (ctx, task) => {
          if (beta) {
            task.title = `Fetching ${packageName} metadata (using beta version)`;
          }

          const info = await getNpmTgzInfo(packageName, { beta, version });
          Object.assign(ctx, info);
        },
      },
      {
        title: `Downloading ${packageName}`,
        task: async (ctx, task) => {
          task.title = `Downloading ${packageName} (v${ctx.version})`;

          await mkdir(dir, { recursive: true });

          await downloadAndExtract(ctx.url, dir, { strip: 1 });
        },
      },
      {
        title: "Installing dependencies",
        task: async (_, task) => {
          await installDependencies(dir, {
            log: (log) => {
              const last = log.split("\n").findLast((i) => !!i);
              if (last) task.output = last;
            },
          });

          await writeInstallationMetadata(dir, { installedAt: Date.now() });
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
}

async function installDependencies(dir: string, { log }: { log?: (log: string) => void } = {}) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["install", "--omit", "dev", "--verbose", "--force"], {
      cwd: dir,
      stdio: "pipe",
      shell: process.platform === "win32",
    });

    child.stdout.on("data", (data) => {
      log?.(data.toString());
    });

    let stderr = "";
    child.stderr.on("data", (data) => {
      const str = data.toString();
      log?.(str);
      stderr += str;
    });

    child.on("error", (error) => reject(error));

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else {
        console.error(stderr);
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
  });
}

export async function getNpmTgzInfo(
  name: string,
  { version, beta }: { version?: string; beta?: boolean } = {},
): Promise<{ version: string; url: string }> {
  const res = await fetch(joinURL("https://registry.npmjs.org", name));
  if (!res.ok) throw new Error(`Failed to fetch package info for ${name}: ${res.statusText}`);
  const data = await res.json();

  let targetVersion: string;

  if (version) {
    if (!data.versions[version]) {
      throw new Error(`Version ${version} of package ${name} not found`);
    }
    targetVersion = version;
  } else if (beta && data["dist-tags"].beta) {
    // Use beta version if available and beta flag is set
    targetVersion = data["dist-tags"].beta;
  } else {
    // Fall back to latest version
    targetVersion = data["dist-tags"].latest;
  }

  const url = data.versions[targetVersion].dist.tarball;

  return {
    version: targetVersion,
    url,
  };
}

function safeParseJSON<T>(raw: string): T | undefined {
  try {
    return JSON.parse(raw) as T;
  } catch {}
}
