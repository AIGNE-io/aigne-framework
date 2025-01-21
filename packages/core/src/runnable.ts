import type { Context, ContextState } from "./context";
import type { DataType } from "./definitions/data-type";
import { OrderedRecord } from "./utils/ordered-map";

export interface RunOptions {
  stream?: boolean;
}

export type RunnableResponse<T> = T | RunnableResponseStream<T>;

export type RunnableInput = Record<string, any>;

export type RunnableOutput = Record<string, any>;

export abstract class Runnable<
  I extends RunnableInput = RunnableInput,
  O extends RunnableOutput = RunnableOutput,
  State extends ContextState = ContextState,
> {
  constructor(
    public definition: RunnableDefinition,
    public context?: Context<State>,
  ) {
    context?.register(this);

    this.inputs = Object.fromEntries(
      OrderedRecord.map(definition.inputs, (i) => [i.name || i.id, i]),
    ) as typeof this.inputs;
    this.outputs = Object.fromEntries(
      OrderedRecord.map(definition.outputs, (i) => [i.name || i.id, i]),
    ) as typeof this.outputs;
  }

  get id() {
    return this.definition.id;
  }

  get name() {
    return this.definition.name;
  }

  inputs: { [key in keyof I]: DataType };

  outputs: { [key in keyof O]: DataType };

  abstract run(
    input: I,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<O>>;
  abstract run(input: I, options?: RunOptions & { stream?: false }): Promise<O>;
  abstract run(input: I, options?: RunOptions): Promise<RunnableResponse<O>>;
}

export interface RunnableDefinition {
  id: string;

  type: string;

  name?: string;

  description?: string;

  inputs: OrderedRecord<RunnableInputType>;

  outputs: OrderedRecord<RunnableOutputType>;
}

export type RunnableInputType = DataType;

export type RunnableOutputType = DataType;

export interface RunnableResponseDelta<T> {
  $text?: string;
  delta?: Partial<T>;
}

export interface RunnableResponseError {
  error: {
    message: string;
  };
}

// NOTE: 不要把 RunnableResponseError 放在 RunnableResponseChunk 中，因为 error chunk 仅在 http 传输过程中使用，
// 而 client 中的 runnable 框架应该自动识别 error chunk 并抛出异常
export type RunnableResponseChunk<T> = RunnableResponseDelta<T>;

export type RunnableResponseChunkWithError<T> =
  | RunnableResponseChunk<T>
  | RunnableResponseError;

export function isRunnableResponseDelta<T>(
  chunk: RunnableResponseChunkWithError<T>,
): chunk is RunnableResponseDelta<T> {
  return "$text" in chunk || "delta" in chunk;
}

export function isRunnableResponseError<T>(
  chunk: RunnableResponseChunkWithError<T>,
): chunk is RunnableResponseError {
  return "error" in chunk;
}

export type RunnableResponseStream<T> = ReadableStream<
  RunnableResponseChunk<T>
>;
