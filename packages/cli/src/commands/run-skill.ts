import { basename } from "node:path";
import { AFSHistory } from "@aigne/afs-history";
import { LocalFS } from "@aigne/afs-local-fs";
import AgentSkillManager from "@aigne/agent-library/agent-skill-manager";
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
        ],
        afs: {
          modules: [
            new AFSHistory({}),

            ...options.skill.map(
              (path) =>
                new LocalFS({
                  name: basename(path),
                  localPath: path,
                  description: `Agent Skill from local path ${path}`,
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
