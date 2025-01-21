import { nanoid } from "nanoid";

import type { Memorable } from "../memorable";
import type { RunnableInputType } from "../runnable";
import { OrderedRecord } from "../utils";
import type { DataSchema } from "./data-schema";

export interface AgentMemory {
  id: string;

  name?: string;

  memory?: Memorable<unknown>;

  query?: {
    from: "variable";
    fromVariableId?: string;
    fromVariablePropPath?: string[];
  };

  options?: {
    k?: number;
  };
}

export interface CreateRunnableMemory<
  I extends { [key: string]: DataSchema } = {},
> {
  /**
   * Memory instance to query/store memory.
   */
  memory: Memorable<any>;

  /**
   * Custom query to retrieve memory, if not provided, all input variables will be used.
   *
   * @example
   * {
   *   fromVariable: 'question' // question is a string input variable
   * }
   */
  query?: {
    /**
     * Variable name from input used to query memory.
     */
    fromVariable?: keyof {
      [key in keyof I as I[key]["type"] extends "string" ? key : never]: any;
    };
  };

  /**
   * Custom options for memory query.
   */
  options?: {
    /**
     * Number of memories to retrieve.
     */
    k?: number;
  };
}

export function toRunnableMemories<I extends {}>(
  agentName: string,
  inputs: OrderedRecord<RunnableInputType>,
  memories: { [name: string]: CreateRunnableMemory<I> },
): OrderedRecord<AgentMemory> {
  return OrderedRecord.fromArray<AgentMemory>(
    Object.entries(memories).map(([name, { memory, query, options }]) => {
      const queryFromVariable = query?.fromVariable
        ? OrderedRecord.find(inputs, (j) => j.name === query.fromVariable)
        : null;
      if (query?.fromVariable && !queryFromVariable)
        throw new Error(
          `LLMAgent ${agentName} -> Memory ${name} -> Query variable ${query.fromVariable.toString()} not found`,
        );

      return {
        id: name || nanoid(),
        name,
        memory,
        query: queryFromVariable
          ? { from: "variable", fromVariableId: queryFromVariable.id }
          : undefined,
        options,
      };
    }),
  );
}
