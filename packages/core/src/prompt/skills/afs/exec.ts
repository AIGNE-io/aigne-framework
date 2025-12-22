import { z } from "zod";
import type { AgentInvokeOptions, AgentOptions, Message } from "../../../agents/agent.js";
import { AFSSkillBase } from "./base.js";

export interface AFSExecInput extends Message {
  path: string;
  args: string;
}

export interface AFSExecOutput extends Message {
  data: Record<string, any>;
}

export interface AFSExecAgentOptions extends AgentOptions<AFSExecInput, AFSExecOutput> {
  afs: NonNullable<AgentOptions<AFSExecInput, AFSExecOutput>["afs"]>;
}

export class AFSExecAgent extends AFSSkillBase<AFSExecInput, AFSExecOutput> {
  constructor(options: AFSExecAgentOptions) {
    super({
      name: "afs_exec",
      description: `
Execute files marked as executable in the Agentic File System (AFS).
Use this to run executable files registered at a given path with specified arguments.
      `.trim(),
      ...options,
      inputSchema: z.object({
        path: z.string().describe("Absolute path to the executable file in AFS"),
        args: z.string().describe("JSON string of arguments matching the function's input schema"),
      }),
      outputSchema: z.object({
        data: z.record(z.any()),
      }),
    });
  }

  async process(input: AFSExecInput, options: AgentInvokeOptions): Promise<AFSExecOutput> {
    if (!this.afs) throw new Error("AFS is not configured for this agent.");

    return {
      ...(await this.afs.exec(input.path, JSON.parse(input.args), options)),
    };
  }
}
