import {
  type Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  AIAgent,
  type AIAgentOptions,
  type Message,
  type PromptBuilder,
} from "@aigne/core";
import { getNestAgentSchema, type NestAgentSchema } from "@aigne/core/loader/agent-yaml.js";
import type { AgentLoadOptions } from "@aigne/core/loader/index.js";
import {
  camelizeSchema,
  getInstructionsSchema,
  type Instructions,
  instructionsToPromptBuilder,
  optionalize,
} from "@aigne/core/loader/schema.js";
import { isAgent } from "@aigne/core/utils/agent-utils.js";
import * as fastq from "@aigne/core/utils/queue.js";
import { estimateTokens } from "@aigne/core/utils/token-estimator.js";
import { omit, pick } from "@aigne/core/utils/type-utils.js";
import { type ZodType, z } from "zod";
import {
  ORCHESTRATOR_COMPLETE_PROMPT,
  TODO_PLANNER_PROMPT_TEMPLATE,
  TODO_WORKER_PROMPT_TEMPLATE,
} from "./prompt.js";
import {
  type CompleterInput,
  completerInputSchema,
  DEFAULT_MAX_ITERATIONS,
  type ExecutionState,
  type PlannerInput,
  type PlannerOutput,
  plannerInputSchema,
  plannerOutputSchema,
  type StateManagementOptions,
  stateManagementOptionsSchema,
  type TaskRecord,
  type WorkerInput,
  type WorkerOutput,
  workerInputSchema,
  workerOutputSchema,
} from "./type.js";

/**
 * Configuration options for the Orchestrator Agent
 */
export interface OrchestratorAgentOptions<I extends Message = Message, O extends Message = Message>
  extends Omit<AIAgentOptions<I, O>, "instructions"> {
  objective?: PromptBuilder;

  planner?: OrchestratorAgent<I, O>["planner"];

  worker?: OrchestratorAgent<I, O>["worker"];

  completer?: OrchestratorAgent<I, O>["completer"];

  /**
   * Configuration for managing execution state
   * Prevents context overflow during long-running executions
   */
  stateManagement?: StateManagementOptions;

  concurrency?: number;
}

export interface LoadOrchestratorAgentOptions {
  objective?: Instructions;

  planner?: NestAgentSchema;

  worker?: NestAgentSchema;

  completer?: NestAgentSchema;

  stateManagement?: StateManagementOptions;
}

const defaultPlannerOptions: AIAgentOptions<PlannerInput, PlannerOutput> = {
  name: "Planner",
  instructions: TODO_PLANNER_PROMPT_TEMPLATE,
  inputSchema: plannerInputSchema,
  outputSchema: plannerOutputSchema,
  historyConfig: {
    disabled: true,
  },
};

const defaultWorkerOptions: AIAgentOptions<WorkerInput, WorkerOutput> = {
  name: "Worker",
  taskTitle: "Execute Task: {{task}}",
  instructions: TODO_WORKER_PROMPT_TEMPLATE,
  inputSchema: workerInputSchema,
  outputSchema: workerOutputSchema,
  historyConfig: {
    disabled: true,
  },
};

const defaultCompleterOptions: AIAgentOptions<CompleterInput, any> = {
  name: "Completer",
  instructions: ORCHESTRATOR_COMPLETE_PROMPT,
  inputSchema: completerInputSchema,
  historyConfig: {
    disabled: true,
  },
};

const DEFAULT_CONCURRENCY = 5;

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
> extends AIAgent<I, O> {
  override tag = "OrchestratorAgent";

  static override schema<T>({ filepath }: { filepath: string }): ZodType<T> {
    const nestAgentSchema = getNestAgentSchema({ filepath });
    const instructionsSchema = getInstructionsSchema({ filepath });

    return camelizeSchema(
      z.object({
        objective: optionalize(instructionsSchema),
        planner: optionalize(nestAgentSchema),
        worker: optionalize(nestAgentSchema),
        completer: optionalize(nestAgentSchema),
        stateManagement: optionalize(camelizeSchema(stateManagementOptionsSchema)),
        concurrency: optionalize(z.number().int().min(1).default(DEFAULT_CONCURRENCY)),
      }),
    ) as any;
  }

  static override async load<I extends Message = Message, O extends Message = Message>({
    filepath,
    parsed,
    options,
  }: {
    filepath: string;
    parsed: AgentOptions<I, O>;
    options: AgentLoadOptions;
  }): Promise<OrchestratorAgent<I, O>> {
    const valid = await OrchestratorAgent.schema<LoadOrchestratorAgentOptions>({
      filepath,
    }).parseAsync(parsed);

    return new OrchestratorAgent({
      ...parsed,
      objective: valid.objective && instructionsToPromptBuilder(valid.objective),
      planner: valid.planner
        ? ((await options.loadNestAgent(filepath, valid.planner, options, {
            ...defaultPlannerOptions,
            afs: parsed.afs,
            skills: parsed.skills,
          })) as OrchestratorAgent["planner"])
        : undefined,
      worker: valid.worker
        ? ((await options.loadNestAgent(filepath, valid.worker, options, {
            ...defaultWorkerOptions,
            afs: parsed.afs,
            skills: parsed.skills,
          })) as OrchestratorAgent["worker"])
        : undefined,
      completer: valid.completer
        ? ((await options.loadNestAgent(filepath, valid.completer, options, {
            ...defaultCompleterOptions,
            outputSchema: parsed.outputSchema,
            afs: parsed.afs,
            skills: parsed.skills,
          })) as OrchestratorAgent<I, O>["completer"])
        : undefined,
      stateManagement: valid.stateManagement,
    });
  }

  /**
   * Factory method to create an OrchestratorAgent instance
   * @param options - Configuration options for the Orchestrator Agent
   * @returns A new OrchestratorAgent instance
   */
  static override from<I extends Message, O extends Message>(
    options: OrchestratorAgentOptions<I, O>,
  ): OrchestratorAgent<I, O> {
    return new OrchestratorAgent(options);
  }

  /**
   * Creates an OrchestratorAgent instance
   * @param options - Configuration options for the Orchestrator Agent
   */
  constructor(options: OrchestratorAgentOptions<I, O>) {
    super({ ...options });

    this.objective = options.objective;

    this.planner = isAgent<Agent<PlannerInput, PlannerOutput>>(options.planner)
      ? options.planner
      : new AIAgent({
          ...(options as object),
          ...defaultPlannerOptions,
        });
    this.worker = isAgent<Agent<WorkerInput, WorkerOutput>>(options.worker)
      ? options.worker
      : new AIAgent({
          ...(options as object),
          ...defaultWorkerOptions,
        });
    this.completer = isAgent<Agent<CompleterInput, O>>(options.completer)
      ? options.completer
      : new AIAgent({
          ...(omit(options, "inputSchema") as object),
          ...defaultCompleterOptions,
          outputKey: options.outputKey,
          outputSchema: options.outputSchema,
        });

    // Initialize state management config
    this.stateManagement = options.stateManagement;
    this.concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  }

  private objective?: PromptBuilder;

  private planner: Agent<PlannerInput, PlannerOutput>;

  private worker: Agent<WorkerInput, WorkerOutput>;

  private completer: Agent<CompleterInput, O>;

  private stateManagement?: StateManagementOptions;

  private concurrency: number;

  /**
   * Compress execution state to prevent context overflow
   * Uses reverse accumulation to efficiently find optimal task count
   */
  private compressState(state: ExecutionState): ExecutionState {
    const { maxTokens, keepRecent } = this.stateManagement ?? {};

    if (!maxTokens && !keepRecent) {
      return state;
    }

    const tasks = state.tasks;
    let selectedTasks = tasks;

    // Step 1: Apply keepRecent limit if configured
    if (keepRecent && tasks.length > keepRecent) {
      selectedTasks = tasks.slice(-keepRecent);
    }

    // Step 2: Apply maxTokens limit if configured
    if (maxTokens && selectedTasks.length > 0) {
      // Start from the most recent task and accumulate backwards
      let accumulatedTokens = 0;
      let taskCount = 0;

      for (let i = selectedTasks.length - 1; i >= 0; i--) {
        const taskJson = JSON.stringify(selectedTasks[i]);
        const taskTokens = estimateTokens(taskJson);

        if (accumulatedTokens + taskTokens > maxTokens && taskCount > 0) {
          // Stop if adding this task would exceed limit
          break;
        }

        accumulatedTokens += taskTokens;
        taskCount++;
      }

      // Keep the most recent N tasks that fit within token limit
      if (taskCount < selectedTasks.length) {
        selectedTasks = selectedTasks.slice(-taskCount);
      }
    }

    return { tasks: selectedTasks };
  }

  override async *process(input: I, options: AgentInvokeOptions) {
    const model = this.model || options.model || options.context.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const objective = (
      await this.objective?.buildPrompt({
        input,
        context: options.context,
      })
    )?.prompt;

    const executionState: ExecutionState = { tasks: [] };
    let iterationCount = 0;
    const maxIterations = this.stateManagement?.maxIterations ?? DEFAULT_MAX_ITERATIONS;

    while (true) {
      // Check if maximum iterations reached
      if (maxIterations && iterationCount >= maxIterations) {
        console.warn(`Maximum iterations (${maxIterations}) reached. Stopping execution.`);
        executionState.tasks.push({
          status: "failed",
          error: { message: `ERROR: Maximum iterations (${maxIterations}) reached` },
          task: `ERROR: Objective not completed within iteration limit of ${maxIterations}`,
          createdAt: Date.now(),
          completedAt: Date.now(),
        });
        break;
      }

      iterationCount++;

      // Compress state for planner input if needed
      const compressedState = this.compressState(executionState);

      const plan = await this.invokeChildAgent(
        this.planner,
        {
          objective,
          executionState: compressedState,
          ...pick(input, this.planner.inputKeys),
        },
        { ...options, model, streaming: false },
      );

      if (plan.finished || !plan.nextTasks?.length) {
        break;
      }

      const createdAt = Date.now();

      const queue = fastq.promise<unknown, { task: string }, TaskRecord>(
        async ({ task }) => {
          const taskResult = await this.invokeChildAgent(
            this.worker,
            {
              objective,
              executionState: compressedState,
              task,
              ...pick(input, this.worker.inputKeys),
            },
            { ...options, model, streaming: false },
          )
            .then((res) => {
              if (res.error || res.success === false) {
                return { status: "failed" as const, result: res.result, error: res.error };
              }
              return { status: "completed" as const, result: res.result };
            })
            .catch((error) => ({
              status: "failed" as const,
              error: { message: error instanceof Error ? error.message : String(error) },
            }));

          return { ...taskResult, task, createdAt, completedAt: Date.now() };
        },
        plan.parallelTasks ? this.concurrency : 1,
      );

      const taskResults = await Promise.all(plan.nextTasks.map((task) => queue.push({ task })));

      executionState.tasks.push(...taskResults);
    }

    // Compress state for completer input if needed
    const compressedState = this.compressState(executionState);

    yield* await this.invokeChildAgent(
      this.completer,
      {
        objective,
        executionState: compressedState,
        ...pick(input, this.completer.inputKeys),
      },
      { ...options, model, streaming: true },
    );
  }
}

export default OrchestratorAgent;
