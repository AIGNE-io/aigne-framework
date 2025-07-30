import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, join } from "node:path";
import { isatty } from "node:tty";
import { AIAgent, AIGNE, readAllString } from "@aigne/core";
import { pick } from "@aigne/core/utils/type-utils.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { joinURL } from "ufo";
import { parse } from "yaml";
import type { CommandModule } from "yargs";
import { ZodObject, ZodString, type ZodType } from "zod";
import { availableModels } from "../constants.js";
import { downloadAndExtract } from "../utils/download.js";
import { loadAIGNE } from "../utils/load-aigne.js";
import { runAgentWithAIGNE, stdinHasData } from "../utils/run-with-aigne.js";
import { serveMCPServer } from "../utils/serve-mcp.js";
import { DEFAULT_PORT } from "./serve-mcp.js";

const NPM_PACKAGE_CACHE_TIME_MS = 1000 * 60 * 60 * 24; // 1 day

const builtinApps = [
  {
    name: "doc-smith",
    describe: "Generate professional documents by doc-smith",
    aliases: ["docsmith", "doc"],
  },
];

export function createAppCommands(): CommandModule[] {
  return builtinApps.map((app) => ({
    command: app.name,
    describe: app.describe,
    aliases: app.aliases,
    builder: async (yargs) => {
      const { aigne, dir, version } = await loadApplication({ name: "doc-smith" });

      yargs.command<{
        host: string;
        port?: number;
        pathname: string;
      }>(
        "serve-mcp",
        `Serve ${app.name} a MCP server (streamable http)`,
        (yargs) => {
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
        async (options) => {
          const port = options.port || DEFAULT_PORT();

          const aigne = await loadAIGNE(dir);

          await serveMCPServer({
            aigne,
            host: options.host,
            port,
            pathname: options.pathname,
          });

          console.log(`MCP server is running on http://${options.host}:${port}${options.pathname}`);
        },
      );

      for (const agent of aigne.cli?.agents ?? []) {
        const inputSchema: { [key: string]: ZodType } =
          agent.inputSchema instanceof ZodObject ? agent.inputSchema.shape : {};

        yargs.command<{ input?: string[]; format?: "json" | "yaml" }>(
          agent.name,
          agent.description || "",
          (yargs) => {
            for (const [option, config] of Object.entries(inputSchema)) {
              yargs.option(option, {
                // TODO: support more types
                type: "string",
                description: config.description,
              });

              if (!(config.isNullable() || config.isOptional())) {
                yargs.demandOption(option);
              }
            }

            yargs
              .option("input", {
                type: "array",
                description: "Input to the agent, use @<file> to read from a file",
                alias: ["i"],
              })
              .option("format", {
                type: "string",
                description: 'Input format, can be "json" or "yaml"',
                choices: ["json", "yaml"],
              });
          },
          async (argv) => {
            try {
              const aigne = await loadAIGNE(dir);
              const _agent = aigne.agents[agent.name];
              assert(_agent, `Agent ${agent.name} not found in ${app.name}`);

              const input = Object.fromEntries(
                await Promise.all(
                  Object.entries(pick(argv, Object.keys(inputSchema))).map(async ([key, val]) => {
                    if (typeof val === "string" && val.startsWith("@")) {
                      const schema = inputSchema[key];

                      val = await readFileAsInput(val, {
                        format: schema instanceof ZodString ? "raw" : undefined,
                      });
                    }

                    return [key, val];
                  }),
                ),
              );

              const rawInput =
                argv.input ||
                (isatty(process.stdin.fd) || !(await stdinHasData())
                  ? null
                  : [await readAllString(process.stdin)].filter(Boolean));

              if (rawInput) {
                for (const raw of rawInput) {
                  const parsed = raw.startsWith("@")
                    ? await readFileAsInput(raw, { format: argv.format })
                    : raw;

                  if (typeof parsed !== "string") {
                    Object.assign(input, parsed);
                  } else {
                    const inputKey = agent instanceof AIAgent ? agent.inputKey : undefined;
                    if (inputKey) {
                      Object.assign(input, { [inputKey]: parsed });
                    }
                  }
                }
              }

              await runAgentWithAIGNE(aigne, _agent, { input });
            } finally {
              await aigne.shutdown();
            }
          },
        );
      }

      yargs.version(`${app.name} v${version}`);

      return yargs.demandCommand();
    },
    handler: () => {},
  }));
}

async function readFileAsInput(
  value: string,
  { format }: { format?: "raw" | "json" | "yaml" } = {},
): Promise<unknown> {
  if (value.startsWith("@")) {
    value = await readFile(value.slice(1), "utf8");

    if (!format) {
      const ext = extname(value);
      if (ext === ".json") format = "json";
      else if (ext === ".yaml" || ext === ".yml") format = "yaml";
    }
  }

  if (format === "json") {
    return JSON.parse(value);
  } else if (format === "yaml") {
    return parse(value);
  }

  return value;
}

async function loadApplication({
  name,
}: {
  name: string;
}): Promise<{ aigne: AIGNE; dir: string; version: string }> {
  name = `@aigne/${name}`;
  const dir = join(homedir(), ".aigne", "registry.npmjs.org", name);

  const check = await isInstallationAvailable(dir);
  if (check?.available) {
    return {
      aigne: await AIGNE.load(dir, { models: availableModels() }),
      dir,
      version: check.version,
    };
  }

  const result = await new Listr<{
    url: string;
    version: string;
  }>(
    [
      {
        title: "Fetching application metadata",
        task: async (ctx) => {
          const info = await getNpmTgzInfo(name);
          Object.assign(ctx, info);
        },
      },
      {
        title: "Downloading application",
        skip: (ctx) => ctx.version === check?.version,
        task: async (ctx) => {
          await downloadApplication({ url: ctx.url, dir });
        },
      },
      {
        title: "Installing dependencies",
        skip: (ctx) => ctx.version === check?.version,
        task: async () => {
          await installDependencies(dir);
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
    aigne: await AIGNE.load(dir, { models: availableModels() }),
    dir,
    version: result.version,
  };
}

async function isInstallationAvailable(
  dir: string,
  { cacheTimeMs = NPM_PACKAGE_CACHE_TIME_MS }: { cacheTimeMs?: number } = {},
): Promise<{ version: string; available: boolean } | null> {
  const s = await stat(join(dir, "package.json")).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  });

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

async function downloadApplication({ url, dir }: { url: string; dir: string }) {
  await mkdir(dir, { recursive: true });
  await downloadAndExtract(url, dir, { strip: 1 });
}

async function installDependencies(dir: string) {
  const { stderr, status } = spawnSync("npm", ["install", "--omit", "dev"], {
    cwd: dir,
    stdio: "pipe",
  });
  if (status !== 0) {
    console.error(stderr.toString());
    throw new Error(`Failed to install dependencies in ${dir}`);
  }

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

function safeParseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
