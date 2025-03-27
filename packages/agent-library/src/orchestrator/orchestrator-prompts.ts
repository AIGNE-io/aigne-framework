import type { Agent, Message } from "@aigne/core";
import { ensureZodUnionArray } from "@aigne/core/utils/json-schema.js";
import { groupBy, pickBy } from "lodash-es";
import { z } from "zod";

export const SYNTHESIZE_PLAN_USER_PROMPT_TEMPLATE = `\
Synthesize the results of executing all steps in the plan into a cohesive result
`;

export function getFullPlanSchema(agents: Agent[]) {
  const agentNames = agents.map((i) => i.name);
  if (new Set(agentNames).size !== agentNames.length) {
    const duplicates = pickBy(groupBy(agentNames), (x) => x.length > 1);
    throw new Error(
      `Tools name must be unique for orchestrator: ${Object.keys(duplicates).join(",")}`,
    );
  }

  const TaskSchema = z.object({
    description: z.string().describe("Detailed description of the task"),
    agent: z
      .union(ensureZodUnionArray(agents.map((i) => z.literal(i.name))))
      .describe("Name of the agent to execute the task"),
  });

  const StepSchema = z.object({
    description: z.string().describe("Detailed description of the step"),
    tasks: z.array(TaskSchema).describe("Tasks that can run in parallel in this step"),
  });

  return z.object({
    steps: z.array(StepSchema).describe("All sequential steps in the plan"),
    isComplete: z.boolean().describe("Whether the previous plan results achieve the objective"),
  });
}

export type FullPlanOutput = z.infer<ReturnType<typeof getFullPlanSchema>>;

export type Step = FullPlanOutput["steps"][number];

export type Task = Step["tasks"][number];

export interface StepWithResult {
  step: Step;
  tasks: Array<TaskWithResult>;
  result: string;
}

export interface TaskWithResult {
  task: Task;
  result: string;
}

export interface FullPlanInput extends Message {
  objective: string;
  steps: StepWithResult[];
  plan: {
    status: string;
    result: string;
  };
  agents: {
    name: string;
    description?: string;
    tools: {
      name: string;
      description?: string;
    }[];
  }[];
}

export const FULL_PLAN_PROMPT_TEMPLATE = `You are tasked with orchestrating a plan to complete an objective.
You can analyze results from the previous steps already executed to decide if the objective is complete.
Your plan must be structured in sequential steps, with each step containing independent parallel subtasks.

<objective>
{{objective}}
</objective>

<steps_completed>
{{#steps}}
- Step: {{step.description}}
  Result: {{result}}
{{/steps}}
</steps_completed>

<previous_plan_status>
{{plan.status}}
</previous_plan_status>

<previous_plan_result>
{{plan.result}}
</previous_plan_result>

You have access to the following Agents(which are collections of tools/functions):

<agents>
{{#agents}}
- Agent: {{name}}
  Description: {{description}}
  Functions:
    {{#tools}}
    - Tool: {{name}}
      Description: {{description}}
    {{/tools}}
{{/agents}}
</agents>

- If the previous plan results achieve the objective, return isComplete=true.
- Otherwise, generate remaining steps needed.
- Generate a plan with all remaining steps needed.
- Steps are sequential, but each Step can have parallel subtasks.
- For each Step, specify a description of the step and independent subtasks that can run in parallel.
- For each subtask specify:
    1. Clear description of the task that an LLM can execute
    2. Name of 1 Agent to use for the task`;

export interface TaskPromptInput extends Message {
  objective: string;
  step: Step;
  task: Task;
  steps: StepWithResult[];
}

export const TASK_PROMPT_TEMPLATE = `\
You are part of a larger workflow to achieve the step then the objective:

<objective>
{{objective}}
</objective>

<step>
{{step.description}}
</step>

Your job is to accomplish only the following task:

<task>
{{task.description}}
</task>

Results so far that may provide helpful context:

<steps_completed>
{{#steps}}
- Step: {{step.description}}
  Result: {{result}}
{{/steps}}
</steps_completed>
`;

export interface SynthesizeStepPromptInput extends Message {
  objective: string;
  step: Step;
  tasks: TaskWithResult[];
}

export const SYNTHESIZE_STEP_PROMPT_TEMPLATE = `\
Synthesize the results of these parallel tasks into a cohesive result

<objective>
{{objective}}
</objective>

<step>
{{step.description}}
</step>

<tasks>
{{#tasks}}
- Task: {{task.description}}
  Result: {{result}}
{{/tasks}}
</tasks>
`;
