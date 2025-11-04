import { spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { LoadCredentialOptions } from "@aigne/cli/utils/aigne-hub/type.js";
import type { AIGNE, ChatModelInputOptions, ImageModelInputOptions } from "@aigne/core";
import { fetch } from "@aigne/core/utils/fetch.js";
import { Listr, PRESET_TIMER } from "@aigne/listr2";
import { joinURL } from "ufo";
import type { CommandModule } from "yargs";
import { downloadAndExtract } from "../../utils/download.js";
import { loadAIGNE } from "../../utils/load-aigne.js";
import { withSpinner } from "../../utils/spinner.js";

const NPM_PACKAGE_CACHE_TIME_MS = 1000 * 60 * 60 * 24; // 1 day

/**
 * Check if beta applications should be used based on environment variables
 */
function shouldUseBetaApps(): boolean {
  const envVar = process.env.AIGNE_USE_BETA_APPS;
  return envVar === "true" || envVar === "1";
}

export const upgradeCommandModule = ({
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
  builder: (yargs) => {
    return yargs
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

    const npm = await withSpinner("", async () => {
      if (force) await rm(dir, { force: true, recursive: true });
      return await getNpmTgzInfo(packageName, { beta, version: targetVersion });
    });

    const check = await checkInstallation(dir);

    if (force || !check || npm.version !== check.version) {
      await installApp({ packageName, dir, beta, version: targetVersion });
    }

    const app = await loadApplication({ dir, packageName, install: true, skipModelLoading: true });

    if (force || check?.version !== app.version) {
      console.log(`\n✅ Upgraded ${packageName} to version ${app.version}`);
    } else {
      console.log(`\n✅ ${packageName} is already at the latest version (${app.version})`);
    }
  },
});

interface LoadApplicationOptions {
  packageName: string;
  dir: string;
  install?: boolean;
  skipModelLoading?: boolean;
  modelOptions?: ChatModelInputOptions & LoadCredentialOptions;
  imageModelOptions?: ImageModelInputOptions & LoadCredentialOptions;
  beta?: boolean;
}

interface LoadApplicationResult {
  aigne: AIGNE;
  version: string;
  isCache?: boolean;
}

export class NeedReinstallError extends Error {
  static code = 244;
}

export class NeedReinstallBetaError extends Error {
  static code = 245;
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

  const beta = options.beta ?? check?.version?.includes("beta");

  if (check) {
    let needUpdate = check.expired;

    if (check.expired) {
      await withSpinner("Checking updates...", async () => {
        const tgz = await getNpmTgzInfo(packageName, { beta });
        if (tgz.version === check.version) {
          await writeInstallationMetadata(dir, { installedAt: Date.now() });
          needUpdate = false;
        }
      });
    }

    if (!needUpdate) {
      const aigne = await loadAIGNE({
        path: dir,
        skipModelLoading: options.skipModelLoading,
        modelOptions: options.modelOptions,
        imageModelOptions: options.imageModelOptions,
        metadata: {
          appName: packageName,
          appVersion: check?.version,
        },
      }).catch(async (error) => {
        await withSpinner("", async () => {
          await rm(options.dir, { recursive: true, force: true });
          await mkdir(options.dir, { recursive: true });
        });

        const message = `⚠️ Failed to load ${packageName}, trying to reinstall: ${error.message}`;

        throw beta ? new NeedReinstallBetaError(message) : new NeedReinstallError(message);
      });

      if (aigne) {
        return { aigne, version: check.version, isCache: true };
      }
    }
  }

  if (!options.install) return null;

  const result = await installApp({ dir, packageName, beta });

  return {
    aigne: await loadAIGNE({
      path: dir,
      skipModelLoading: true,
      metadata: {
        appName: packageName,
        appVersion: result.version,
      },
    }),
    version: result.version,
  };
}

export async function getNpmTgzInfo(
  name: string,
  { version, beta }: { version?: string; beta?: boolean } = {},
): Promise<{ version: string; url: string }> {
  const res = await fetch(joinURL("https://registry.npmjs.org", name));
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
    const child = spawn("npm", ["install", "--omit", "dev", "--verbose", "--legacy-peer-deps"], {
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

function safeParseJSON<T>(raw: string): T | undefined {
  try {
    return JSON.parse(raw) as T;
  } catch {}
}
