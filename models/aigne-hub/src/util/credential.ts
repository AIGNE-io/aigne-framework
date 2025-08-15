import { logger } from "@aigne/core/utils/logger.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import inquirer from "inquirer";
import open from "open";
import pWaitFor from "p-wait-for";
import { joinURL, withQuery } from "ufo";
import { parse, stringify } from "yaml";
import {
  ACCESS_KEY_SESSION_API,
  AGENT_HUB_PROVIDER,
  AIGNE_ENV_FILE,
  AIGNE_HUB_DID,
  AIGNE_HUB_URL as DEFAULT_AIGNE_HUB_URL,
  isTest,
  WELLKNOWN_SERVICE_PATH_PREFIX,
} from "./constants.js";
import { decrypt, encodeEncryptionKey } from "./crypto.js";
import type { CreateConnectOptions, FetchResult, LoadCredentialOptions } from "./type.js";

const request = async (config: { url: string; method?: string; requestCount?: number }) => {
  const headers: Record<string, string> = {};
  if (config.requestCount !== undefined) {
    headers["X-Request-Count"] = config.requestCount.toString();
  }

  const response = await fetch(config.url, { method: config.method || "GET", headers });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  return { data };
};

export const fetchConfigs = async ({
  connectUrl,
  sessionId,
  fetchInterval,
  fetchTimeout,
}: {
  connectUrl: string;
  sessionId: string;
  fetchInterval: number;
  fetchTimeout: number;
}) => {
  const sessionURL = withQuery(joinURL(connectUrl, ACCESS_KEY_SESSION_API), { sid: sessionId });

  let requestCount = 0;
  const condition = async () => {
    const { data: session } = await request({ url: sessionURL, requestCount });
    requestCount++;
    return Boolean(session.accessKeyId && session.accessKeySecret);
  };

  await pWaitFor(condition, { interval: fetchInterval, timeout: fetchTimeout });

  const { data: session } = await request({ url: sessionURL, requestCount });
  await request({ url: sessionURL, method: "DELETE" });

  return {
    ...session,
    accessKeyId: session.accessKeyId,
    accessKeySecret: decrypt(session.accessKeySecret, session.accessKeyId, session.challenge),
  };
};

function baseWrapSpinner(_: string, waiting: () => Promise<FetchResult>) {
  return Promise.resolve(waiting());
}

export async function createConnect({
  connectUrl,
  openPage,
  fetchInterval = 3 * 1000,
  retry = 1500,
  source = "Blocklet CLI",
  connectAction = "connect-cli",
  wrapSpinner = baseWrapSpinner,
  closeOnSuccess,
  intervalFetchConfig,
  appName = "AIGNE CLI",
  appLogo = "https://www.aigne.io/favicon.ico?imageFilter=resize&w=32",
}: CreateConnectOptions) {
  const startSessionURL = joinURL(connectUrl, ACCESS_KEY_SESSION_API);
  const { data: session } = await request({ url: startSessionURL, method: "POST" });
  const token = session.id;

  const pageUrl = withQuery(joinURL(connectUrl, connectAction), {
    __token__: encodeEncryptionKey(token),
    source,
    closeOnSuccess,
    cli: true,
    appName: ` ${appName}`,
    appLogo,
  });

  openPage?.(pageUrl);

  return await wrapSpinner(`Waiting for connection: ${connectUrl}`, async () => {
    const checkAuthorizeStatus = intervalFetchConfig ?? fetchConfigs;

    const authorizeStatus = await checkAuthorizeStatus({
      connectUrl,
      sessionId: token,
      fetchTimeout: retry * fetchInterval,
      fetchInterval: retry,
    });

    return authorizeStatus;
  });
}

export async function getAIGNEHubMountPoint(url: string) {
  const { origin } = new URL(url);
  const BLOCKLET_JSON_PATH = "__blocklet__.js?type=json";
  const blockletInfo = await fetch(joinURL(origin, BLOCKLET_JSON_PATH));
  const blocklet = await blockletInfo.json();
  const aigneHubMount = (blocklet?.componentMountPoints || []).find(
    (m: { did: string }) => m.did === AIGNE_HUB_DID,
  );

  return joinURL(origin, aigneHubMount?.mountPoint || "");
}

export async function connectToAIGNEHub(url: string) {
  const { origin, host } = new URL(url);
  const connectUrl = joinURL(origin, WELLKNOWN_SERVICE_PATH_PREFIX);
  const apiUrl = await getAIGNEHubMountPoint(url);

  try {
    const openFn = isTest ? () => {} : open;
    const result = await createConnect({
      connectUrl: connectUrl,
      connectAction: "gen-simple-access-key",
      source: `@aigne/cli connect to AIGNE hub`,
      closeOnSuccess: true,
      openPage: (pageUrl) => openFn(pageUrl),
    });

    const accessKeyOptions = {
      apiKey: result.accessKeySecret,
      url: apiUrl,
    };

    // After redirection, write the AIGNE Hub access token
    const aigneDir = nodejs.path.join(nodejs.os.homedir(), ".aigne");
    if (!nodejs.fsSync.existsSync(aigneDir)) {
      nodejs.fsSync.mkdirSync(aigneDir, { recursive: true });
    }

    const envs = parse(await nodejs.fs.readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));

    await nodejs.fs.writeFile(
      AIGNE_ENV_FILE,
      stringify({
        ...envs,
        [host]: {
          AIGNE_HUB_API_KEY: accessKeyOptions.apiKey,
          AIGNE_HUB_API_URL: accessKeyOptions.url,
        },
        default: {
          AIGNE_HUB_API_URL: accessKeyOptions.url,
        },
      }),
    );

    return accessKeyOptions;
  } catch (error) {
    logger.error("Failed to connect to AIGNE Hub", error.message);
    return { apiKey: undefined, url: undefined };
  }
}

export const checkConnectionStatus = async (host: string) => {
  // aigne-hub access token
  if (!nodejs.fsSync.existsSync(AIGNE_ENV_FILE)) {
    throw new Error("AIGNE_HUB_API_KEY file not found, need to login first");
  }

  const data = await nodejs.fs.readFile(AIGNE_ENV_FILE, "utf8");
  if (!data.includes("AIGNE_HUB_API_KEY")) {
    throw new Error("AIGNE_HUB_API_KEY key not found, need to login first");
  }

  const envs = parse(data);
  if (!envs[host]) {
    throw new Error("AIGNE_HUB_API_KEY host not found, need to login first");
  }

  const env = envs[host];
  if (!env.AIGNE_HUB_API_KEY) {
    throw new Error("AIGNE_HUB_API_KEY key not found, need to login first");
  }

  try {
    // check if the url is valid
    const apiUrl = await getAIGNEHubMountPoint(env.AIGNE_HUB_API_URL);
    if (apiUrl !== env.AIGNE_HUB_API_URL) {
      envs[host].AIGNE_HUB_API_URL = apiUrl;
      envs.default.AIGNE_HUB_API_URL = apiUrl;
      await nodejs.fs.writeFile(AIGNE_ENV_FILE, stringify(envs));
    }

    return {
      apiKey: env.AIGNE_HUB_API_KEY,
      url: apiUrl,
    };
  } catch {
    return {
      apiKey: env.AIGNE_HUB_API_KEY,
      url: env.AIGNE_HUB_API_URL,
    };
  }
};

export async function loadCredential(options?: LoadCredentialOptions) {
  const isBlocklet = process.env.BLOCKLET_AIGNE_API_URL && process.env.BLOCKLET_AIGNE_API_PROVIDER;
  if (isBlocklet) return undefined;

  const aigneDir = nodejs.path.join(nodejs.os.homedir(), ".aigne");
  if (!nodejs.fsSync.existsSync(aigneDir)) {
    nodejs.fsSync.mkdirSync(aigneDir, { recursive: true });
  }

  const envs = parse(await nodejs.fs.readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
  const inquirerPrompt = (options?.inquirerPromptFn ?? inquirer.prompt) as typeof inquirer.prompt;

  const configUrl = options?.aigneHubUrl || process.env.AIGNE_HUB_API_URL;
  const AIGNE_HUB_URL = configUrl || envs?.default?.AIGNE_HUB_API_URL || DEFAULT_AIGNE_HUB_URL;
  const connectUrl = joinURL(new URL(AIGNE_HUB_URL).origin, WELLKNOWN_SERVICE_PATH_PREFIX);
  const { host } = new URL(AIGNE_HUB_URL);

  const modelName = options?.model || "";
  const isAIGNEHubModel = (modelName.toLocaleLowerCase() || "").includes(AGENT_HUB_PROVIDER);

  let credential: { apiKey?: string; url?: string } = {};

  if (isAIGNEHubModel) {
    try {
      credential = await checkConnectionStatus(host);
    } catch (error) {
      if (error instanceof Error && error.message.includes("login first")) {
        let aigneHubUrl = connectUrl;

        if (!configUrl) {
          const { subscribe } = await inquirerPrompt({
            type: "list",
            name: "subscribe",
            message:
              "No LLM API Keys or AIGNE Hub connections found. How would you like to proceed?",
            choices: [
              {
                name: "Connect to the Arcblock official AIGNE Hub (recommended, free credits for new users)",
                value: "official",
              },
              connectUrl.includes(DEFAULT_AIGNE_HUB_URL)
                ? {
                    name: "Connect to your own AIGNE Hub instance (self-hosted)",
                    value: "custom",
                  }
                : null,
              {
                name: "Exit and configure my own LLM API Keys",
                value: "manual",
              },
            ].filter(Boolean) as { name: string; value: string }[],
            default: "official",
          });

          if (subscribe === "custom") {
            const { customUrl } = await inquirerPrompt({
              type: "input",
              name: "customUrl",
              message: "Enter the URL of your AIGNE Hub:",
              validate(input) {
                try {
                  const url = new URL(input);
                  return url.protocol.startsWith("http")
                    ? true
                    : "Must be a valid URL with http or https";
                } catch {
                  return "Invalid URL";
                }
              },
            });
            aigneHubUrl = customUrl;
          } else if (subscribe === "manual") {
            console.log("You chose to configure your own LLM API Keys. Exiting...");
            process.exit(0);
          }
        }

        credential = await connectToAIGNEHub(aigneHubUrl);
      } else {
        throw error;
      }
    }
  }

  return credential;
}
