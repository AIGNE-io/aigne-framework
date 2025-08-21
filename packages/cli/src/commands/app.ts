import assert from "node:assert";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { type Agent, AIGNE, type Message } from "@aigne/core";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { joinURL } from "ufo";
import type { Argv, CommandModule } from "yargs";
import { downloadAndExtract } from "../utils/download.js";
import { loadAIGNE } from "../utils/load-aigne.js";
import { runAgentWithAIGNE } from "../utils/run-with-aigne.js";
import { parseAgentInput, withAgentInputSchema } from "../utils/yargs.js";
import { serveMCPServerFromDir } from "./serve-mcp.js";

const NPM_PACKAGE_CACHE_TIME_MS = 1000 * 60 * 60 * 24; // 1 day

const builtinApps = [
  {
    name: "doc-smith",
    describe: "Generate and maintain project docs — powered by agents.",
    aliases: ["docsmith", "doc"],
  },
];

export function createAppCommands(): CommandModule[] {
  return builtinApps.map((app) => ({
    command: app.name,
    describe: app.describe,
    aliases: app.aliases,
    builder: async (yargs) => {
      const { aigne, dir, version, isCache } = await loadApplication({ name: app.name });

      yargs
        .option("model", {
          type: "string",
          description:
            "Model to use for the application, example: openai:gpt-4.1 or google:gemini-2.5-flash",
        })
        .command(serveMcpCommandModule({ name: app.name, dir }))
        .command(upgradeCommandModule({ name: app.name, dir, isLatest: !isCache, version }));

      for (const agent of aigne.cli?.agents ?? []) {
        yargs.command(agentCommandModule({ dir, agent }));
      }

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
  name,
  dir,
  isLatest,
  version,
}: {
  name: string;
  dir: string;
  isLatest?: boolean;
  version?: string;
}): CommandModule => ({
  command: "upgrade",
  describe: `Upgrade ${name} to the latest version`,
  handler: async () => {
    if (!isLatest) {
      const result = await loadApplication({ name, dir, forceUpgrade: true });

      if (version !== result.version) {
        console.log(`\n✅ Upgraded ${name} to version ${result.version}`);
        return;
      }
    }

    console.log(`\n✅ ${name} is already at the latest version (${version})`);
  },
});

const agentCommandModule = ({
  dir,
  agent,
}: {
  dir: string;
  agent: Agent;
}): CommandModule<unknown, { input?: string[]; format?: "json" | "yaml"; model?: string }> => {
  return {
    command: agent.name,
    aliases: agent.alias || [],
    describe: agent.description || "",
    builder: async (yargs) => withAgentInputSchema(yargs, agent) as Argv<unknown>,
    handler: async (input) => {
      await invokeCLIAgentFromDir({ dir, agent: agent.name, input });
    },
  };
};

export async function invokeCLIAgentFromDir(options: {
  dir: string;
  agent: string;
  input: Message & { input?: string[]; format?: "yaml" | "json"; model?: string };
}) {
  const aigne = await loadAIGNE({
    path: options.dir,
    modelOptions: { model: options.input.model },
  });

  try {
    const agent = aigne.cli.agents[options.agent];
    assert(agent, `Agent ${options.agent} not found in ${options.dir}`);

    const input = await parseAgentInput(options.input, agent);

    await runAgentWithAIGNE(aigne, agent, { input });
  } finally {
    await aigne.shutdown();
  }
}

export async function loadApplication({
  name,
  dir,
  forceUpgrade = false,
}: {
  name: string;
  dir?: string;
  forceUpgrade?: boolean;
}): Promise<{ aigne: AIGNE; dir: string; version: string; isCache?: boolean }> {
  name = `@aigne/${name}`;
  dir ??= join(homedir(), ".aigne", "registry.npmjs.org", name);

  let check = forceUpgrade ? undefined : await isInstallationAvailable(dir);
  if (check?.available) {
    const aigne = await AIGNE.load(dir).catch(() => null);
    if (aigne) {
      return {
        aigne,
        dir,
        version: check.version,
        isCache: true,
      };
    }

    check = undefined;
    forceUpgrade = true;
  }

  const result = await new Listr<{
    url: string;
    version: string;
  }>(
    [
      {
        title: `Fetching ${name} metadata`,
        task: async (ctx) => {
          const info = await getNpmTgzInfo(name);
          Object.assign(ctx, info);
        },
      },
      {
        title: `Downloading ${name}`,
        skip: (ctx) => ctx.version === check?.version,
        task: async (ctx) => {
          await rm(dir, { force: true, recursive: true });
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

  return {
    aigne: await AIGNE.load(dir),
    dir,
    version: result.version,
  };
}

async function isInstallationAvailable(
  dir: string,
  { cacheTimeMs = NPM_PACKAGE_CACHE_TIME_MS }: { cacheTimeMs?: number } = {},
): Promise<{ version: string; available: boolean } | null> {
  const s = await stat(join(dir, "package.json")).catch(() => null);

  if (!s) return null;

  const version = safeParseJSON<{ version: string }>(
    await readFile(join(dir, "package.json"), "utf-8"),
  )?.version;
  if (!version) return null;

  const installedAt = safeParseJSON<{ installedAt: number }>(
    await readFile(join(dir, ".aigne-cli.json"), "utf-8").catch(() => "{}"),
  )?.installedAt;

  if (!installedAt) return null;

  const now = Date.now();
  const available = installedAt ? now - installedAt < cacheTimeMs : false;

  return { version, available };
}

async function installDependencies(dir: string, { log }: { log?: (log: string) => void } = {}) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["install", "--omit", "dev", "--verbose"], {
      cwd: dir,
      stdio: "pipe",
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

  await writeFile(
    join(dir, ".aigne-cli.json"),
    JSON.stringify({ installedAt: Date.now() }, null, 2),
  );
}

async function getNpmTgzInfo(name: string) {
  const res = await fetch(joinURL("https://registry.npmjs.org", name));
  if (!res.ok) throw new Error(`Failed to fetch package info for ${name}: ${res.statusText}`);
  const data = await res.json();
  const latestVersion = data["dist-tags"].latest;
  const url = data.versions[latestVersion].dist.tarball;

  return {
    version: latestVersion,
    url,
  };
}

function safeParseJSON<T>(raw: string): T | undefined {
  try {
    return JSON.parse(raw) as T;
  } catch {}
}
