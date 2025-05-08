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
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import fastq from "fastq";
import { z } from "zod";
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

/**
 * Default maximum number of iterations to prevent infinite loops
 */
const DEFAULT_MAX_ITERATIONS = 30;

/**
 * Default number of concurrent tasks
 */
const DEFAULT_TASK_CONCURRENCY = 5;

/**
 * Re-export orchestrator prompt templates and related types
 */
export * from "./orchestrator-prompts.js";

/**
 * Represents a complete plan with execution results
 * @hidden
 */
export interface FullPlanWithResult {
  /**
   * The overall objective
   */
  objective: string;

  /**
   * The generated complete plan
   */
  plan?: FullPlanOutput;

  /**
   * List of executed steps with their results
   */
  steps: StepWithResult[];

  /**
   * Final result
   */
  result?: string;

  /**
   * Plan completion status
   */
  status?: boolean;
}

/**
 * Configuration options for the Orchestrator Agent
 */
export interface OrchestratorAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  /**
   * Maximum number of iterations to prevent infinite loops
   * Default: 30
   */
  maxIterations?: number;

  /**
   * Number of concurrent tasks
   * Default: 5
   */
  tasksConcurrency?: number;
}

/**
 * Orchestrator Agent Class
 *
 * This Agent is responsible for:
 * 1. Generating an execution plan based on the objective
 * 2. Breaking down the plan into steps and tasks
 * 3. Coordinating the execution of steps and tasks
 * 4. Synthesizing the final result
 *
 * Workflow:
 * - Receives input objective
 * - Uses planner to create execution plan
 * - Executes tasks and steps according to the plan
 * - Synthesizes final result through completer
 */
export class OrchestratorAgent<
  I extends Message = Message,
  O extends Message = Message,
> extends Agent<I, O> {
  /**
   * Factory method to create an OrchestratorAgent instance
   * @param options - Configuration options for the Orchestrator Agent
   * @returns A new OrchestratorAgent instance
   */
  static from<I extends Message, O extends Message>(
    options: OrchestratorAgentOptions<I, O>,
  ): OrchestratorAgent<I, O> {
    return new OrchestratorAgent(options);
  }

  /**
   * Creates an OrchestratorAgent instance
   * @param options - Configuration options for the Orchestrator Agent
   */
  constructor(options: OrchestratorAgentOptions<I, O>) {
    checkArguments("OrchestratorAgent", orchestratorAgentOptionsSchema, options);

    super({ ...options });
    this.maxIterations = options.maxIterations;
    this.tasksConcurrency = options.tasksConcurrency;

    this.planner = new AIAgent<FullPlanInput, FullPlanOutput>({
      name: "llm_orchestration_planner",
      instructions: FULL_PLAN_PROMPT_TEMPLATE,
      outputSchema: () => getFullPlanSchema(this.skills),
    });

    this.completer = new AIAgent({
      name: "llm_orchestration_completer",
      instructions: FULL_PLAN_PROMPT_TEMPLATE,
      outputSchema: this.outputSchema,
    });
  }

  private planner: AIAgent<FullPlanInput, FullPlanOutput>;

  private completer: AIAgent<FullPlanInput, O>;

  /**
   * Maximum number of iterations
   * Prevents infinite execution loops
   */
  maxIterations?: number;

  /**
   * Number of concurrent tasks
   * Controls how many tasks can be executed simultaneously
   */
  tasksConcurrency?: number;

  /**
   * Process input and execute the orchestrator workflow
   *
   * Workflow:
   * 1. Extract the objective
   * 2. Loop until plan completion or maximum iterations:
   *    a. Generate/update execution plan
   *    b. If plan is complete, synthesize result
   *    c. Otherwise, execute steps in the plan
   *
   * @param input - Input message containing the objective
   * @param context - Execution context with model and other necessary info
   * @returns Processing result
   */
  async process(input: I, context: Context) {
    const { model } = context;
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
      agents: this.skills.map((i) => ({
        name: i.name,
        description: i.description,
        tools: i.skills.map((i) => ({ name: i.name, description: i.description })),
      })),
    };
  }

  private async getFullPlan(
    planResult: FullPlanWithResult,
    context: Context,
  ): Promise<FullPlanOutput> {
    return context.invoke(this.planner, this.getFullPlanInput(planResult));
  }

  private async synthesizePlanResult(planResult: FullPlanWithResult, context: Context): Promise<O> {
    return context.invoke(this.completer, {
      ...this.getFullPlanInput(planResult),
      ...createMessage(SYNTHESIZE_PLAN_USER_PROMPT_TEMPLATE),
    });
  }

  private async executeStep(
    planResult: FullPlanWithResult,
    step: Step,
    context: Context,
  ): Promise<StepWithResult> {
    const concurrency = this.tasksConcurrency ?? DEFAULT_TASK_CONCURRENCY;

    const { model } = context;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const queue = fastq.promise(async (task: Task) => {
      const agent = this.skills.find((skill) => skill.name === task.agent);
      if (!agent) throw new Error(`Agent ${task.agent} not found`);

      const prompt = PromptTemplate.from(TASK_PROMPT_TEMPLATE).format(<TaskPromptInput>{
        objective: planResult.objective,
        step,
        task,
        steps: planResult.steps,
      });

      let result: string;

      if (agent.isInvokable) {
        result = getMessageOrJsonString(await context.invoke(agent, prompt));
      } else {
        const executor = AIAgent.from({
          name: "llm_orchestration_task_executor",
          instructions: prompt,
          skills: agent.skills,
        });
        result = getMessageOrJsonString(await context.invoke(executor, {}));
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
      await context.invoke(
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
  const firstValue = entries[0]?.[1];
  if (entries.length === 1 && typeof firstValue === "string") {
    return firstValue;
  }
  return JSON.stringify(output);
}

const orchestratorAgentOptionsSchema = z.object({
  maxIterations: z.number().optional(),
  tasksConcurrency: z.number().optional(),
});
