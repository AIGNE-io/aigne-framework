import { createRequire } from "node:module";
import { AgenticMemory } from "@aigne/agentic-memory";
import { DefaultMemory } from "@aigne/default-memory";

const require = createRequire(import.meta.url);

export const AIGNE_CLI_VERSION = require("../package.json").version;

export const availableMemories = [DefaultMemory, AgenticMemory];
