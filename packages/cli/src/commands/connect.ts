import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import chalk from "chalk";
import { parse } from "yaml";
import type { CommandModule } from "yargs";
import { getUserInfo } from "../utils/aigne-hub-user.js";
import { AIGNE_ENV_FILE, connectToAIGNEHub, DEFAULT_URL } from "../utils/load-aigne.js";

interface ConnectOptions {
  url?: string;
}

interface StatusInfo {
  host: string;
  apiUrl: string;
  apiKey: string;
}

interface AIGNEEnv {
  [host: string]: {
    AIGNE_HUB_API_KEY: string;
    AIGNE_HUB_API_URL: string;
  };
}

const formatNumber = (balance: string) => {
  const balanceNum = String(balance).split(".")[0];
  return chalk.yellow((balanceNum || "").replace(/\B(?=(\d{3})+(?!\d))/g, ","));
};

export async function getConnectionStatus(): Promise<StatusInfo[]> {
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
        apiKey: config.AIGNE_HUB_API_KEY,
      });
    }

    return statusList;
  } catch {
    return [];
  }
}

export async function displayStatus(statusList: StatusInfo[]) {
  if (statusList.length === 0) {
    console.log(chalk.yellow("No AIGNE Hub connections found."));
    console.log("Use 'aigne connect <url>' to connect to a hub.");
    return;
  }

  console.log(chalk.blue("AIGNE Hub Connection Status:\n"));
  const defaultStatus =
    statusList.find((status) => status.host === "default")?.apiUrl || DEFAULT_URL;

  for (const status of statusList.filter((status) => status.host !== "default")) {
    const userInfo = await getUserInfo({
      baseUrl: status.apiUrl,
      accessKey: status.apiKey,
    }).catch((e) => {
      console.error(e);
      return null;
    });

    const isConnected = new URL(status.apiUrl).origin === new URL(defaultStatus).origin;
    const statusIcon = isConnected ? chalk.green("✓") : chalk.red("✗");
    const statusText = isConnected ? "Connected" : "Disconnected";

    console.log(`${statusIcon} ${chalk.bold(status.host)}`);
    console.log(`   Status: ${statusText}`);
    if (userInfo) {
      console.log(`   User: ${userInfo?.user.fullName}`);
      console.log(`   User DID: ${userInfo?.user.did}`);

      if (userInfo?.user.email) {
        console.log(`   Email: ${userInfo?.user.email}`);
      }

      if (userInfo?.creditBalance) {
        const balance = formatNumber(userInfo?.creditBalance?.balance);
        const total = formatNumber(userInfo?.creditBalance?.total);
        console.log(`   Plan: ${balance} / ${total}`);
      }

      console.log(
        `   Billing URL: ${userInfo?.paymentLink ? chalk.green(userInfo.paymentLink) : chalk.red("N/A")}`,
      );
    }

    console.log("");
  }
}

export function createConnectCommand(): CommandModule<unknown, ConnectOptions> {
  return {
    command: "connect [url]",
    describe: "Manage AIGNE Hub connections",
    builder: (yargs) => {
      return yargs
        .positional("url", {
          describe: "URL to the AIGNE Hub server",
          type: "string",
          default: "https://hub.aigne.io/",
        })
        .command({
          command: "status",
          describe: "Show current connection status",
          handler: async () => {
            const statusList = await getConnectionStatus();
            await displayStatus(statusList);
          },
        });
    },
    handler: async (argv) => {
      const url = argv.url || "https://hub.aigne.io/";

      console.log(chalk.blue(`Connecting to AIGNE Hub: ${url}`));

      try {
        await connectToAIGNEHub(url);
        console.log(chalk.green("✓ Successfully connected to AIGNE Hub"));
      } catch (error) {
        console.error(chalk.red("✗ Failed to connect to AIGNE Hub:"), error.message);
        process.exit(1);
      }
    },
  };
}
