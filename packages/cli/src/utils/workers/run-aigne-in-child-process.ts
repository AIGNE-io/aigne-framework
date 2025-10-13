import { fork } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Agent } from "@aigne/core";
import type { AIGNECLIAgent } from "@aigne/core/aigne/type.js";
import { logger } from "@aigne/core/utils/logger.js";
import type { JsonSchema } from "@aigne/json-schema-to-zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type {
  invokeCLIAgentFromDirInChildProcess,
  loadAIGNEInChildProcess,
} from "./run-aigne-in-child-process-worker.js";

export type LoadAIGNEInChildProcessResult = Awaited<ReturnType<typeof loadAIGNEInChildProcess>>;

export interface AgentInChildProcess extends Pick<Agent, "name" | "description" | "alias"> {
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}

export interface CLIAgentInChildProcess extends Omit<AIGNECLIAgent, "agent" | "agents"> {
  agent?: AgentInChildProcess;
  agents?: CLIAgentInChildProcess[];
}

export function serializeAgent(agent: Agent): AgentInChildProcess {
  return {
    name: agent.name,
    description: agent.description,
    alias: agent.alias,
    inputSchema: zodToJsonSchema(agent.inputSchema) as JsonSchema,
    outputSchema: zodToJsonSchema(agent.outputSchema) as JsonSchema,
  };
}

export interface ChildProcessAIGNEMethods {
  loadAIGNE: typeof loadAIGNEInChildProcess;
  invokeCLIAgentFromDir: typeof invokeCLIAgentFromDirInChildProcess;
}

export async function runAIGNEInChildProcess<M extends keyof ChildProcessAIGNEMethods>(
  method: M,
  ...args: Parameters<ChildProcessAIGNEMethods[M]>
): Promise<ReturnType<ChildProcessAIGNEMethods[M]>> {
  return await new Promise<ReturnType<ChildProcessAIGNEMethods[M]>>((resolve, reject) => {
    let completed = false;

    const child = fork(
      join(dirname(fileURLToPath(import.meta.url)), "./run-aigne-in-child-process-worker.js"),
    );

    child.on(
      "message",
      (event: { method: string; error?: { name: string; message: string }; result?: unknown }) => {
        if (event.method !== method) {
          reject(new Error(`Unknown method: ${event.method} expected: ${method}`));
        } else if (event.error) {
          const e = new Error(event.error.message);
          e.name = event.error.name;
          reject(e);
        } else {
          resolve(event.result as ReturnType<ChildProcessAIGNEMethods[M]>);
        }

        completed = true;
      },
    );

    child.on("exit", (code) => {
      if (!completed) process.exit(code);

      reject(new Error(`Child process exited with code ${code}`));
    });

    child.send({ method, args, logLevel: logger.level });
  });
}
