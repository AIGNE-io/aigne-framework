import assert from "node:assert";
import type { Agent, Message } from "@aigne/core";
import type { AIGNEMetadata } from "@aigne/core/aigne/type.js";
import { findCliAgent, mapCliAgent } from "@aigne/core/utils/agent-utils.js";
import { type LogLevel, logger } from "@aigne/core/utils/logger.js";
import { loadAIGNE } from "../load-aigne.js";
import { runAgentWithAIGNE } from "../run-with-aigne.js";
import { type AgentRunCommonOptions, parseAgentInput } from "../yargs.js";
import {
  type AgentInChildProcess,
  type CLIAgentInChildProcess,
  serializeAgent,
} from "./run-aigne-in-child-process.js";

const METHODS: { [method: string]: (...args: any[]) => Promise<any> } = {
  loadAIGNE: loadAIGNEInChildProcess,
  invokeCLIAgentFromDir: invokeCLIAgentFromDirInChildProcess,
};

process.on(
  "message",
  async ({ method, args, ...options }: { method: string; args: any[]; logLevel?: LogLevel }) => {
    if (options.logLevel) logger.level = options.logLevel;

    const send = (message: any) =>
      new Promise((resolve, reject) => {
        assert(process.send);
        process.send(message, undefined, undefined, (error) => {
          if (error) reject(error);
          else resolve(true);
        });
      });

    try {
      const handler = METHODS[method];
      if (!handler) throw new Error(`Unknown method: ${method}`);

      const result = await handler(...args);
      await send({ method, result });
    } catch (error) {
      await send({
        method,
        error: { name: error.name, message: error.message, stack: error.stack },
      });
    } finally {
      process.exit(0);
    }
  },
);

export async function loadAIGNEInChildProcess(options: Parameters<typeof loadAIGNE>[0]): Promise<{
  agents?: AgentInChildProcess[];
  cli?: { chat?: AgentInChildProcess; agents?: CLIAgentInChildProcess[] };
  mcpServer?: { agents?: AgentInChildProcess[] };
}> {
  const aigne = await loadAIGNE(options);
  return {
    agents: aigne.agents.map(serializeAgent),
    cli: {
      chat: aigne.cli.chat ? serializeAgent(aigne.cli.chat) : undefined,
      agents: aigne.cli.agents?.map((item) => mapCliAgent(item, serializeAgent)),
    },
    mcpServer: {
      agents: aigne.mcpServer.agents.map(serializeAgent),
    },
  };
}

export async function invokeCLIAgentFromDirInChildProcess(options: {
  dir: string;
  parent?: string[];
  agent: string;
  input: Message & AgentRunCommonOptions;
  metadata?: AIGNEMetadata;
}) {
  const aigne = await loadAIGNE({
    path: options.dir,
    modelOptions: options.input,
    printTips: true,
    imageModelOptions: { model: options.input.imageModel },
    metadata: options.metadata,
  });

  try {
    const { chat } = aigne.cli;

    let agent: Agent | undefined;

    if (chat && chat.name === options.agent) {
      agent = chat;
    } else if (options.parent) {
      agent = findCliAgent(aigne.cli, options.parent, options.agent);
    } else {
      agent =
        findCliAgent(aigne.cli, [], options.agent) ||
        aigne.agents[options.agent] ||
        aigne.skills[options.agent] ||
        aigne.mcpServer.agents[options.agent];
    }
    assert(agent, `Agent ${options.agent} not found in ${options.dir}`);

    const input = await parseAgentInput(options.input, agent);

    await runAgentWithAIGNE(aigne, agent, {
      ...options.input,
      input,
      chat: options.input.chat,
    });
  } finally {
    await aigne.shutdown();
  }
}
