import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { AIGNE_ENV_FILE, AIGNE_HUB_URL, connectToAIGNEHub, isTest } from "@aigne/aigne-hub";
import chalk from "chalk";
import Table from "cli-table3";
import inquirer from "inquirer";
import { parse, stringify } from "yaml";
import type { CommandModule } from "yargs";
import { getUserInfo } from "../utils/aigne-hub-user.js";

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

function printHubStatus(data: {
  hub: string;
  status: string;
  user: {
    name: string;
    did: string;
    email: string;
  };
  credits: {
    used: string;
    total: string;
  };
  links: {
    payment: string;
    profile: string;
  };
  enableCredit: boolean;
}) {
  const divider = "─".repeat(46);

  console.log(chalk.bold("AIGNE Hub Connection"));
  console.log(chalk.gray(divider));

  console.log(`${chalk.bold("Hub:".padEnd(10))} ${data.hub}`);
  console.log(
    `${chalk.bold("Status:".padEnd(10))} ${
      data.status === "Connected"
        ? chalk.green(`${data.status} ✅`)
        : chalk.red(`${data.status} ❌`)
    }`,
  );
  console.log("");

  console.log(chalk.bold("User:"));
  console.log(`  ${chalk.bold("Name:".padEnd(8))} ${data.user.name}`);
  console.log(`  ${chalk.bold("DID:".padEnd(8))} ${data.user.did}`);
  console.log(`  ${chalk.bold("Email:".padEnd(8))} ${data.user.email}`);
  console.log("");

  if (data.enableCredit) {
    console.log(chalk.bold("Credits:"));
    console.log(`  ${chalk.bold("Used:".padEnd(8))} ${data.credits.used.toLocaleString()}`);
    console.log(`  ${chalk.bold("Total:".padEnd(8))} ${data.credits.total.toLocaleString()}`);
    console.log("");

    console.log(chalk.bold("Links:"));
    if (data.links.payment) {
      console.log(`  ${chalk.bold("Payment:".padEnd(8))} ${data.links.payment}`);
    }
    if (data.links.profile) {
      console.log(`  ${chalk.bold("Profile:".padEnd(8))} ${data.links.profile}`);
    }
  }
}

async function getHubs(): Promise<StatusInfo[]> {
  if (!existsSync(AIGNE_ENV_FILE)) {
    return [];
  }

  try {
    const data = await readFile(AIGNE_ENV_FILE, "utf8");
    const envs = parse(data) as AIGNEEnv;

    const statusList: StatusInfo[] = [];

    for (const [host, config] of Object.entries(envs)) {
      if (host !== "default") {
        statusList.push({
          host,
          apiUrl: config.AIGNE_HUB_API_URL,
          apiKey: config.AIGNE_HUB_API_KEY,
        });
      }
    }

    return statusList;
  } catch {
    return [];
  }
}

const getDefaultHub = async () => {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({}))) as AIGNEEnv;
  return envs?.default?.AIGNE_HUB_API_URL || AIGNE_HUB_URL;
};

async function formatHubsList(statusList: StatusInfo[]) {
  if (statusList?.length === 0) {
    console.log(chalk.yellow("No AIGNE Hub connected."));
    console.log("Use 'aigne hub connect' to connect to a hub.");
    return;
  }

  const defaultHub = await getDefaultHub();

  const table = new Table({
    head: ["URL", "ACTIVE"],
    colWidths: [70, 10],
    style: {
      head: ["cyan"],
      border: ["grey"],
    },
  });

  console.log(chalk.blue("Connected AIGNE Hubs:\n"));

  for (const status of statusList) {
    const isConnected = new URL(status.apiUrl).origin === new URL(defaultHub).origin;
    table.push([status.apiUrl, isConnected ? "YES" : "NO"]);
  }

  console.log(table.toString());
  console.log(chalk.blue("Use 'aigne hub use' to switch to a different hub."));
}

export function createHubCommand(): CommandModule {
  return {
    command: "hub <command>",
    describe: "Manage AIGNE Hub connections",
    builder: (yargs) =>
      yargs
        .command(["list", "ls"], "List all connected AIGNE Hubs", listHubs)
        .command({
          command: "connect [url]",
          describe: "Connect to an AIGNE Hub",
          builder: (yargs) =>
            yargs.positional("url", {
              type: "string",
              describe: "The URL of the AIGNE Hub to connect to",
              default: null,
            }),
          handler: (args) => {
            if (args.url) {
              saveAndConnect(args.url);
            } else {
              connectHub();
            }
          },
        })
        .command("use", "Switch to a different AIGNE Hub", useHub)
        .command(["status", "st"], "Show current active hub", showStatus)
        .command(["remove", "rm"], "Remove a connected hub", removeHub)
        .command(["info", "i"], "Show details of a connected hub", showInfo)
        .demandCommand(1, "Please provide a valid hub command"),
    handler: () => {},
  };
}

const listHubs = async () => {
  const list = await getHubs();
  await formatHubsList(list);
};

async function connectHub() {
  const defaultUrl = "https://hub.aigne.io";
  const { isOfficial } = await inquirer.prompt({
    type: "select",
    name: "isOfficial",
    message: `Choose a hub to connect:`,
    choices: [
      { name: `Official Hub (${defaultUrl})`, value: true },
      { name: `Custom Hub URL`, value: false },
    ],
    default: true,
  });

  let currentUrl = defaultUrl;
  if (!isOfficial) {
    const { customUrl } = await inquirer.prompt({
      type: "input",
      name: "customUrl",
      message: "Enter the URL of your AIGNE Hub:",
      validate: validateUrl,
    });
    currentUrl = customUrl;
  }

  await saveAndConnect(currentUrl);
}

async function useHub() {
  const hubs = await getHubs();

  if (!hubs.length) {
    console.log(chalk.yellow("No AIGNE Hub connected."));
    return;
  }

  const { hubApiKey } = await inquirer.prompt({
    type: "select",
    name: "hubApiKey",
    message: `Choose a hub to switch to:`,
    choices: hubs.map((h) => ({
      name: new URL(h.apiUrl).origin,
      value: h.apiUrl,
    })),
  });

  await setDefaultHub(hubApiKey);
}

async function showStatus() {
  const active = await getDefaultHub();
  if (!active) {
    console.log(chalk.red("No active hub."));
    return;
  }
  console.log(`Active hub: ${active} - online`);
}

async function removeHub() {
  const hubs = await getHubs();
  if (!hubs.length) {
    console.log(chalk.yellow("No AIGNE Hub connected."));
    return;
  }

  const { hubApiKey } = await inquirer.prompt({
    type: "select",
    name: "hubApiKey",
    message: `Choose a hub to remove:`,
    choices: hubs.map((h) => ({
      name: new URL(h.apiUrl).origin,
      value: h.apiUrl,
    })),
  });

  await deleteHub(hubApiKey);
}

async function showInfo() {
  const hubs = await getHubs();
  if (!hubs.length) {
    console.log(chalk.yellow("No AIGNE Hub connected."));
    return;
  }

  const { hubApiKey } = await inquirer.prompt({
    type: "select",
    name: "hubApiKey",
    message: `Choose a hub to view info:`,
    choices: hubs.map((h) => ({
      name: new URL(h.apiUrl).origin,
      value: h.apiUrl,
    })),
  });

  await printHubDetails(hubApiKey);
}

function validateUrl(input: string) {
  try {
    const url = new URL(input);
    return url.protocol.startsWith("http") ? true : "Must be http or https";
  } catch {
    return "Invalid URL";
  }
}

async function saveAndConnect(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({}))) as AIGNEEnv;
  const host = new URL(url).host;

  if (envs[host]) {
    const currentUrl = envs[host]?.AIGNE_HUB_API_URL;
    if (currentUrl) {
      await setDefaultHub(currentUrl);
      console.log(chalk.green(`✓ Hub ${new URL(currentUrl).origin} connected successfully.`));
      return;
    }
  }

  try {
    if (isTest) {
      writeFile(
        AIGNE_ENV_FILE,
        stringify({
          "hub.aigne.io": {
            AIGNE_HUB_API_KEY: "test-key",
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
          default: {
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
        }),
      );
      return;
    }

    await connectToAIGNEHub(url);
    console.log(chalk.green(`✓ Hub ${new URL(url).origin} connected successfully.`));
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to connect:"), error.message);
  }
}

async function setDefaultHub(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({}))) as AIGNEEnv;
  const host = new URL(url).host;

  if (!envs[host]) {
    console.error(chalk.red("✗ Hub not found"));
    return;
  }

  await writeFile(
    AIGNE_ENV_FILE,
    stringify({ ...envs, default: { AIGNE_HUB_API_URL: envs[host]?.AIGNE_HUB_API_URL } }),
  );
  console.log(chalk.green(`✓ Switched active hub to ${new URL(url).origin}`));
}

async function deleteHub(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({}))) as AIGNEEnv;
  const host = new URL(url).host;
  delete envs[host];

  if (envs.default?.AIGNE_HUB_API_URL && new URL(envs.default?.AIGNE_HUB_API_URL).host === host) {
    delete envs.default;
  }

  await writeFile(AIGNE_ENV_FILE, stringify(envs));
  console.log(chalk.green(`✓ Hub ${new URL(url).origin} removed`));
}

async function printHubDetails(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({}))) as AIGNEEnv;
  const host = new URL(url).host;

  const userInfo = await getUserInfo({
    baseUrl: envs[host]?.AIGNE_HUB_API_URL || "",
    apiKey: envs[host]?.AIGNE_HUB_API_KEY || "",
  }).catch(() => null);

  printHubStatus({
    hub: new URL(url).origin,
    status: userInfo ? "Connected" : "Not connected",
    user: {
      name: userInfo?.user.fullName || "",
      did: userInfo?.user.did || "",
      email: userInfo?.user.email || "",
    },
    credits: {
      used: formatNumber(userInfo?.creditBalance?.balance || "0"),
      total: formatNumber(userInfo?.creditBalance?.total || "0"),
    },
    links: {
      payment: userInfo?.paymentLink || "",
      profile: userInfo?.profileLink || "",
    },
    enableCredit: userInfo?.enableCredit || false,
  });
}
