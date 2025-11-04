import assert from "node:assert";
import type { Agent, AIGNE, Message } from "@aigne/core";
import type { CLIAgent } from "@aigne/core/utils/agent-utils.js";
import { logger } from "@aigne/core/utils/logger.js";
import type { CommandModule } from "yargs";
import { runAgentWithAIGNE } from "../../utils/run-with-aigne.js";
import {
  type AgentRunCommonOptions,
  parseAgentInput,
  withAgentInputSchema,
} from "../../utils/yargs.js";
import { serveMCPServerFromDir } from "../serve-mcp.js";

export const serveMcpCommandModule = ({
  aigne,
  name,
}: {
  aigne: AIGNE;
  name: string;
}): CommandModule<unknown, { host: string; port?: number; pathname: string }> => ({
  command: "serve-mcp",
  describe: `Serve ${name} a MCP server (streamable http)`,
  builder: (yargs) => {
    return yargs
      .option("host", {
        describe: "Host to run the MCP server on, use 0.0.0.0 to publicly expose the server",
        type: "string",
        default: "localhost",
      })
      .option("port", {
        describe: "Port to run the MCP server on",
        type: "number",
      })
      .option("pathname", {
        describe: "Pathname to the service",
        type: "string",
        default: "/mcp",
      });
  },
  handler: async (options) => {
    await serveMCPServerFromDir({
      ...options,
      aigne,
    });
  },
});

export const agentCommandModule = ({
  aigne,
  agent,
  chat,
}: {
  aigne: AIGNE;
  agent: Agent;
  chat?: boolean;
}): CommandModule<unknown, AgentRunCommonOptions> => {
  return {
    command: agent.name,
    aliases: agent.alias || [],
    describe: agent.description || "",
    builder: async (yargs) => {
      return withAgentInputSchema(yargs, { inputSchema: agent.inputSchema });
    },
    handler: async (options) => {
      if (options.logLevel) logger.level = options.logLevel;

      await invokeAgent({
        aigne,
        agent,
        input: { ...options, chat: chat ?? options.chat },
      });
    },
  };
};

export const cliAgentCommandModule = ({
  aigne,
  cliAgent,
}: {
  aigne: AIGNE;
  cliAgent: CLIAgent<Agent>;
}): CommandModule<unknown, AgentRunCommonOptions> => {
  const { agent, agents } = cliAgent;

  const name = cliAgent.name || agent?.name;
  assert(name, "CLI agent must have a name");

  return {
    command: name,
    aliases: cliAgent.alias || agent?.alias || [],
    describe: cliAgent.description || agent?.description || "",
    builder: async (yargs) => {
      if (agent) {
        withAgentInputSchema(yargs, { inputSchema: agent.inputSchema });
      }
      if (agents?.length) {
        for (const cmd of agents) {
          yargs.command(
            cliAgentCommandModule({
              aigne,
              cliAgent: cmd,
            }),
          );
        }
      }

      if (!agent) yargs.demandCommand();

      return yargs;
    },
    handler: async (options) => {
      if (!agent) throw new Error("CLI agent is not defined");

      if (options.logLevel) logger.level = options.logLevel;

      await invokeAgent({
        aigne,
        agent,
        input: options,
      });
    },
  };
};

export async function invokeAgent(options: {
  aigne: AIGNE;
  agent: Agent;
  input: Message & AgentRunCommonOptions;
}) {
  const { agent, aigne } = options;

  try {
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
