import {
  type AgentInvokeOptions,
  AIAgent,
  type AIAgentOptions,
  type ChatModelInputMessage,
  type ChatModelOutput,
  isAgentResponseDelta,
  type Message,
  mergeAgentResponseChunk,
  PromptBuilder,
} from "@aigne/core";
import { stringify } from "yaml";
import { DefaultPlanner } from "./planner/default/index.js";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "./prompt.js";
import type { PlannerInput, PlannerOutput } from "./type.js";

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

    this.planner = new DefaultPlanner({});
  }

  private planner: AIAgent<PlannerInput, PlannerOutput>;

  override async *process(input: I, options: AgentInvokeOptions) {
    const model = this.model || options.model || options.context.model;
    if (!model) throw new Error("model is required to run OrchestratorAgent");

    const { tools: availableSkills } = await this.instructions.build({
      ...options,
      input,
      model,
      agent: this,
    });

    const { prompt: objective } = await this.instructions.buildPrompt({
      input,
      context: options.context,
    });

    const planRes = availableSkills?.length
      ? await this.invokeChildAgent(
          this.planner,
          {
            objective,
            skills: availableSkills?.map((i) => ({
              name: i.function.name,
              description: i.function.description,
            })),
          },
          { ...options, streaming: false },
        )
      : undefined;

    const builder = new PromptBuilder({
      instructions: ORCHESTRATOR_SYSTEM_PROMPT,
    });

    const { messages, tools, toolChoice, toolAgents } = await builder.build({
      ...options,
      input: {
        instructions: objective,
        plan: planRes?.plan.steps.length ? planRes.plan : undefined,
      },
      model,
      agent: this,
    });

    if (planRes?.plan.steps.length) {
      yield { delta: { text: { [this.outputKey]: `\n\nPlan:\n${stringify(planRes.plan)}` } } };
    }

    const toolMessages: ChatModelInputMessage[] = [];

    const modelOptions = await model.getModelOptions(input, options);

    while (true) {
      const stream = await this.invokeChildAgent(
        model,
        { messages: messages.concat(toolMessages), tools, toolChoice, modelOptions },
        { ...options, streaming: true },
      );

      const modelOutput: ChatModelOutput = {};

      for await (const chunk of stream) {
        if (isAgentResponseDelta(chunk)) {
          if (chunk.delta.text?.text) {
            yield { delta: { text: { [this.outputKey]: chunk.delta.text.text } } };
          }

          if (chunk.delta.json) {
            Object.assign(modelOutput, chunk.delta.json);
          }
        }
      }

      if (!modelOutput.toolCalls?.length) {
        return;
      }

      toolMessages.push({
        role: "agent",
        toolCalls: modelOutput.toolCalls,
      });

      for (const call of modelOutput.toolCalls) {
        const tool = toolAgents?.find((i) => i.name === call.function.name);
        if (!tool) {
          throw new Error(`Tool agent not found: ${call.function.name}`);
        }

        yield {
          delta: {
            text: {
              [this.outputKey]:
                `\n\nInvoking tool: ${tool.name} ${JSON.stringify(call.function.arguments)}`,
            },
          },
        };

        try {
          const toolStream = await this.invokeChildAgent(tool, call.function.arguments, {
            ...options,
            streaming: true,
          });

          const toolResult: Message = {};

          for await (const toolChunk of toolStream) {
            mergeAgentResponseChunk(toolResult, toolChunk);
          }

          toolMessages.push({
            role: "tool",
            name: tool.name,
            toolCallId: call.id,
            content: JSON.stringify(toolResult),
          });
        } catch (error) {
          toolMessages.push({
            role: "tool",
            name: tool.name,
            toolCallId: call.id,
            content: JSON.stringify({ error: { message: error.message } }),
          });
        }
      }
    }
  }
}

export default OrchestratorAgent;
