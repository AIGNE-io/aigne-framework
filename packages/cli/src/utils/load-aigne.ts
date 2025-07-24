import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { AIGNE } from "@aigne/core";
import type { LoadableModel } from "@aigne/core/loader/index.js";
import { loadModel } from "@aigne/core/loader/index.js";
import { AesCrypter } from "@ocap/mcrypto/lib/crypter/aes-legacy.js";
import crypto from "crypto";
import inquirer from "inquirer";
import open from "open";
import pWaitFor from "p-wait-for";
import { joinURL, withQuery } from "ufo";
import { parse, stringify } from "yaml";
import { availableMemories, availableModels } from "../constants.js";
import { parseModelOption, type RunAIGNECommandOptions } from "./run-with-aigne.js";

const aes = new AesCrypter();
export const decrypt = (m: string, s: string, i: string) =>
  aes.decrypt(m, crypto.pbkdf2Sync(i, s, 256, 32, "sha512").toString("hex"));
export const encrypt = (m: string, s: string, i: string) =>
  aes.encrypt(m, crypto.pbkdf2Sync(i, s, 256, 32, "sha512").toString("hex"));

const escapeFn = (str: string) => str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
const unescapeFn = (str: string) =>
  (str + "===".slice((str.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/");
export const encodeEncryptionKey = (key: string) => escapeFn(Buffer.from(key).toString("base64"));
export const decodeEncryptionKey = (str: string) =>
  new Uint8Array(Buffer.from(unescapeFn(str), "base64"));

const request = async (config: { url: string; method?: string; requestCount?: number }) => {
  const headers: Record<string, string> = {};
  if (config.requestCount !== undefined) {
    headers["X-Request-Count"] = config.requestCount.toString();
  }

  const response = await fetch(config.url, {
    method: config.method || "GET",
    headers,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  return { data };
};

export interface RunOptions extends RunAIGNECommandOptions {
  path: string;
  entryAgent?: string;
  cacheDir?: string;
}

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";
const ACCESS_KEY_PREFIX = "/api/access-key";
const ACCESS_KEY_SESSION_API = `${ACCESS_KEY_PREFIX}/session`;

type FetchResult = { accessKeyId: string; accessKeySecret: string };

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

interface CreateConnectOptions {
  connectUrl: string;
  openPage?: (url: string) => void;
  fetchInterval?: number;
  retry?: number;
  source?: string;
  connectAction?: string;
  wrapSpinner?: typeof baseWrapSpinner;
  prettyUrl?: (url: string) => string;
  closeOnSuccess?: boolean;
  intervalFetchConfig?: (options: {
    sessionId: string;
    fetchInterval: number;
    fetchTimeout: number;
  }) => Promise<FetchResult>;
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
}: CreateConnectOptions) {
  try {
    const startSessionURL = joinURL(connectUrl, ACCESS_KEY_SESSION_API);
    const { data: session } = await request({ url: startSessionURL, method: "POST" });
    const token = session.id;

    const pageUrl = withQuery(joinURL(connectUrl, connectAction), {
      __token__: encodeEncryptionKey(token),
      source,
      closeOnSuccess,
      cli: true,
      appName: " AIGNE CLI",
      appLogo: "https://www.aigne.io/favicon.ico?imageFilter=resize&w=32",
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
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const AGENT_HUB_PROVIDER = "aignehub";
const DEFAULT_AIGNE_HUB_MODEL = "openai/gpt-4o";
const DEFAULT_AIGNE_HUB_PROVIDER_MODEL = `${AGENT_HUB_PROVIDER}:${DEFAULT_AIGNE_HUB_MODEL}`;
const DEFAULT_URL = "https://hub.aigne.io/";

export const formatModelName = async (
  models: LoadableModel[],
  model: string,
  inquirerPrompt: typeof inquirer.prompt,
) => {
  if (!model) return DEFAULT_AIGNE_HUB_PROVIDER_MODEL;

  const { provider, name } = parseModelOption(model);
  if (!provider || !name) {
    return DEFAULT_AIGNE_HUB_PROVIDER_MODEL;
  }

  const providerName = provider.replace(/-/g, "");
  if (providerName.includes(AGENT_HUB_PROVIDER)) {
    return model;
  }

  const m = models.find((m) => m.name.toLowerCase().includes(providerName.toLowerCase()));
  if (!m) throw new Error(`Unsupported model: ${provider} ${name}`);

  if (m.apiKeyEnvName && process.env[m.apiKeyEnvName]) {
    return model;
  }

  if (process.env.CI || process.env.NODE_ENV === "test") return model;

  const result = await inquirerPrompt({
    type: "list",
    name: "useAigneHub",
    message: `Seems no API Key configured for ${provider}/${name}, select your preferred way to continue:`,
    choices: [
      {
        name: `Connect to AIGNE Hub to use ${name} (Recommended since free credits available)`,
        value: true,
      },
      {
        name: `Exit and bring my owner API Key by set ${m.apiKeyEnvName}`,
        value: false,
      },
    ],
    default: true,
  });

  if (!result.useAigneHub) return model;

  return `${AGENT_HUB_PROVIDER}:${provider}/${name}`;
};

export async function loadAIGNE(
  path: string,
  options?: RunOptions,
  checkAuthorizeOptions?: {
    inquirerPromptFn?: (prompt: {
      type: string;
      name: string;
      message: string;
      choices: { name: string; value: any }[];
      default: any;
    }) => Promise<any>;
  },
) {
  const models = availableModels();
  const AIGNE_ENV_FILE = join(homedir(), ".aigne", "aigne-hub-connected.yaml");
  const AIGNE_HUB_URL = process.env.AIGNE_HUB_API_URL || DEFAULT_URL;
  const connectUrl = joinURL(new URL(AIGNE_HUB_URL).origin, WELLKNOWN_SERVICE_PATH_PREFIX);
  const inquirerPrompt = (checkAuthorizeOptions?.inquirerPromptFn ??
    inquirer.prompt) as typeof inquirer.prompt;

  let accessKeyOptions: { accessKey?: string; url?: string } = {};
  const modelName = await formatModelName(models, options?.model || "", inquirerPrompt);

  if (process.env.CI || process.env.NODE_ENV === "test") {
    const model = await loadModel(models, parseModelOption(modelName), undefined, accessKeyOptions);
    return await AIGNE.load(path, { models, memories: availableMemories, model });
  }

  if ((modelName.toLocaleLowerCase() || "").includes(AGENT_HUB_PROVIDER)) {
    const { origin, host } = new URL(AIGNE_HUB_URL);

    try {
      // aigne-hub access token
      if (!existsSync(AIGNE_ENV_FILE)) {
        throw new Error("AIGNE_HUB_API_KEY file not found, need to login first");
      }

      const data = await readFile(AIGNE_ENV_FILE, "utf8");
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

      accessKeyOptions = {
        accessKey: env.AIGNE_HUB_API_KEY,
        url: joinURL(env.AIGNE_HUB_API_URL),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("login first")) {
        // If none or invalid, prompt the user to proceed
        const subscribePrompt = await inquirerPrompt({
          type: "list",
          name: "subscribe",
          message:
            "No LLM API Keys or AIGNE Hub connections found, select your preferred way to continue:",
          choices: [
            {
              name: "Connect to AIGNE Hub with just a few clicks, free credits eligible for new users (Recommended)",
              value: true,
            },
            { name: "Exit and configure my own LLM API Keys", value: false },
          ],
          default: true,
        });

        if (!subscribePrompt.subscribe) {
          console.warn("The AIGNE Hub connection has been cancelled");
          process.exit(0);
        }

        const BLOCKLET_JSON_PATH = "__blocklet__.js?type=json";
        const blockletInfo = await fetch(joinURL(origin, BLOCKLET_JSON_PATH));
        const blocklet = await blockletInfo.json();
        const aigneHubMount = (blocklet?.componentMountPoints || []).find(
          (m: { did: string }) => m.did === "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ",
        );

        try {
          const result = await createConnect({
            connectUrl: connectUrl,
            connectAction: "gen-simple-access-key",
            source: `@aigne/cli connect to AIGNE hub`,
            closeOnSuccess: true,
            openPage: (pageUrl) => open(pageUrl),
          });

          accessKeyOptions = {
            accessKey: result.accessKeySecret,
            url: joinURL(origin, aigneHubMount?.mountPoint || ""),
          };

          // After redirection, write the AIGNE Hub access token
          const aigneDir = join(homedir(), ".aigne");
          if (!existsSync(aigneDir)) {
            mkdirSync(aigneDir, { recursive: true });
          }

          await writeFile(
            AIGNE_ENV_FILE,
            stringify({
              [host]: {
                AIGNE_HUB_API_KEY: accessKeyOptions.accessKey,
                AIGNE_HUB_API_URL: accessKeyOptions.url,
              },
            }),
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
  const model = await loadModel(models, parseModelOption(modelName), undefined, accessKeyOptions);
  return await AIGNE.load(path, { models, memories: availableMemories, model });
}
