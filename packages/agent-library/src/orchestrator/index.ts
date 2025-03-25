import {
  AIAgent,
  Agent,
  type AgentOptions,
  type Context,
  type Message,
  PromptTemplate,
  createMessage,
  getMessage,
} from "@aigne/core";
import fastq from "fastq";
import {
  FULL_PLAN_PROMPT_TEMPLATE,
  type FullPlanInput,
  type FullPlanOutput,
  SYNTHESIZE_PLAN_USER_PROMPT_TEMPLATE,
  SYNTHESIZE_STEP_PROMPT_TEMPLATE,
  type Step,
  type StepWithResult,
  type SynthesizeStepPromptInput,
  TASK_PROMPT_TEMPLATE,
  type Task,
  type TaskPromptInput,
  getFullPlanSchema,
} from "./orchestrator-prompts.js";

const DEFAULT_MAX_ITERATIONS = 30;
const DEFAULT_TASK_CONCURRENCY = 5;

export * from "./orchestrator-prompts.js";

export interface FullPlanWithResult {
  objective: string;
  plan?: FullPlanOutput;
  steps: StepWithResult[];
  result?: string;
  status?: boolean;
}

export interface OrchestratorAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  maxIterations?: number;
  tasksConcurrency?: number;
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
    this.tasksConcurrency = options.tasksConcurrency;

    this.planner = new AIAgent<FullPlanInput, FullPlanOutput>({
      name: "llm_orchestration_planner",
      instructions: FULL_PLAN_PROMPT_TEMPLATE,
      outputSchema: () => getFullPlanSchema(this.tools),
    });

    this.completer = new AIAgent({
      name: "llm_orchestration_completer",
      instructions: FULL_PLAN_PROMPT_TEMPLATE,
      outputSchema: this.outputSchema,
    });
  }

  private planner: AIAgent<FullPlanInput, FullPlanOutput>;

  private completer: AIAgent<FullPlanInput, O>;

  maxIterations?: number;

  tasksConcurrency?: number;

  async process(input: I, context?: Context) {
    const model = context?.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const objective = getMessage(input);
    if (!objective) throw new Error("Objective is required to run OrchestratorAgent");

    const result: FullPlanWithResult = {
      objective,
      steps: [],
    };

    let iterations = 0;
    const maxIterations = this.maxIterations ?? DEFAULT_MAX_ITERATIONS;

    while (iterations++ < maxIterations) {
      const plan = await this.getFullPlan(result, context);

      result.plan = plan;

      if (plan.isComplete) {
        return this.synthesizePlanResult(result, context);
      }

      for (const step of plan.steps) {
        const stepResult = await this.executeStep(result, step, context);

        result.steps.push(stepResult);
      }
    }

    throw new Error(`Max iterations reached: ${maxIterations}`);
  }

  private getFullPlanInput(planResult: FullPlanWithResult): FullPlanInput {
    return {
      objective: planResult.objective,
      steps: planResult.steps,
      plan: {
        status: planResult.status ? "Complete" : "In Progress",
        result: planResult.result || "No results yet",
      },
      agents: this.tools.map((i) => ({
        name: i.name,
        description: i.description,
        tools: i.tools.map((i) => ({ name: i.name, description: i.description })),
      })),
    };
  }

  private async getFullPlan(
    planResult: FullPlanWithResult,
    context: Context,
  ): Promise<FullPlanOutput> {
    return context.call(this.planner, this.getFullPlanInput(planResult));
  }

  private async synthesizePlanResult(planResult: FullPlanWithResult, context: Context): Promise<O> {
    return context.call(this.completer, {
      ...this.getFullPlanInput(planResult),
      ...createMessage(SYNTHESIZE_PLAN_USER_PROMPT_TEMPLATE),
    });
  }

  private async executeStep(
    planResult: FullPlanWithResult,
    step: Step,
    context?: Context,
  ): Promise<StepWithResult> {
    const concurrency = this.tasksConcurrency ?? DEFAULT_TASK_CONCURRENCY;

    const model = context?.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const queue = fastq.promise(async (task: Task) => {
      const agent = this.tools.find((agent) => agent.name === task.agent);
      if (!agent) throw new Error(`Agent ${task.agent} not found`);

      const prompt = PromptTemplate.from(TASK_PROMPT_TEMPLATE).format(<TaskPromptInput>{
        objective: planResult.objective,
        step,
        task,
        steps: planResult.steps,
      });

      let result: string;

      if (agent.isCallable) {
        result = getMessageOrJsonString(await context.call(agent, prompt));
      } else {
        const executor = AIAgent.from({
          name: "llm_orchestration_task_executor",
          instructions: prompt,
          tools: agent.tools,
        });
        result = getMessageOrJsonString(await context.call(executor, {}));
      }

      return { task, result };
    }, concurrency);

    let results: StepWithResult["tasks"] | undefined;

    try {
      results = await Promise.all(step.tasks.map((task) => queue.push(task)));
    } catch (error) {
      queue.kill();
      throw error;
    }

    const result = getMessageOrJsonString(
      await context.call(
        AIAgent.from<SynthesizeStepPromptInput, Message>({
          name: "llm_orchestration_step_synthesizer",
          instructions: SYNTHESIZE_STEP_PROMPT_TEMPLATE,
        }),
        { objective: planResult.objective, step, tasks: results },
      ),
    );
    if (!result) throw new Error("unexpected empty result from synthesize step's tasks results");

    return {
      step,
      tasks: results,
      result,
    };
  }
}

function getMessageOrJsonString(output: Message): string {
  const entries = Object.entries(output);
  if (entries.length === 1 && typeof entries[1] === "string") {
    return entries[1];
  }
  return JSON.stringify(output);
}
