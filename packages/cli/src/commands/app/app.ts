import { homedir } from "node:os";
import { join } from "node:path";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { highlightUrl } from "../../utils/string-utils.js";
import { withRunAgentCommonOptions } from "../../utils/yargs.js";
import { agentCommandModule, cliAgentCommandModule, serveMcpCommandModule } from "./agent.js";
import {
  loadApplication,
  NeedReinstallBetaError,
  NeedReinstallError,
  upgradeCommandModule,
} from "./upgrade.js";

export async function runAppCLI({
  appName = process.env.AIGNE_APP_NAME,
  appPackageName = process.env.AIGNE_APP_PACKAGE_NAME,
  appDescription = process.env.AIGNE_APP_DESCRIPTION,
  appUseBetaVersion = process.env.AIGNE_APP_USE_BETA_APPS === "1" ? true : undefined,
  ...options
}: {
  argv?: string[];
  appName?: string;
  appPackageName?: string;
  appDescription?: string;
  appUseBetaVersion?: boolean;
} = {}) {
  const [scriptName, ...argv] = options.argv || hideBin(process.argv);
  if (!appName || !appPackageName)
    throw new Error("AIGNE_APP_NAME or AIGNE_APP_PACKAGE_NAME is not defined");

  try {
    // Parse model options for loading application
    const options = withRunAgentCommonOptions(
      yargs(argv).help(false).version(false).strict(false),
    ).parseSync();
    logger.level = options.logLevel;

    const dir = join(homedir(), ".aigne", "registry.npmjs.org", appPackageName);

    const y = yargs()
      .scriptName(`aigne ${scriptName}`)
      .usage(`aigne ${scriptName}\n\n${appDescription || ""}`)
      .command(upgradeCommandModule({ packageName: appPackageName, dir }));

    if (!isUpgradeCommand(argv)) {
      const { aigne, version } = await loadApplication({
        packageName: appPackageName,
        beta: appUseBetaVersion,
        dir,
        install: true,
        modelOptions: options,
        imageModelOptions: { model: options.imageModel },
        skipModelLoading: (options.help || options.h || options.version || options.v) === true,
      });

      if (aigne.cli?.chat) {
        y.command({
          ...agentCommandModule({
            aigne,
            agent: aigne.cli.chat,
            chat: true,
          }),
          command: "$0",
        });
      }

      for (const cliAgent of aigne.cli?.agents ?? []) {
        y.command(cliAgentCommandModule({ aigne, cliAgent }));
      }

      y.option("model", {
        type: "string",
        description:
          "Model to use for the application, example: openai:gpt-4.1 or google:gemini-2.5-flash",
      }).command(serveMcpCommandModule({ aigne, name: appName }));

      y.version(`${appName} v${version}`);
    }

    await y
      .alias("v", "version")
      .alias("h", "help")
      .demandCommand()
      .fail((message, error, yargs) => {
        // We catch all errors below, here just print the help message non-error case like demandCommand
        if (!error) {
          yargs.showHelp();

          console.error(`\n${message}`);
          process.exit(1);
        }
      })
      .parseAsync(argv);

    process.exit(0);
  } catch (error) {
    if (error instanceof NeedReinstallError || error instanceof NeedReinstallBetaError) {
      logger.warn(error.message);
      process.exit(
        error instanceof NeedReinstallBetaError
          ? NeedReinstallBetaError.code
          : NeedReinstallError.code,
      );
    }

    if (error.name !== "ExitPromptError") {
      console.log(""); // Add an empty line for better readability

      if (logger.enabled(LogLevel.ERROR)) {
        console.error(chalk.red(error.stack));
      } else {
        console.error(`${chalk.red("Error:")} ${highlightUrl(error.message)}`);
      }
    }

    process.exit(1);
  }
}

function isUpgradeCommand(argv: string[]): boolean {
  const skipGlobalOptions = ["-v", "--version", "-h", "--help"];
  return argv[0] === "upgrade" && !argv.some((arg) => skipGlobalOptions.includes(arg));
}
