import { z } from "zod";
import { Agent, type AgentOptions, type Message } from "../../../../agents/agent.js";
import type { Skill } from "./skill-loader.js";

export interface SkillToolInput extends Message {
  skill: string;
  args?: string;
}

const skillToolInputSchema = z.object({
  skill: z.string().describe("The name of the skill agent to invoke."),
  args: z.string().optional().describe("The arguments to pass to the skill."),
});

export interface SkillToolOutput extends Message {
  result: string;
}

export interface SkillToolOptions extends AgentOptions<SkillToolInput, SkillToolOutput> {
  agentSkills: Skill[];
}

export class AgentSkill extends Agent<SkillToolInput, SkillToolOutput> {
  constructor(options: SkillToolOptions) {
    super({
      name: "Skill",
      taskTitle: "Invoke {{skill}}: {{args}}",
      ...options,
      description: `\
Execute a skill within the main conversation

<skills_instructions>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

When users ask you to run a "slash command" or reference "/" (e.g., "/commit", "/review-pr"), they are referring to a skill. Use this tool to invoke the corresponding skill.

User: "run /commit" Assistant: [Calls Skill tool with skill: "commit"]
How to invoke:

Use this tool with the skill name and optional arguments

Important:

When a skill is relevant, you must invoke this tool IMMEDIATELY as your first action
NEVER just announce or mention a skill in your text response without actually calling this tool
This is a BLOCKING REQUIREMENT: invoke the relevant Skill tool BEFORE generating any other response about the task
Only use skills listed in <available_skills> below
Do not invoke a skill that is already running
Do not use this tool for built-in CLI commands (like /help, /clear, etc.)
</skills_instructions>

<available_skills>
${options.agentSkills.map((s) => `${s.name}: ${s.description}`).join("\n\n")}
</available_skills>
`,
      inputSchema: skillToolInputSchema,
    });

    this.agentSkills = options.agentSkills;
  }

  private agentSkills: Skill[];

  override async process(input: SkillToolInput): Promise<SkillToolOutput> {
    const skill = this.agentSkills.find((s) => s.name === input.skill);
    if (!skill) throw new Error(`Skill not found: ${input.skill}`);

    return {
      result: `\
Base directory for this skill: ${skill.path}

${skill.content}

${input.args ? `ARGUMENTS: ${input.args ?? "None"}` : ""}
`,
    };
  }
}
