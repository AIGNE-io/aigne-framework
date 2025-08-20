import { homedir } from "node:os";
import { join } from "node:path";

const ACCESS_KEY_PREFIX = "/api/access-key";
export const WELLKNOWN_SERVICE_PATH_PREFIX = "/.well-known/service";
export const ACCESS_KEY_SESSION_API = `${ACCESS_KEY_PREFIX}/session`;

const DEFAULT_AIGNE_HUB_MODEL = "openai/gpt-5-mini";
export const AIGNE_HUB_PROVIDER = "aignehub";
export const DEFAULT_AIGNE_HUB_PROVIDER_MODEL = `${AIGNE_HUB_PROVIDER}:${DEFAULT_AIGNE_HUB_MODEL}`;

export const isTest = process.env.CI || process.env.NODE_ENV === "test";
const TEST_AIGNE_ENV_FILE = join(homedir(), ".aigne", "test-aigne-hub-connected.yaml");
const PROD_AIGNE_ENV_FILE = join(homedir(), ".aigne", "aigne-hub-connected.yaml");
export const AIGNE_ENV_FILE = isTest ? TEST_AIGNE_ENV_FILE : PROD_AIGNE_ENV_FILE;
