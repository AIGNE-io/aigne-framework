import { AIGNE_HUB_URL } from "@aigne/aigne-hub";
import chalk from "chalk";
import Table from "cli-table3";
import inquirer from "inquirer";
import type { CommandModule } from "yargs";
import { isTest } from "../utils/aigne-hub/constants.js";
import { connectToAIGNEHub } from "../utils/aigne-hub/credential.js";
import getSecretStore from "../utils/aigne-hub/store/index.js";
import { getUserInfo } from "../utils/aigne-hub-user.js";
import { getUrlOrigin } from "../utils/get-url-origin.js";

interface StatusInfo {
  host: string;
  apiUrl: string;
  apiKey: string;
}

export const formatNumber = (balance: string) => {
  const cleanNumber = String(balance).replace(/[^\d.-]/g, "");
  const balanceNum = cleanNumber.split(".")[0];

  if (!balanceNum) {
    return "0";
  }

  return (balanceNum || "").trim().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatNumberWithColor = (balance: string) => {
  return chalk.yellow(formatNumber(balance));
};

function formatHubInfoName(name: string) {
  return chalk.bold(`${name}:`.padEnd(10));
}

function printHubStatus(data: {
  hub: string;
  status: string;
  user: {
    name: string;
    did: string;
    email: string;
  };
  credits: {
    available: string;
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
  console.log(`  ${formatHubInfoName("Name")} ${data.user.name}`);
  console.log(`  ${formatHubInfoName("DID")} ${data.user.did}`);
  console.log(`  ${formatHubInfoName("Email")} ${data.user.email}`);
  console.log("");

  if (data.enableCredit) {
    console.log(chalk.bold("Credits:"));
    console.log(`  ${formatHubInfoName("Total")} ${formatNumberWithColor(data.credits.total)}`);
    console.log(`  ${formatHubInfoName("Used")} ${formatNumberWithColor(data.credits.used)}`);
    console.log(
      `  ${formatHubInfoName("Available")} ${formatNumberWithColor(data.credits.available)}`,
    );
    console.log("");

    console.log(chalk.bold("Links:"));
    if (data.links.payment) {
      console.log(`  ${formatHubInfoName("Payment")} ${data.links.payment}`);
    }
    if (data.links.profile) {
      console.log(`  ${formatHubInfoName("Credits")} ${data.links.profile}`);
    }
  }
}

async function getHubs(): Promise<StatusInfo[]> {
  try {
    const secretStore = await getSecretStore();
    const hosts = await secretStore.listHosts();

    const statusList: StatusInfo[] = [];
    for (const host of hosts) {
      statusList.push({
        host: new URL(host.AIGNE_HUB_API_URL).host,
        apiUrl: host.AIGNE_HUB_API_URL,
        apiKey: host.AIGNE_HUB_API_KEY || "",
      });
    }

    return statusList;
  } catch {
    return [];
  }
}

const getDefaultHub = async () => {
  try {
    const secretStore = await getSecretStore();
    const defaultHost = await secretStore.getDefault();
    return defaultHost?.AIGNE_HUB_API_URL || AIGNE_HUB_URL;
  } catch {
    return AIGNE_HUB_URL;
  }
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
    const isConnected = getUrlOrigin(status.apiUrl) === getUrlOrigin(defaultHub);
    table.push([getUrlOrigin(status.apiUrl), isConnected ? "YES" : "NO"]);
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
        .command(["status", "st"], "Show details of a connected hub", showInfo)
        .command(["remove", "rm"], "Remove a connected hub", removeHub)
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
      name: getUrlOrigin(h.apiUrl),
      value: h.apiUrl,
    })),
  });

  await setDefaultHub(hubApiKey);
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
      name: getUrlOrigin(h.apiUrl),
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

  const defaultHub = await getDefaultHub();
  const defaultHubIndex = hubs.findIndex(
    (h) => getUrlOrigin(h.apiUrl) === getUrlOrigin(defaultHub),
  );

  const { hubApiKey } = await inquirer.prompt({
    type: "select",
    name: "hubApiKey",
    message: `Choose a hub to view info:`,
    choices: hubs.map((h, index) => ({
      name: `${getUrlOrigin(h.apiUrl)} ${defaultHubIndex === index ? "(connected)" : ""}`,
      value: h.apiUrl,
    })),
  });

  try {
    await printHubDetails(hubApiKey);
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to print hub details:"), error.message);
  }
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
  const secretStore = await getSecretStore();
  const currentKey = await secretStore.getKey(url);

  if (currentKey?.AIGNE_HUB_API_URL) {
    await setDefaultHub(currentKey.AIGNE_HUB_API_URL);
    console.log(
      chalk.green(`✓ Hub ${getUrlOrigin(currentKey.AIGNE_HUB_API_URL)} connected successfully.`),
    );
    return;
  }

  try {
    if (isTest) {
      await secretStore.setKey("https://hub.aigne.io/ai-kit", "test-key");
      await secretStore.setDefault("https://hub.aigne.io/ai-kit");
      console.log(chalk.green(`✓ Hub https://hub.aigne.io/ai-kit connected successfully.`));
      return;
    }

    await connectToAIGNEHub(url);
    console.log(chalk.green(`✓ Hub ${getUrlOrigin(url)} connected successfully.`));
  } catch (error: any) {
    console.error(chalk.red("✗ Failed to connect:"), error.message);
  }
}

async function setDefaultHub(url: string) {
  try {
    const secretStore = await getSecretStore();
    const key = await secretStore.getKey(url);

    if (!key) {
      console.error(chalk.red("✗ Hub not found"));
      return;
    }

    await secretStore.setDefault(key.AIGNE_HUB_API_URL);
    console.log(chalk.green(`✓ Switched active hub to ${getUrlOrigin(url)}`));
  } catch {
    console.error(chalk.red("✗ Failed to set default hub"));
  }
}

async function deleteHub(url: string) {
  try {
    const secretStore = await getSecretStore();
    const key = await secretStore.getKey(url);

    if (!key) {
      console.error(chalk.red("✗ Hub not found"));
      return;
    }

    const defaultHub = await getDefaultHub();

    await secretStore.deleteKey(url);

    if (!defaultHub) {
      return;
    }

    const isDefaultHub = getUrlOrigin(url) === getUrlOrigin(defaultHub);
    if (isDefaultHub) {
      await secretStore.deleteDefault();
      const remainingHubs = await getHubs();

      if (remainingHubs.length > 0) {
        const nextHub = remainingHubs[0];

        await secretStore.setDefault(nextHub?.apiUrl!);

        console.log(
          chalk.green(
            `✓ Hub ${getUrlOrigin(url)} removed, switched to ${getUrlOrigin(nextHub?.apiUrl!)}`,
          ),
        );
        return;
      }
    }

    console.log(chalk.green(`✓ Hub ${getUrlOrigin(url)} removed`));
  } catch {
    console.error(chalk.red("✗ Failed to delete hub"));
  }
}

async function printHubDetails(url: string) {
  const secretStore = await getSecretStore();
  const key = await secretStore.getKey(url);
  const defaultHub = await getDefaultHub();
  const isDefault = getUrlOrigin(url) === getUrlOrigin(defaultHub);

  const userInfo = await getUserInfo({
    baseUrl: key?.AIGNE_HUB_API_URL || "",
    apiKey: key?.AIGNE_HUB_API_KEY || "",
  }).catch(() => null);

  printHubStatus({
    hub: getUrlOrigin(url),
    status: isDefault ? "Connected" : "Not connected",
    user: {
      name: userInfo?.user.fullName || "",
      did: userInfo?.user.did || "",
      email: userInfo?.user.email || "",
    },
    credits: {
      available: userInfo?.creditBalance?.balance || "0",
      total: userInfo?.creditBalance?.total || "0",
      used: String(
        parseFloat(userInfo?.creditBalance?.total || "0") -
          parseFloat(userInfo?.creditBalance?.balance || "0"),
      ),
    },
    links: {
      payment: userInfo?.paymentLink || "",
      profile: userInfo?.profileLink || "",
    },
    enableCredit: userInfo?.enableCredit || false,
  });
}
