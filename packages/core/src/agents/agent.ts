import EventEmitter from "node:events";
import { type ZodObject, z } from "zod";
import type { Context } from "../execution-engine/context";
import { logger } from "../utils/logger";
import { type TransferAgentOutput, transferAgentOutputKey } from "./types";

export type AgentInput = Record<string, unknown>;

export type AgentOutput = Record<string, unknown> &
  Partial<TransferAgentOutput>;

export interface AgentOptions {
  subscribeTopic?: string | string[];

  publishTopic?: string | string[];

  name?: string;

  description?: string;

  inputSchema?: ZodObject<any>;

  outputSchema?: ZodObject<any>;

  tools?: Agent[];

  skills?: Agent[];
}

export abstract class Agent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends EventEmitter {
  constructor(options: AgentOptions) {
    super();

    this.name = options.name || this.constructor.name;
    this.description = options.description;
    this.inputSchema = options.inputSchema || z.object({});
    this.outputSchema = options.outputSchema || z.object({});
    this.subscribeTopic = options.subscribeTopic;
    this.publishTopic = options.publishTopic;
    this.tools = options.tools || [];
    this.skills = options.skills || [];
  }

  name: string;

  description?: string;

  inputSchema: ZodObject<any>;

  outputSchema: ZodObject<any>;

  subscribeTopic?: string | string[];

  publishTopic?: string | string[];

  tools: Agent[];

  skills: Agent[];

  async call(input: I, context?: Context): Promise<O> {
    const parsedInput = this.inputSchema.passthrough().parse(input) as I;

    logger.debug(`Agent ${this.constructor.name} start`, parsedInput);

    const output = await this.process(parsedInput, context);

    const parsedOutput = this.outputSchema.passthrough().parse(output) as O;

    logger.debug(`Agent ${this.constructor.name} end`, {
      ...parsedOutput,
      [transferAgentOutputKey]:
        parsedOutput[transferAgentOutputKey]?.agent?.name,
    });

    return parsedOutput;
  }

  abstract process(input: I, context?: Context): Promise<O>;
}
