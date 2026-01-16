import { createRequire } from "node:module";
import { AgenticMemory } from "@aigne/agentic-memory";
import { DefaultMemory } from "@aigne/default-memory";

const require = createRequire(import.meta.url);

export const AIGNE_CLI_VERSION = require("../package.json").version;

export const availableMemories = [DefaultMemory, AgenticMemory];

export const AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE = "NOT_ENOUGH";

export const CHAT_MODEL_OPTIONS = [
  "aigneHubUrl",
  "model",
  "temperature",
  "topP",
  "frequencyPenalty",
  "presencePenalty",
  "parallelToolCalls",
  "modalities",
  "preferInputFileType",
  "reasoningEffort",
];

export const DEFAULT_USER_ID = "cli-user";

export const DEFAULT_AFS_EXPLORER_PORT = 9670;
