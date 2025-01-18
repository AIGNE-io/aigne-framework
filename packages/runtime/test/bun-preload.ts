import "core-js";
import "reflect-metadata";

import { mock } from "bun:test";

mock.module("@aigne/agent-v1", () => ({
  AgentV1: class {
    constructor() {
      throw new Error("Method not implemented.");
    }
  },
  agentV1ToRunnableDefinition: () => {
    throw new Error("Method not implemented.");
  },
  getAdapter() {
    throw new Error("Method not implemented.");
  },
}));
