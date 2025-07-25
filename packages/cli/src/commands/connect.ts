import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import chalk from "chalk";
import { Command, type OptionValues } from "commander";
import { parse } from "yaml";
import { AIGNE_ENV_FILE, connectToAIGNEHub } from "../utils/load-aigne.js";

interface ConnectOptions extends OptionValues {
  url: string;
}

interface StatusInfo {
  host: string;
  apiUrl?: string;
}

interface AIGNEEnv {
  [host: string]: {
    AIGNE_HUB_API_KEY: string;
    AIGNE_HUB_API_URL: string;
  };
}

async function getConnectionStatus(): Promise<StatusInfo[]> {
  if (!existsSync(AIGNE_ENV_FILE)) {
    return [];
  }

  try {
    const data = await readFile(AIGNE_ENV_FILE, "utf8");
    const envs = parse(data) as AIGNEEnv;

    const statusList: StatusInfo[] = [];

    for (const [host, config] of Object.entries(envs)) {
      statusList.push({
        host,
        apiUrl: config.AIGNE_HUB_API_URL,
      });
    }

    return statusList;
  } catch {
    return [];
  }
}

function displayStatus(statusList: StatusInfo[]) {
  if (statusList.length === 0) {
    console.log(chalk.yellow("No AIGNE Hub connections found."));
    console.log("Use 'aigne connect <url>' to connect to a hub.");
    return;
  }

  console.log(chalk.blue("AIGNE Hub Connection Status:\n"));

  for (const status of statusList) {
    const statusIcon = status.apiUrl ? chalk.green("✓") : chalk.red("✗");
    const statusText = status.apiUrl ? "Connected" : "Disconnected";

    console.log(`${statusIcon} ${chalk.bold(status.host)}`);
    console.log(`   Status: ${statusText}`);
    // TODO 需要小芳提供接口
    // console.log(`   Payment URL: ${status.apiUrl}/payment`);
    // console.log(`   Billing URL: ${status.apiUrl}/billing`);

    console.log("");
  }
}

export function createConnectCommand(): Command {
  const connectCommand = new Command("connect")
    .description("Manage AIGNE Hub connections")
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);

  connectCommand
    .command("status")
    .description("Show current connection status")
    .action(async () => {
      const statusList = await getConnectionStatus();
      displayStatus(statusList);
    });

  connectCommand
    .option("--url <url>", "URL to the AIGNE Hub server")
    .action(async (options: ConnectOptions) => {
      const url = options.url || "https://hub.aigne.io/";

      console.log(chalk.blue(`Connecting to AIGNE Hub: ${url}`));

      try {
        await connectToAIGNEHub(url);
        console.log(chalk.green("✓ Successfully connected to AIGNE Hub"));
      } catch (error) {
        console.error(chalk.red("✗ Failed to connect to AIGNE Hub:"), error.message);
        process.exit(1);
      }
    });

  return connectCommand;
}
