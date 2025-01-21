import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import {
  Agent,
  type AgentDefinition,
  type AgentProcessInput,
  type AgentProcessOptions,
} from "./agent";
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
import {
  type PreloadCreator,
  preloadCreatorsToPreloads,
} from "./definitions/preload";
import type {
  LLMModel,
  LLMModelInputMessage,
  LLMModelInputs,
} from "./llm-model";
import type { MemorableSearchOutput, MemoryItemWithScore } from "./memorable";
import { prepareMessages } from "./utils/message-utils";
import { renderMessage } from "./utils/mustache-utils";
import { OrderedRecord } from "./utils/ordered-map";
import type { ExtractRunnableOutputType } from "./utils/runnable-type";
import { outputsToJsonSchema } from "./utils/structured-output-schema";

@injectable()
export class LLMAgent<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
  Preloads extends { [name: string]: any } = {},
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> extends Agent<I, O, State, Preloads, Memories> {
  static create = create;

  constructor(
    @inject(TYPES.definition) public override definition: LLMAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
    @inject(TYPES.llmModel) public model?: LLMModel,
  ) {
    super(definition, context);
    this.model ??= context?.resolveDependency(TYPES.llmModel);
  }

  async *process(
    input: AgentProcessInput<I, Preloads, Memories>,
    options: AgentProcessOptions,
  ) {
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

export interface LLMAgentDefinition extends AgentDefinition {
  type: "llm_agent";

  primaryMemoryId?: string;

  messages?: OrderedRecord<LLMModelInputMessage & { id: string }>;

  modelOptions?: LLMModelInputs["modelOptions"];
}

// TODO: extract common options for agent creation to a common interface
/**
 * Options to create LLMAgent.
 */
export interface CreateLLMAgentOptions<
  I extends { [name: string]: DataTypeSchema },
  O extends { [name: string]: DataTypeSchema },
  State extends ContextState,
  Preloads extends { [name: string]: PreloadCreator<I> },
  Memories extends { [name: string]: CreateRunnableMemory<I> },
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
   * Preload runnables before running this agent. the preloaded data are available in the agent as input variables.
   */
  preloads?: Preloads;

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
  State extends ContextState,
  Preloads extends { [name: string]: PreloadCreator<I> },
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
>({
  context,
  ...options
}: CreateLLMAgentOptions<I, O, State, Preloads, Memories>): LLMAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  State,
  {
    [name in keyof Preloads]: ExtractRunnableOutputType<
      ReturnType<Preloads[name]>["runnable"]
    >;
  },
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> }
> {
  const agentId = options.name || nanoid();

  const inputs = schemaToDataType(options.inputs);
  const outputs = schemaToDataType(options.outputs);

  const preloads = preloadCreatorsToPreloads(inputs, options.preloads);

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
      preloads,
      primaryMemoryId: primaryMemoryNames?.at(0),
      memories,
      modelOptions: options.modelOptions,
      messages,
    },
    context,
  );
}
