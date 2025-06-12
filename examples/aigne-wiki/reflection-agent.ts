import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type Message,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

const DEFAULT_MAX_ITERATIONS = 3;

export interface ReflectionAgentOptions<I extends Message = Message, RO extends Message = Message>
  extends AgentOptions<I, I> {
  editor: Agent<I, I>;
  reviewer: Agent<I, RO>;
  isApproved?: (result: RO) => PromiseOrValue<boolean>;
  maxIterations?: number;
}

export class ReflectionAgent<
  I extends Message = Message,
  RO extends Message = Message,
> extends Agent<I, I> {
  constructor(options: ReflectionAgentOptions<I, RO>) {
    super(options);

    this.editor = options.editor;
    this.reviewer = options.reviewer;
    this.isApproved = options.isApproved;
    this.maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  }

  editor: Agent<I, I>;

  reviewer: Agent<I, RO>;

  isApproved?: (result: RO) => PromiseOrValue<boolean>;

  maxIterations: number;

  override async process(input: I, options: AgentInvokeOptions): Promise<AgentProcessResult<I>> {
    let previousResult = input;
    let reviewResult: RO | undefined;
    let iterations = 0;

    do {
      reviewResult = await options.context.invoke(this.reviewer, previousResult);
      const isApproved = await this.isApproved?.(reviewResult);
      if (isApproved === true) {
        return previousResult;
      }
      previousResult = await options.context.invoke(this.editor, {
        ...previousResult,
        ...reviewResult,
      });
    } while (++iterations < this.maxIterations);

    return previousResult;
  }
}
