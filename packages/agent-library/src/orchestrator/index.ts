import {
  type AgentInvokeOptions,
  AIAgent,
  type AIAgentOptions,
  type ChatModelInputTool,
  type Message,
  PromptBuilder,
} from "@aigne/core";
import { omit } from "@aigne/core/utils/type-utils.js";
import { ORCHESTRATOR_COMPLETE_PROMPT } from "./prompt.js";
import { TodoPlanner, TodoWorker } from "./todo/index.js";
import type { OrchestratorState, PlannerInput, PlannerOutput } from "./type.js";

/**
 * Configuration options for the Orchestrator Agent
 */
export interface OrchestratorAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AIAgentOptions<I, O> {}

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

    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : (options.instructions ?? new PromptBuilder());

    this.planner = new TodoPlanner({}) as unknown as AIAgent<PlannerInput, PlannerOutput>;
    this.worker = new TodoWorker({
      ...omit(options, "instructions", "outputSchema", "inputSchema"),
    } as AIAgentOptions);
    this.completer = new AIAgent({
      instructions: ORCHESTRATOR_COMPLETE_PROMPT,
      outputKey: options.outputKey,
      outputSchema: options.outputSchema,
    });
  }

  private planner: AIAgent<PlannerInput, PlannerOutput>;

  private worker: AIAgent;

  private completer: AIAgent<{ objective: string; currentState: OrchestratorState }, O>;

  override async *process(input: I, options: AgentInvokeOptions) {
    const model = this.model || options.model || options.context.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const { tools: availableSkills } = await this.instructions.build({
      ...options,
      input,
      model,
      agent: this,
    });

    if (!availableSkills?.length) {
      throw new Error("No available skills found for orchestration.");
    }

    const { prompt: objective } = await this.instructions.buildPrompt({
      input,
      context: options.context,
    });

    const currentState: {
      taskHistories: { task: string; result: string }[];
    } = { taskHistories: [] };

    while (true) {
      const plan = await this.getPlan(
        { objective, currentState, skills: availableSkills },
        options,
      );

      if (plan.finished || !plan.nextTask) {
        break;
      }

      const taskResult = await this.invokeChildAgent(
        this.worker,
        { currentState, objective, task: plan.nextTask },
        { ...options, streaming: false },
      );

      currentState.taskHistories.push({ task: plan.nextTask, result: JSON.stringify(taskResult) });
    }

    yield* await this.invokeChildAgent(
      this.completer,
      { objective, currentState },
      { ...options, streaming: true },
    );
  }

  async getPlan(
    {
      skills,
      ...input
    }: { objective: string; skills: ChatModelInputTool[]; [key: string]: unknown },
    options: AgentInvokeOptions,
  ) {
    const plan = await this.invokeChildAgent(
      this.planner,
      {
        ...input,
        skills: skills.map((i) => ({
          name: i.function.name,
          description: i.function.description,
        })),
      },
      { ...options, streaming: false },
    );

    return plan;
  }
}

export default OrchestratorAgent;
