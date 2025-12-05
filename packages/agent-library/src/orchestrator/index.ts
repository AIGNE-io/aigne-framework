import {
  type Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  AIAgent,
  type AIAgentOptions,
  type Message,
  PromptBuilder,
} from "@aigne/core";
import {
  getInstructionsSchema,
  getNestAgentSchema,
  type Instructions,
  isNestAgentSchema,
  type NestAgentSchema,
} from "@aigne/core/loader/agent-yaml.js";
import {
  instructionsToPromptBuilder,
  type LoadOptions,
  loadNestAgent,
} from "@aigne/core/loader/index.js";
import { isAgent } from "@aigne/core/utils/agent-utils.js";
import { omit } from "@aigne/core/utils/type-utils.js";
import { ORCHESTRATOR_COMPLETE_PROMPT } from "./prompt.js";
import { TodoPlanner, TodoWorker } from "./todo/index.js";
import {
  type CompleterInput,
  type ExecutionState,
  type PlannerInput,
  type PlannerOutput,
  type WorkerInput,
  type WorkerOutput,
  workerInputSchema,
} from "./type.js";

/**
 * Configuration options for the Orchestrator Agent
 */
export interface OrchestratorAgentOptions<I extends Message = Message, O extends Message = Message>
  extends Omit<AIAgentOptions<I, O>, "instructions"> {
  objective: PromptBuilder;

  planner?: OrchestratorAgent<I, O>["planner"] | { instructions?: string | PromptBuilder };

  worker?: OrchestratorAgent<I, O>["worker"] | { instructions?: string | PromptBuilder };

  completer?: OrchestratorAgent<I, O>["completer"] | { instructions?: string | PromptBuilder };
}

export interface LoadOrchestratorAgentOptions<
  I extends Message = Message,
  O extends Message = Message,
> extends Omit<AIAgentOptions<I, O>, "instructions"> {
  objective: string | PromptBuilder | Instructions;

  planner?: NestAgentSchema | { instructions?: string | PromptBuilder | Instructions };

  worker?: NestAgentSchema | { instructions?: string | PromptBuilder | Instructions };

  completer?: NestAgentSchema | { instructions?: string | PromptBuilder | Instructions };
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
> extends AIAgent<I, O> {
  override tag = "OrchestratorAgent";

  static override async load<I extends Message = Message, O extends Message = Message>({
    filepath,
    parsed,
    options,
  }: {
    filepath: string;
    parsed: AgentOptions<I, O> & LoadOrchestratorAgentOptions<I, O>;
    options?: LoadOptions;
  }): Promise<OrchestratorAgent<I, O>> {
    const nestAgentSchema = getNestAgentSchema({ filepath });

    return new OrchestratorAgent({
      ...parsed,
      objective: await parseInstructions(filepath, parsed.objective),
      planner: isNestAgentSchema(parsed.planner)
        ? ((await loadNestAgent(
            filepath,
            await nestAgentSchema.parseAsync(parsed.planner),
            options,
          )) as OrchestratorAgent["planner"])
        : {
            instructions:
              parsed.planner?.instructions &&
              (await parseInstructions(filepath, parsed.planner.instructions)),
          },
      worker: isNestAgentSchema(parsed.worker)
        ? ((await loadNestAgent(
            filepath,
            await nestAgentSchema.parseAsync(parsed.worker),
            options,
          )) as OrchestratorAgent["worker"])
        : {
            instructions:
              parsed.worker?.instructions &&
              (await parseInstructions(filepath, parsed.worker.instructions)),
          },
      completer: isNestAgentSchema(parsed.completer)
        ? ((await loadNestAgent(
            filepath,
            await nestAgentSchema.parseAsync(parsed.completer),
            options,
          )) as OrchestratorAgent<I, O>["completer"])
        : {
            instructions:
              parsed.completer?.instructions &&
              (await parseInstructions(filepath, parsed.completer.instructions)),
          },
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
      : new TodoPlanner({
          instructions: options.planner?.instructions,
        });
    this.worker = isAgent<Agent<WorkerInput, WorkerOutput>>(options.worker)
      ? options.worker
      : new TodoWorker({
          ...omit(options, "name", "inputSchema", "outputKey", "outputSchema"),
          instructions: options.worker?.instructions,
          inputSchema: workerInputSchema,
        } as AIAgentOptions);
    this.completer = isAgent<Agent<CompleterInput, O>>(options.completer)
      ? options.completer
      : new AIAgent({
          instructions: options.completer?.instructions || ORCHESTRATOR_COMPLETE_PROMPT,
          outputKey: options.outputKey,
          outputSchema: options.outputSchema,
        });
  }

  private objective: PromptBuilder;

  private planner: Agent<PlannerInput, PlannerOutput>;

  private worker: Agent<WorkerInput, WorkerOutput>;

  private completer: Agent<CompleterInput, O>;

  override async *process(input: I, options: AgentInvokeOptions) {
    const model = this.model || options.model || options.context.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const { tools: availableSkills = [] } = await this.objective.build({
      ...options,
      input,
      model,
      agent: this,
    });

    const skills = availableSkills.map((i) => ({
      name: i.function.name,
      description: i.function.description,
    }));

    const { prompt: objective } = await this.objective.buildPrompt({
      input,
      context: options.context,
    });

    const executionState: ExecutionState = { tasks: [] };

    while (true) {
      const plan = await this.invokeChildAgent(
        this.planner,
        { objective, skills, executionState },
        { ...options, model, streaming: false },
      );

      if (plan.finished || !plan.nextTask) {
        break;
      }

      const taskResult = await this.invokeChildAgent(
        this.worker,
        { objective, executionState, task: plan.nextTask },
        { ...options, model, streaming: false },
      );

      executionState.tasks.push({ task: plan.nextTask, result: JSON.stringify(taskResult) });
    }

    yield* await this.invokeChildAgent(
      this.completer,
      { objective, executionState },
      { ...options, model, streaming: true },
    );
  }
}

export default OrchestratorAgent;

async function parseInstructions(
  filepath: string,
  instructions: string | PromptBuilder | Instructions,
): Promise<PromptBuilder> {
  if (instructions instanceof PromptBuilder) return instructions;

  const schema = getInstructionsSchema({ filepath });

  const s = await schema.parseAsync(instructions);

  return instructionsToPromptBuilder(s);
}
