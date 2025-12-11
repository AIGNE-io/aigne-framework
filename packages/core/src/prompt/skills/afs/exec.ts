import { z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../../../agents/agent.js";

export interface AFSExecInput extends Message {
  path: string;
  args: string;
}

export interface AFSExecOutput extends Message {
  result: Record<string, any>;
}

export interface AFSExecAgentOptions extends AgentOptions<AFSExecInput, AFSExecOutput> {
  afs: NonNullable<AgentOptions<AFSExecInput, AFSExecOutput>["afs"]>;
}

export class AFSExecAgent extends Agent<AFSExecInput, AFSExecOutput> {
  constructor(options: AFSExecAgentOptions) {
    super({
      name: "afs_exec",
      description:
        "Execute functions or commands from AFS modules. Use when running operations provided by mounted modules.",
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute path to the executable function in AFS"),
        args: z.string().describe("JSON string of arguments matching the function's input schema"),
      }),
      outputSchema: z.object({
        result: z.record(z.any()),
      }),
    });
  }

  async process(input: AFSExecInput, options: AgentInvokeOptions): Promise<AFSExecOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    return await this.afs.exec(input.path, JSON.parse(input.args), options);
  }
}
