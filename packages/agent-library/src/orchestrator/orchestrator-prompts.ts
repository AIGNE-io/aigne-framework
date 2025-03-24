import { type Agent, ensureZodUnionArray } from "@aigne/core";
import { z } from "zod";

export const TASK_RESULT_TEMPLATE = `Task: {{task_description}}
Result: {{task_result}}`;

export const STEP_RESULT_TEMPLATE = `Step: {{step_description}}
Step Subtasks:
{{tasks_str}}`;

export const PLAN_RESULT_TEMPLATE = `Plan Objective: {{plan_objective}}

Progress So Far (steps completed):
{{steps_str}}

Plan Current Status: {{plan_status}}
Plan Current Result: {{plan_result}}`;

export const FULL_PLAN_PROMPT_TEMPLATE = `You are tasked with orchestrating a plan to complete an objective.
You can analyze results from the previous steps already executed to decide if the objective is complete.
Your plan must be structured in sequential steps, with each step containing independent parallel subtasks.

Objective: {{objective}}

{{plan_result}}

If the previous results achieve the objective, return is_complete=true.
Otherwise, generate remaining steps needed.

You have access to the following Agents(which are collections of tools/functions):

Agents:
{{agents}}

Generate a plan with all remaining steps needed.
Steps are sequential, but each Step can have parallel subtasks.
For each Step, specify a description of the step and independent subtasks that can run in parallel.
For each subtask specify:
    1. Clear description of the task that an LLM can execute
    2. Name of 1 Agent to use for the task`;

export const TASK_PROMPT_TEMPLATE = `You are part of a larger workflow to achieve the objective: {{objective}}.
Your job is to accomplish only the following task: {{task}}.

Results so far that may provide helpful context:
{{context}}`;

export const SYNTHESIZE_PLAN_PROMPT_TEMPLATE = `Synthesize the results of executing all steps in the plan into a cohesive result:
{{plan_result}}`;

export function getFullPlanSchema(agents: Agent[]) {
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
    is_complete: z.boolean().describe("Whether the plan is complete"),
  });
}

export type FullPlanOutput = z.infer<ReturnType<typeof getFullPlanSchema>>;
export type Step = FullPlanOutput["steps"][number];
export type Task = Step["tasks"][number];
