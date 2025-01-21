import { get, isNil } from "lodash";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";

import { Agent, type AgentProcessOptions } from "./agent";
import { StreamTextOutputName, TYPES } from "./constants";
import type { Context, ContextState } from "./context";
import type { DataType } from "./definitions/data-type";
import {
  type DataTypeSchema,
  type SchemaMapType,
  schemaToDataType,
} from "./definitions/data-type-schema";
import {
  type CreateRunnableMemory,
  toRunnableMemories,
} from "./definitions/memory";
import logger from "./logger";
import type { MemorableSearchOutput, MemoryItemWithScore } from "./memorable";
import type {
  Runnable,
  RunnableDefinition,
  RunnableOutput,
  RunnableResponseDelta,
} from "./runnable";
import { isNonNullable } from "./utils/is-non-nullable";
import type { MakeNullablePropertyOptional } from "./utils/nullable";
import { OrderedRecord } from "./utils/ordered-map";
import type { ExtractRunnableInputType } from "./utils/runnable-type";

@injectable()
export class PipelineAgent<
  I extends { [key: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
  Memories extends { [name: string]: MemoryItemWithScore[] } = {},
> extends Agent<I, O, State, {}, Memories> {
  static create = create;

  constructor(
    @inject(TYPES.definition)
    public override definition: PipelineAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
  ) {
    super(definition, context);
  }

  async process(input: I, options: AgentProcessOptions<{}, Memories>) {
    const { definition, context } = this;
    if (!context) throw new Error("Context is required");

    const { processes } = definition;

    if (!processes?.$indexes.length) {
      throw new Error("No processes defined");
    }

    return new ReadableStream<RunnableResponseDelta<O>>({
      async start(controller) {
        try {
          // NOTE: 将 input 转换为 variables，其中 key 为 inputId，value 为 input 的值
          const variables: { [processId: string]: any } = {
            ...options.memories,
            ...Object.fromEntries(
              OrderedRecord.map(definition.inputs, (i) => {
                const value = input[i.name || i.id];
                if (isNil(value)) return null;

                return [i.id, value];
              }).filter(isNonNullable),
            ),
          };

          const outputs = OrderedRecord.toArray(definition.outputs);

          const textStreamOutput = outputs.find(
            (i) => i.name === StreamTextOutputName,
          );

          let result: Partial<O> = {};

          for (const process of OrderedRecord.iterator(processes)) {
            if (!process.runnable?.id) {
              logger.warn("Runnable id is required for process", process);
              continue;
            }

            const runnable = await context.resolve(process.runnable.id);
            if (!runnable) continue;

            const inputValues = Object.fromEntries(
              Object.entries(process.input ?? {})
                .map(([inputId, input]) => {
                  const targetInput = runnable.definition.inputs?.[inputId];
                  if (!targetInput?.name) return null;

                  let value: any;

                  if (input.from === "variable") {
                    const v = variables[input.fromVariableId!];
                    value = input.fromVariablePropPath?.length
                      ? get(v, input.fromVariablePropPath)
                      : v;
                  } else {
                    throw new Error("Unsupported input source");
                  }

                  return [targetInput.name, value];
                })
                .filter(isNonNullable),
            );

            const stream = await runnable.run(inputValues, { stream: true });

            const needRespondTextStream =
              textStreamOutput?.from === "variable" &&
              textStreamOutput.fromVariableId === process.id;
            // const needRespondJsonStream = outputs.some(
            //   (i) => i.name !== StreamTextOutputName && i.from === 'variable' && i.fromVariableId === process.id
            // );

            const processResult: { $text?: string; [key: string]: any } = {};
            variables[process.id] = processResult;

            for await (const chunk of stream) {
              if (chunk.$text) {
                Object.assign(processResult, {
                  $text: (processResult.$text || "") + chunk.$text,
                });

                if (needRespondTextStream) {
                  controller.enqueue({ $text: chunk.$text });
                }
              }

              if (chunk.delta) {
                Object.assign(processResult, chunk.delta);

                // TODO: 这里需要考虑上层 agent 直接输出了 {$text: 'xxx'} 没有用 chunk 的方式返回的情况
                // if (needRespondJsonStream) {
                result = Object.fromEntries(
                  OrderedRecord.map(definition.outputs, (output) => {
                    if (!output.name) return null;
                    if (output.name === StreamTextOutputName) return null;

                    let value: any;
                    if (output.from === "variable") {
                      const v = variables[output.fromVariableId!];
                      value = output.fromVariablePropPath?.length
                        ? get(v, output.fromVariablePropPath)
                        : v;
                    } else {
                      throw new Error(
                        `Unsupported output source ${output.from}`,
                      );
                    }

                    return [output.name, value];
                  }).filter(isNonNullable),
                );

                controller.enqueue({ delta: result });
                // }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });
  }
}

// TODO: do not use `any`, make input type more strict
// type VariableWithPropPath<
//   Vars extends { [name: string]: DataTypeSchema },
//   Processes extends { [name: string]: PipelineAgentProcessParameter<Vars> },
//   Var extends keyof Vars | keyof Processes = keyof Vars | keyof Processes,
// > = {
//   fromVariable: Var;
//   // fromVariablePropPath?: VariablePaths<Vars, Var>;
//   fromVariablePropPath?: string[];
// };

// type VariablePaths<
//   Vars extends { [name: string]: DataTypeSchema },
//   Var extends keyof Vars = keyof Vars,
// > = Vars[Var] extends DataTypeSchemaObject ? Array<keyof Vars[Var]['properties']> : never;

type VariableWithPropPath = {
  fromVariable: string;
  fromVariablePropPath?: (string | number)[];
};

export type PipelineAgentProcessParameter<
  // I extends { [name: string]: DataTypeSchema },
  // _Processes extends { [name: string]: PipelineAgentProcessParameter<I> } = {},
  R extends Runnable = any,
  RI extends { [name: string]: DataTypeSchema } = ExtractRunnableInputType<R>,
> = {
  runnable: R;
  input: MakeNullablePropertyOptional<{
    [key in keyof RI]: VariableWithPropPath;
  }>;
};

function create<
  I extends { [name: string]: DataTypeSchema },
  O extends {
    [name: string]: DataTypeSchema & {
      fromVariable: string;
      fromVariablePropPath?: string[];
    };
  },
  State extends ContextState,
  Memories extends { [name: string]: CreateRunnableMemory<I> },
  Processes extends { [name: string]: PipelineAgentProcessParameter },
>({
  context,
  ...options
}: {
  context: Context<State>;

  name?: string;

  inputs: I;

  outputs: O;

  memories?: Memories;

  processes: Processes;
}): PipelineAgent<
  SchemaMapType<I>,
  SchemaMapType<O>,
  State,
  { [name in keyof Memories]: MemorableSearchOutput<Memories[name]["memory"]> }
> {
  const agentId = options.name || nanoid();
  const inputs = schemaToDataType(options.inputs);

  const memories = toRunnableMemories(agentId, inputs, options.memories || {});

  const processes: OrderedRecord<PipelineAgentProcess> =
    OrderedRecord.fromArray([]);

  for (const [name, p] of Object.entries(options.processes)) {
    OrderedRecord.push(processes, {
      id: nanoid(),
      name: name || p.runnable?.name,
      runnable: { id: p.runnable.id },
      input: Object.fromEntries(
        OrderedRecord.map<
          [string, NonNullable<PipelineAgentProcess["input"]>[string]] | null,
          DataType
        >(p.runnable.definition.inputs, (inputOfProcess) => {
          const i = p.input[inputOfProcess.name || inputOfProcess.id];
          if (!i) {
            if (inputOfProcess.required) {
              throw new Error(
                `Input ${inputOfProcess.name || inputOfProcess.id} for case ${p.runnable.name || p.runnable.id} is required`,
              );
            }

            // ignore optional input
            return null;
          }

          const inputFromPipeline =
            OrderedRecord.find(
              inputs,
              (input) => input.name === i.fromVariable,
            ) ||
            OrderedRecord.find(processes, (p) => p.name === i.fromVariable);

          if (!inputFromPipeline)
            throw new Error(`Input ${i.fromVariable.toString()} not found`);

          return [
            inputOfProcess.id,
            {
              from: "variable",
              fromVariableId: inputFromPipeline.id,
              fromVariablePropPath: i.fromVariablePropPath,
            },
          ];
        }).filter(isNonNullable),
      ),
    });
  }

  const outputs = OrderedRecord.fromArray<PipelineAgentOutput>(
    OrderedRecord.map(schemaToDataType(options.outputs), (output) => {
      const { fromVariable, fromVariablePropPath } =
        options.outputs[output.name!]!;

      const from =
        OrderedRecord.find(inputs, (i) => i.name === fromVariable) ||
        OrderedRecord.find(processes, (p) => p.name === fromVariable);

      if (!from)
        throw new Error(
          `Output ${output.name} not found in inputs or processes`,
        );

      return {
        ...output,
        from: "variable",
        fromVariableId: from.id,
        fromVariablePropPath,
      };
    }),
  );

  return new PipelineAgent(
    {
      id: agentId,
      name: options.name,
      type: "pipeline_agent",
      inputs,
      memories,
      outputs,
      processes,
    },
    context,
  );
}

export interface PipelineAgentDefinition extends RunnableDefinition {
  type: "pipeline_agent";

  processes?: OrderedRecord<PipelineAgentProcess>;

  outputs: OrderedRecord<PipelineAgentOutput>;
}

export type PipelineAgentOutput = RunnableOutput & {
  from: "variable";
  fromVariableId?: string;
  fromVariablePropPath?: (string | number)[];
};

export type PipelineAgentProcess = {
  id: string;
  name?: string;
  runnable?: {
    id?: string;
  };
  input?: {
    [inputId: string]: {
      from: "variable";
      fromVariableId?: string;
      fromVariablePropPath?: (string | number | symbol)[];
    };
  };
};
