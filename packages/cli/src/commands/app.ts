import { fork } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CommandModule } from "yargs";
import { NeedReinstallBetaError, NeedReinstallError } from "./app/upgrade.js";

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

export function createAppCommands({ argv }: { argv?: string[] } = {}): CommandModule[] {
  return builtinApps.map((app) => ({
    command: app.name,
    describe: app.describe,
    aliases: app.aliases,
    builder: async (y) => y.help(false).version(false).strict(false),
    handler: async () => {
      let retried = false;

      let retryWithBeta = false;

      while (true) {
        const child = fork(join(dirname(fileURLToPath(import.meta.url)), "./app/cli.js"), argv, {
          stdio: "inherit",
          env: {
            ...process.env,
            AIGNE_APP_NAME: app.name,
            AIGNE_APP_PACKAGE_NAME: app.packageName,
            AIGNE_APP_DESCRIPTION: app.describe,
            AIGNE_APP_USE_BETA_APPS: retryWithBeta ? "1" : "0",
          },
        });

        const code = await new Promise<number | null>((resolve) => {
          child.on("exit", (code) => resolve(code));
        });

        if (code === NeedReinstallError.code || code === NeedReinstallBetaError.code) {
          if (retried) process.exit(1);
          retryWithBeta = code === NeedReinstallBetaError.code;
          retried = true;
        } else {
          process.exit(code);
        }
      }
    },
  }));
}
