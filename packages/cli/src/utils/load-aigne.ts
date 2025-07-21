import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { AIGNE } from "@aigne/core";
import type { LoadableModel } from "@aigne/core/loader/index.js";
import { loadModel } from "@aigne/core/loader/index.js";
import aes from "@ocap/mcrypto/lib/crypter/aes-legacy";
import axios from "axios";
import crypto from "crypto";
import inquirer from "inquirer";
import open from "open";
import pWaitFor from "p-wait-for";
import { joinURL, withQuery } from "ufo";
import { parse, stringify } from "yaml";
import { availableMemories, availableModels } from "../constants.js";
import { parseModelOption, type RunAIGNECommandOptions } from "./run-with-aigne.js";

const AES = { default: aes }.default;

export const encrypt = (m: string, s: string, i: string) =>
  AES.encrypt(m, crypto.pbkdf2Sync(i, s, 256, 32, "sha512").toString("hex"));
export const decrypt = (m: string, s: string, i: string) =>
  AES.decrypt(m, crypto.pbkdf2Sync(i, s, 256, 32, "sha512").toString("hex"));

const escapeFn = (str: string) => str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
const encodeEncryptionKey = (key: string) => escapeFn(Buffer.from(key).toString("base64"));

export interface RunOptions extends RunAIGNECommandOptions {
  path: string;
  entryAgent?: string;
  cacheDir?: string;
}

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";
const ACCESS_KEY_PREFIX = "/api/access-key";

type FetchResult = { accessKeyId: string; accessKeySecret: string };

const fetchConfigs = async ({
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
  const getSessionURL = withQuery(joinURL(connectUrl, ACCESS_KEY_PREFIX, "get-session"), {
    sessionId,
  });
  const endSessionURL = withQuery(joinURL(connectUrl, ACCESS_KEY_PREFIX, "end-session"), {
    sessionId,
  });

  const condition = async () => {
    const { data: session } = await axios({ url: getSessionURL });
    return Boolean(session.accessKeyId && session.accessKeySecret);
  };

  await pWaitFor(condition, { interval: fetchInterval, timeout: fetchTimeout });

  const { data: session } = await axios({ url: getSessionURL });
  await axios({ url: endSessionURL, method: "DELETE" });

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

async function createConnect({
  connectUrl,
  openPage,
  fetchInterval = 3 * 1000,
  retry = 1500,
  source = "Blocklet CLI",
  connectAction = "connect-cli",
  wrapSpinner = baseWrapSpinner,
  closeOnSuccess,
  prettyUrl,
  intervalFetchConfig,
}: CreateConnectOptions) {
  try {
    const startSessionURL = joinURL(connectUrl, ACCESS_KEY_PREFIX, "start-session");
    const { data: session } = await axios({ url: startSessionURL, method: "POST" });
    const token = session.id;

    const pageUrl = withQuery(joinURL(connectUrl, connectAction), {
      __token__: encodeEncryptionKey(token),
      source,
      closeOnSuccess,
      cli: true,
      appName: "@aigne/cli",
    });

    // eslint-disable-next-line no-console
    console.info(
      "If browser does not open automatically, please open the following link in your browser: ",
      prettyUrl?.(pageUrl) || pageUrl,
    );

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
const DEFAULT_URL = "https://www.aikit.rocks/ai-kit/";

const formatModelName = async (
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
  if (!m) {
    if (!m) throw new Error(`Unsupported model: ${provider} ${name}`);
  }

  if (m.apiKeyEnvName && process.env[m.apiKeyEnvName]) {
    return model;
  }

  const result = await inquirerPrompt({
    type: "list",
    name: "useAigneHub",
    message: `The API key for ${provider}/${name} is not configured. Please select how you want to proceed:`,
    choices: [
      { name: `Use AIGNE Hub for ${provider}/${name} (free credits available)`, value: true },
      {
        name: `Continue with ${provider}/${name} (you need to set the API_KEY manually)`,
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
  const AIGNE_ENV_FILE = join(homedir(), ".aigne", ".env");
  const AIGNE_HUB_URL = process.env.AIGNE_HUB_BASE_URL || DEFAULT_URL;
  const connectUrl = joinURL(new URL(AIGNE_HUB_URL).origin, WELLKNOWN_SERVICE_PATH_PREFIX);
  const inquirerPrompt = (checkAuthorizeOptions?.inquirerPromptFn ??
    inquirer.prompt) as typeof inquirer.prompt;

  let accessKeyOptions: { accessKey?: string; url?: string } = {};
  const modelName = await formatModelName(models, options?.model || "", inquirerPrompt);

  if ((modelName.toLocaleLowerCase() || "").includes(AGENT_HUB_PROVIDER)) {
    try {
      // 检查 aigne-hub access token
      if (!existsSync(AIGNE_ENV_FILE)) {
        throw new Error("AIGNE_HUB_API_KEY is not set, need to login first");
      }

      const data = await readFile(AIGNE_ENV_FILE, "utf8");
      if (!data.includes("AIGNE_HUB_API_KEY")) {
        throw new Error("AIGNE_HUB_API_KEY is not set, need to login first");
      }

      const env = parse(data);
      if (!env.AIGNE_HUB_API_KEY) {
        throw new Error("AIGNE_HUB_API_KEY is not set, need to login first");
      }

      // 检查 accessKey 是否有效?
      // try {
      //   const result = await fetch(joinURL(connectUrl, ACCESS_KEY_PREFIX, "health"), {
      //     headers: { Authorization: `Bearer ${env.AIGNE_HUB_API_KEY}` },
      //   });

      //   if (result.status === 401) {
      //     throw new Error("AIGNE_HUB_API_KEY is not valid, need to login first");
      //   }

      //   await result.json();
      // } catch (error) {
      //   console.error(error);

      //   if (
      //     error instanceof Error &&
      //     (error.message?.toLowerCase() || "").includes("unauthorized")
      //   ) {
      //     throw new Error("AIGNE_HUB_API_KEY is not valid, need to login first");
      //   }

      //   throw error;
      // }

      accessKeyOptions = {
        accessKey: env.AIGNE_HUB_API_KEY,
        url: joinURL(env.AIGNE_HUB_BASE_URL ?? AIGNE_HUB_URL),
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("login first")) {
        // 如果没有或者无效，让用户跳转
        const subscribePrompt = await inquirerPrompt({
          type: "list",
          name: "subscribe",
          message:
            "You don't have an AIGNE Hub connect yet. Please select the operation you want to perform：",
          choices: [
            {
              name: "Go to connect to use the AIGNE Hub, You will get some free credits",
              value: true,
            },
            { name: "exit", value: false },
          ],
          default: true,
        });

        if (!subscribePrompt.subscribe) {
          console.warn("The AIGNE Hub connection has been cancelled");
          process.exit(0);
        }

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
            url: joinURL(AIGNE_HUB_URL),
          };

          // 跳转完成写入 aigne-hub access token
          await writeFile(
            AIGNE_ENV_FILE,
            stringify({
              AIGNE_HUB_API_KEY: result.accessKeySecret,
              AIGNE_HUB_BASE_URL: AIGNE_HUB_URL,
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
