export interface RunOptions {
  stream?: boolean;
}

export interface StreamingResponseDelta {
  delta: {
    content: string;
  };
}

export type StreamingResponse<T> = ReadableStream<
  Partial<T> | StreamingResponseDelta
>;

export interface Runnable<
  I extends { [key: string]: any } = object,
  O = object,
> {
  run(
    input: I,
    options: RunOptions & { stream: true },
  ): Promise<StreamingResponse<O>>;
  run(input: I, options?: RunOptions & { stream?: false }): Promise<O>;
  run(input: I, options?: RunOptions): Promise<O | StreamingResponse<O>>;
}
