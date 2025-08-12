import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { AIGNE_ENV_FILE, AIGNE_HUB_URL, connectToAIGNEHub } from "@aigne/aigne-hub";
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

  console.log(chalk.bold("Credits:"));
  console.log(`  ${chalk.bold("Used:".padEnd(8))} ${data.credits.used.toLocaleString()}`);
  console.log(`  ${chalk.bold("Total:".padEnd(8))} ${data.credits.total.toLocaleString()}`);
  console.log("");

  console.log(chalk.bold("Links:"));
  console.log(`  ${chalk.bold("Payment:".padEnd(8))} ${data.links.payment}`);
  console.log(`  ${chalk.bold("Profile:".padEnd(8))} ${data.links.profile}`);
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

async function formatHubsList(statusList: StatusInfo[]) {
  if (statusList.length === 0) {
    console.log(chalk.yellow("No AIGNE Hub configured."));
    console.log("Use 'aigne hub connect' to connect to a hub.");
    return;
  }

  const defaultStatus =
    statusList.find((status) => status.host === "default")?.apiUrl || AIGNE_HUB_URL;

  const table = new Table({
    head: ["URL", "ACTIVE", "STATUS"],
    colWidths: [50, 10, 20],
    style: {
      head: ["cyan"],
      border: ["grey"],
    },
  });

  console.log(chalk.blue("AIGNE Hubs:\n"));

  const list = statusList.filter((status) => status.host !== "default");
  for (const status of list) {
    const isConnected = new URL(status.apiUrl).origin === new URL(defaultStatus).origin;

    table.push([
      status.apiUrl,
      isConnected ? "*" : "-",
      isConnected ? "Connected" : "Not connected",
    ]);
  }

  console.log(table.toString());
}

export function createHubCommand(): CommandModule {
  return {
    command: "hub <command>",
    describe: "Manage AIGNE Hub connections",
    builder: (yargs) =>
      yargs
        .command(["list", "ls"], "List all connected AIGNE Hubs", listHubs)
        .command("connect", "Connect to an AIGNE Hub", connectHub)
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
  const hubs = (await getHubs()).filter((h) => h.host !== "default");
  if (!hubs.length) {
    console.log(chalk.yellow("No AIGNE Hub configured."));
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
  const active = (await getHubs()).find((h) => h.host === "default")?.apiUrl;
  if (!active) {
    console.log(chalk.red("No active hub."));
    return;
  }
  console.log(`Active hub: ${active} - online`);
}

async function removeHub() {
  const hubs = (await getHubs()).filter((h) => h.host !== "default");
  if (!hubs.length) {
    console.log(chalk.yellow("No AIGNE Hub configured."));
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
  const hubs = (await getHubs()).filter((h) => h.host !== "default");
  if (!hubs.length) {
    console.log(chalk.yellow("No AIGNE Hub configured."));
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
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8")) as AIGNEEnv;
  const host = new URL(url).host;

  if (envs[host]) {
    await setDefaultHub(envs[host]?.AIGNE_HUB_API_URL || "");
    console.log(chalk.green(`✓ Hub ${envs[host]?.AIGNE_HUB_API_URL} connected successfully.`));
    return;
  }

  try {
    await connectToAIGNEHub(url);
    console.log(chalk.green(`✓ Hub ${url} connected successfully.`));
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to connect:"), error.message);
  }
}

async function setDefaultHub(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8")) as AIGNEEnv;
  const host = new URL(url).host;

  if (!envs[host]) {
    console.error(chalk.red("✗ Hub not found"));
    return;
  }

  await writeFile(
    AIGNE_ENV_FILE,
    stringify({ ...envs, default: { AIGNE_HUB_API_URL: envs[host]?.AIGNE_HUB_API_URL } }),
  );
  console.log(chalk.green(`✓ Switched active hub to ${url}`));
}

async function deleteHub(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8")) as AIGNEEnv;
  const host = new URL(url).host;
  delete envs[host];
  await writeFile(AIGNE_ENV_FILE, stringify(envs));
  console.log(chalk.green(`✓ Hub ${url} removed`));
}

async function printHubDetails(url: string) {
  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8")) as AIGNEEnv;
  const host = new URL(url).host;

  const userInfo = await getUserInfo({
    baseUrl: envs[host]?.AIGNE_HUB_API_URL || "",
    apiKey: envs[host]?.AIGNE_HUB_API_KEY || "",
  }).catch(() => null);

  printHubStatus({
    hub: url,
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
  });
}
