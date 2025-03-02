import { omit } from "lodash";
import type { ZodType } from "zod";
import type { ChatModel } from "../models/chat";
import type { Runtime } from "../runtime";
import { logger } from "../utils/logger";
import { type TransferAgentOutput, transferAgentOutputKey } from "./types";

export type AgentInput = Record<string, unknown>;

export type AgentOutput = Record<string, unknown> &
  Partial<TransferAgentOutput>;

export interface AgentOptions {
  name?: string;

  inputSchema?: ZodType;

  outputSchema?: ZodType;
}

export interface AgentRunOptions {
  runtime?: Runtime;
  model?: ChatModel;
}

export abstract class Agent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> {
  constructor(public options: AgentOptions) {}

  async run(input: I, options?: AgentRunOptions): Promise<O> {
    const i = this.options.inputSchema
      ? this.options.inputSchema.parse(input)
      : input;

    logger.debug(`Agent ${this.constructor.name} start`, i);

    const output = await this.process(i, options);

    const result = this.options.outputSchema
      ? this.options.outputSchema.parse(output)
      : output;

    logger.debug(`Agent ${this.constructor.name} end`, {
      ...result,
      [transferAgentOutputKey]:
        result[transferAgentOutputKey]?.agent?.options?.name,
    });

    return result;
  }

  abstract process(input: I, options?: AgentRunOptions): Promise<O>;
}
