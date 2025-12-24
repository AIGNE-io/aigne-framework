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
      description: `Execute files marked as executable in the Agentic File System (AFS)
- Runs executable entries (functions, agents, skills) registered at a given AFS path
- Passes arguments to the executable and returns its output
- Use this to invoke dynamic functionality stored in AFS

Usage:
- The path must be an absolute AFS path to an executable entry (e.g., "/skills/summarize", "/agents/translator")
- This is NOT a local system file path - it operates within the AFS virtual file system
- Use afs_list to discover available executables (look for entries with execute metadata)
- Arguments must be a valid JSON string matching the executable's input schema
- The executable's input/output schema can be found in its metadata`,
      ...options,
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Absolute AFS path to the executable (e.g., '/skills/summarize'). Must start with '/'",
          ),
        args: z
          .string()
          .describe(
            'JSON string of arguments matching the executable\'s input schema (e.g., \'{"text": "hello"}\')',
          ),
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
