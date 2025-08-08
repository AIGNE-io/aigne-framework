import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";
const ACCESS_KEY_PREFIX = "/api/access-key";
const ACCESS_KEY_SESSION_API = `${ACCESS_KEY_PREFIX}/session`;

const AIGNE_HUB_DID = "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ";
const AGENT_HUB_PROVIDER = "aignehub";
const AIGNE_HUB_URL = "https://hub.aigne.io/";
const DEFAULT_AIGNE_HUB_MODEL = "openai/gpt-4o";
const DEFAULT_AIGNE_HUB_PROVIDER_MODEL = `${AGENT_HUB_PROVIDER}:${DEFAULT_AIGNE_HUB_MODEL}`;
const DEFAULT_MODEL_PROVIDER = "openai";

const IsTest = process.env.CI || process.env.NODE_ENV === "test";
const TEST_AIGNE_ENV_FILE = nodejs.path.join(
  nodejs.os.homedir(),
  ".aigne",
  "test-aigne-hub-connected.yaml",
);
const PROD_AIGNE_ENV_FILE = nodejs.path.join(
  nodejs.os.homedir(),
  ".aigne",
  "aigne-hub-connected.yaml",
);
const AIGNE_ENV_FILE = IsTest ? TEST_AIGNE_ENV_FILE : PROD_AIGNE_ENV_FILE;

export {
  DEFAULT_AIGNE_HUB_PROVIDER_MODEL,
  DEFAULT_MODEL_PROVIDER,
  AIGNE_HUB_DID,
  AIGNE_HUB_URL,
  IsTest,
  WELLKNOWN_SERVICE_PATH_PREFIX,
  ACCESS_KEY_PREFIX,
  ACCESS_KEY_SESSION_API,
  AGENT_HUB_PROVIDER,
  TEST_AIGNE_ENV_FILE,
  PROD_AIGNE_ENV_FILE,
  AIGNE_ENV_FILE,
};
