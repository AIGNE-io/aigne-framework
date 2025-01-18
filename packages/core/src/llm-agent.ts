import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import { Agent, type AgentProcessOptions } from "./agent";
import { StreamTextOutputName, TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import {
  type DataTypeSchema,
  type SchemaMapType,
  schemaToDataType,
} from "./definitions/data-type-schema";
import {
  type CreateRunnableMemory,
  toRunnableMemories,
} from "./definitions/memory";
import type {
  LLMModel,
  LLMModelInputMessage,
  LLMModelInputs,
} from "./llm-model";
import type { MemorableSearchOutput, MemoryItemWithScore } from "./memorable";
import type { RunnableDefinition } from "./runnable";
import { prepareMessages } from "./utils/message-utils";
import { renderMessage } from "./utils/mustache-utils";
import { OrderedRecord } from "./utils/ordered-map";
import { outputsToJsonSchema } from "./utils/structured-output-schema";

@injectable()
export class LLMAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
  State extends ContextState = ContextState,
> extends Agent<I, O, Memories, State> {
  static create = create;

  constructor(
    @inject(TYPES.definition) public override definition: LLMAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
    @inject(TYPES.llmModel) public model?: LLMModel,
  ) {
    super(definition, context);
    this.model ??= context?.resolveDependency(TYPES.llmModel);
  }

  async *process(input: I, options: AgentProcessOptions<Memories>) {
    const { definition, model } = this;
    if (!model) throw new Error("LLM model is required");

    const { originalMessages, messagesWithMemory } = prepareMessages(
      definition,
      input,
      options.memories,
    );

    const llmInputs: LLMModelInputs = {
      messages: messagesWithMemory,
      modelOptions: definition.modelOptions,
    };

    let $text = "";

    const hasTextOutput = OrderedRecord.find(
      definition.outputs,
      (i) => i.name === StreamTextOutputName,
    );
    if (hasTextOutput) {
      for await (const chunk of await this.runWithTextOutput(llmInputs)) {
        $text += chunk.$text || "";
        yield { $text: chunk.$text };
      }
    }

    const json = await this.runWithStructuredOutput(llmInputs);
    if (json) yield { delta: json };

    await this.updateMemories([
      ...originalMessages,
      {
        role: "assistant",
        content: renderMessage("{{$text}}\n{{json}}", { $text, json }).trim(),
      },
    ]);
  }

  private async runWithStructuredOutput(llmInputs: LLMModelInputs) {
    const jsonOutputs = OrderedRecord.filter(
      this.definition.outputs,
      (i) => i.name !== StreamTextOutputName, // ignore `$text` output
    );
    if (!jsonOutputs.length) return null;

    const schema = outputsToJsonSchema(OrderedRecord.fromArray(jsonOutputs));

    const { model } = this;
    if (!model) throw new Error("LLM model is required");

    const response = await model.run({
      ...llmInputs,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "output",
          schema,
          strict: true,
        },
      },
    });

    if (!response.$text) throw new Error("No text in JSON mode response");

    return JSON.parse(response.$text);
  }

  private async runWithTextOutput(llmInputs: LLMModelInputs) {
    const { model } = this;
    if (!model) throw new Error("LLM model is required");

    return model.run(llmInputs, { stream: true });
  }
}

export interface LLMAgentDefinition extends RunnableDefinition {
  type: "llm_agent";

  primaryMemoryId?: string;

  messages?: OrderedRecord<LLMModelInputMessage & { id: string }>;

  modelOptions?: LLMModelInputs["modelOptions"];
}

/**
 * Options to create LLMAgent.
 */
export interface CreateLLMAgentOptions<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  State extends ContextState,
> {
  context?: Context<State>;

  /**
   * Agent name, used to identify the agent.
   */
  name?: string;

  /**
   * Input variables for this agent.
   */
  inputs: I;

  /**
   * Output variables for this agent.
   */
  outputs: O;

  /**
   * Memories to be used in this agent.
   */
  memories?: Memories;

  /**
   * Options for LLM chat model.
   */
  modelOptions?: LLMModelInputs["modelOptions"];

  /**
   * Messages to be passed to LLM chat model.
   */
  messages?: LLMModelInputMessage[];
}

/**
 * Create LLMAgent definition.
 * @param options Options to create LLMAgent.
 * @returns LLMAgent definition.
 */
function create<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  Memories extends {
    [name: string]: CreateRunnableMemory<I> & {
      /**
       * Whether this memory is primary? Primary memory will be passed as messages to LLM chat model,
       * otherwise, it will be placed in a system message.
       *
       * Only one primary memory is allowed.
       */
      primary?: boolean;
    };
  },
  State extends ContextState,
>({
  context,
  ...options
}: CreateLLMAgentOptions<I, O, Memories, State>): LLMAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> },
  State
> {
  const agentId = options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  const memories = toRunnableMemories(agentId, inputs, options.memories ?? {});
  const primaryMemoryNames = Object.entries(options.memories ?? {})
    .filter(([, i]) => i.primary)
    .map(([name]) => name);

  if (primaryMemoryNames && primaryMemoryNames.length > 1) {
    throw new Error("Only one primary memory is allowed");
  }

  const messages = OrderedRecord.fromArray(
    options.messages?.map((i) => ({
      id: nanoid(),
      role: i.role,
      content: i.content,
    })),
  );

  return new LLMAgent(
    {
      id: agentId,
      name: options.name,
      type: "llm_agent",
      inputs,
      outputs,
      primaryMemoryId: primaryMemoryNames?.at(0),
      memories,
      modelOptions: options.modelOptions,
      messages,
    },
    context,
  );
}
