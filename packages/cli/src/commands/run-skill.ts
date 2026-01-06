import { basename, resolve } from "node:path";
import { AFSHistory } from "@aigne/afs-history";
import { LocalFS } from "@aigne/afs-local-fs";
import AgentSkillManager from "@aigne/agent-library/agent-skill-manager";
import AskUserQuestion from "@aigne/agent-library/ask-user-question";
import BashAgent from "@aigne/agent-library/bash";
import { AIGNE, FunctionAgent } from "@aigne/core";
import type { CommandModule } from "yargs";
import { z } from "zod";
import { loadChatModel } from "../utils/aigne-hub/model.js";
import { type AgentRunCommonOptions, withAgentInputSchema } from "../utils/yargs.js";
import { invokeAgent } from "./app/agent.js";

export function createRunSkillCommand(): CommandModule<
  unknown,
  { skill?: string[]; interactive?: boolean } & AgentRunCommonOptions
> {
  return {
    command: ["run-skill"],
    describe: "Run Agent Skill for the specified path",
    builder: async (yargs) => {
      return withAgentInputSchema(
        yargs
          .option("skill", {
            array: true,
            type: "string",
            describe: "Path to the Agent Skill directory",
          })
          .option("interactive", {
            describe: "Run in interactive chat mode",
            type: "boolean",
            default: false,
            alias: ["chat"],
          })
          .demandOption("skill"),
        {
          inputSchema: z.object({
            message: z.string(),
          }),
          optionalInputs: ["message"],
        },
      );
    },
    handler: async (options) => {
      if (!Array.isArray(options.skill) || options.skill.length === 0) {
        throw new Error("At least one skill path must be provided.");
      }

      const model = await loadChatModel({
        model: options.model || "aignehub/anthropic/claude-sonnet-4-5",
      });

      const aigne = new AIGNE({ model });

      const agent = new AgentSkillManager({
        inputKey: "message",
        taskRenderMode: "collapse",
        skills: [
          new BashAgent({
            description: `\
Execute bash scripts and return stdout and stderr output.

When to use:
- Running system commands (git, curl, etc.)
- Executing build tools (npm, pip, make, etc.)
- Running code scripts (python, node, etc.)

Important:
- Do NOT use bash for file operations. Use AFS tools instead (afs_list, afs_read, afs_write, afs_edit, afs_search).
- Do NOT use 'cd'. The working directory is already set to workspace. Use relative paths directly.
- Do NOT use 'npm i -g' or 'pip install --user'. Install dependencies locally in workspace:
  - For Node.js: Use 'npm install <pkg>' (local) or 'npx <pkg>' (one-time run without install).
  - For Python: Use 'pip install <pkg> -t .' or 'python -m venv .venv && source .venv/bin/activate && pip install <pkg>'.
`,
            sandbox: false,
            permissions: {
              defaultMode: "ask",
              guard: FunctionAgent.from(async (input, options) => {
                const confirm = options.prompts?.confirm;
                if (!confirm) throw new Error("No confirm prompt available for permission guard.");

                const approved = await confirm({ message: `Run command ${input.script}?` });

                return {
                  approved,
                };
              }),
            },
          }),
          new AskUserQuestion(),
        ],
        afs: {
          modules: [
            new AFSHistory({}),
            new LocalFS({
              name: "workspace",
              localPath: process.cwd(),
              description: `\
Current working directory. All temporary files should be written here using absolute AFS paths (e.g., /modules/workspace/temp.py).
Note: Bash is already running in this directory, so do NOT use 'cd /modules/workspace' in scripts. Use relative paths directly (e.g., python temp.py).`,
            }),
            ...options.skill.map(
              (path) =>
                new LocalFS({
                  name: basename(resolve(path)),
                  localPath: path,
                  description:
                    "Contains Agent Skills. Use 'Skill' tool to invoke skills from this module.",
                  agentSkills: true,
                }),
            ),
          ],
        },
      });

      await invokeAgent({
        aigne,
        agent,
        input: {
          ...options,
        },
      });
    },
  };
}
