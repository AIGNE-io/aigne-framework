import {
  AIAgent,
  Agent,
  type AgentOptions,
  type Context,
  type Message,
  PromptTemplate,
  getMessage,
} from "@aigne/core-next";
import {
  FULL_PLAN_PROMPT_TEMPLATE,
  type FullPlanOutput,
  FullPlanSchema,
  PLAN_RESULT_TEMPLATE,
  STEP_RESULT_TEMPLATE,
  SYNTHESIZE_PLAN_PROMPT_TEMPLATE,
  type Step,
  TASK_PROMPT_TEMPLATE,
  TASK_RESULT_TEMPLATE,
} from "./orchestrator-prompts.js";

const DEFAULT_MAX_ITERATIONS = 30;

export * from "./orchestrator-prompts.js";

export interface StepResult {
  step: Step;
  task_results: Array<TaskWithResult>;
}

export interface TaskWithResult {
  description: string;
  agent: string;
  result: string;
}

export interface PlanResult extends Message {
  objective: string;
  plan?: FullPlanOutput;
  is_complete?: boolean;
  result?: string;
  step_results: StepResult[];
}

export interface FullPlanInput extends Message {
  objective: string;
  plan_result: string;
  agents: string;
}

export interface OrchestratorAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  maxIterations?: number;
}

export class OrchestratorAgent<
  I extends Message = Message,
  O extends Message = Message,
> extends Agent<I, O> {
  static from<I extends Message, O extends Message>(
    options: OrchestratorAgentOptions<I, O>,
  ): OrchestratorAgent<I, O> {
    return new OrchestratorAgent(options);
  }

  constructor(options: OrchestratorAgentOptions<I, O>) {
    super({ ...options });
    this.maxIterations = options.maxIterations;

    this.planner = new AIAgent<FullPlanInput, FullPlanOutput>({
      name: "llm_orchestration_planner",
      instructions: FULL_PLAN_PROMPT_TEMPLATE,
      outputSchema: FullPlanSchema,
    });

    this.completer = new AIAgent({
      name: "llm_orchestration_completer",
      instructions: SYNTHESIZE_PLAN_PROMPT_TEMPLATE,
      outputSchema: this.outputSchema,
    });
  }

  private planner: AIAgent<FullPlanInput, FullPlanOutput>;

  private completer: AIAgent<{ plan_result: string }, O>;

  maxIterations?: number;

  async process(input: I, context?: Context) {
    const model = context?.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const objective = getMessage(input);
    if (!objective) throw new Error("Objective is required to run OrchestratorAgent");

    const result: PlanResult = {
      objective,
      step_results: [],
    };

    let iterations = 0;
    const maxIterations = this.maxIterations ?? DEFAULT_MAX_ITERATIONS;

    while (iterations++ < maxIterations) {
      const plan = await this.getFullPlan(objective, result, context);

      result.plan = plan;

      if (plan.is_complete) {
        return context.call(this.completer, { plan_result: this.formatPlanResult(result) });
      }

      for (const step of plan.steps) {
        const stepResult = await this.executeStep(result, step, context);

        result.step_results.push(stepResult);
      }
    }

    throw new Error(`Max iterations reached: ${maxIterations}`);
  }

  private async getFullPlan(
    objective: string,
    planResult: PlanResult,
    context: Context,
  ): Promise<FullPlanOutput> {
    const agents = this.tools
      .map(
        (agent, idx) =>
          `${idx + 1}. Agent Name: ${agent.name}
Description: ${agent.description}
Functions: ${agent.tools.map((tool) => `- ${tool.name} ${tool.description}`).join("\n")}`,
      )
      .join("\n");

    return context.call(this.planner, {
      objective,
      plan_result: this.formatPlanResult(planResult),
      agents,
    });
  }

  private async executeStep(
    previousResult: PlanResult,
    step: Step,
    context?: Context,
  ): Promise<StepResult> {
    const model = context?.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const taskResults: TaskWithResult[] = [];

    for (const task of step.tasks) {
      const agent = this.tools.find((agent) => agent.name === task.agent);
      if (!agent) throw new Error(`Agent ${task.agent} not found`);

      const prompt = PromptTemplate.from(TASK_PROMPT_TEMPLATE).format({
        objective: previousResult.objective,
        task: task.description,
        context: this.formatPlanResult(previousResult),
      });

      let result: string;

      if (agent.isCallable) {
        result = JSON.stringify(await context.call(agent, prompt));
      } else {
        const executor = AIAgent.from({
          instructions: prompt,
          tools: agent.tools,
        });
        result = JSON.stringify(await context.call(executor, {}));
      }

      taskResults.push({ ...task, result });
    }

    return {
      step,
      task_results: taskResults,
    };
  }

  private formatPlanResult(planResult: PlanResult): string {
    return PromptTemplate.from(PLAN_RESULT_TEMPLATE).format({
      plan_objective: planResult.objective,
      steps_str: this.formatStepsResults(planResult.step_results),
      plan_status: planResult.is_complete ? "Complete" : "In Progress",
      plan_result: planResult.result || "No results yet",
    });
  }

  private formatStepsResults(stepResults: StepResult[]): string {
    if (!stepResults.length) return "No steps executed yet";

    return stepResults
      .map(
        (stepResult, index) =>
          `${index + 1}:\n${
            stepResult.task_results.length
              ? PromptTemplate.from(STEP_RESULT_TEMPLATE).format({
                  step_description: stepResult.step.description,
                  tasks_str: stepResult.task_results
                    .map(
                      (task) =>
                        `- ${PromptTemplate.from(TASK_RESULT_TEMPLATE).format({
                          task_description: task.description,
                          task_result: task.result,
                        })}`,
                    )
                    .join("\n"),
                })
              : "No result"
          }`,
      )
      .join("\n\n");
  }
}
