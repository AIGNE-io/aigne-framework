import assert from "node:assert";
import { type Agent, AIGNE, type Message } from "@aigne/core";
import { zodToJsonSchema } from "zod-to-json-schema";
import { loadAIGNE } from "../load-aigne.js";
import { runAgentWithAIGNE } from "../run-with-aigne.js";
import { type AgentRunCommonOptions, parseAgentInput } from "../yargs.js";

const METHODS: { [method: string]: (...args: any[]) => Promise<any> } = {
  loadAIGNE: loadAIGNEInChildProcess,
  invokeCLIAgentFromDir: invokeCLIAgentFromDirInChildProcess,
};

process.on("message", async ({ method, args }: { method: string; args: any[] }) => {
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
    await send({ method, error: { message: error.message } });
  } finally {
    process.exit(0);
  }
});

export interface AgentInChildProcess extends Pick<Agent, "name" | "description" | "alias"> {
  inputSchema: object;
  outputSchema: object;
}

function serializeAgent(agent: Agent): AgentInChildProcess {
  return {
    name: agent.name,
    description: agent.description,
    alias: agent.alias,
    inputSchema: zodToJsonSchema(agent.inputSchema),
    outputSchema: zodToJsonSchema(agent.outputSchema),
  };
}

export async function loadAIGNEInChildProcess(...args: Parameters<typeof AIGNE.load>): Promise<{
  agents?: AgentInChildProcess[];
  cli?: { chat?: AgentInChildProcess; agents?: AgentInChildProcess[] };
  mcpServer?: { agents?: AgentInChildProcess[] };
}> {
  const aigne = await AIGNE.load(...args);
  return {
    agents: aigne.agents.map(serializeAgent),
    cli: {
      chat: aigne.cli.chat ? serializeAgent(aigne.cli.chat) : undefined,
      agents: aigne.cli.agents.map(serializeAgent),
    },
    mcpServer: {
      agents: aigne.mcpServer.agents.map(serializeAgent),
    },
  };
}

export async function invokeCLIAgentFromDirInChildProcess(options: {
  dir: string;
  agent: string;
  input: Message & AgentRunCommonOptions;
}) {
  const aigne = await loadAIGNE({
    path: options.dir,
    modelOptions: options.input,
  });

  try {
    const { chat } = aigne.cli;

    const agent =
      chat && chat.name === options.agent
        ? chat
        : aigne.cli.agents[options.agent] ||
          aigne.agents[options.agent] ||
          aigne.skills[options.agent] ||
          aigne.mcpServer.agents[options.agent];
    assert(agent, `Agent ${options.agent} not found in ${options.dir}`);

    const input = await parseAgentInput(options.input, agent);

    await runAgentWithAIGNE(aigne, agent, {
      ...options.input,
      input,
      chat: agent === chat || options.input.chat,
    });
  } finally {
    await aigne.shutdown();
  }
}
