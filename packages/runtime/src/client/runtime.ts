import {
  type Context,
  type ContextConfig,
  type ContextState,
  OrderedRecord,
  type Runnable,
  isNonNullable,
} from "@aigne/core";

import { DEFAULT_RUNTIME_ID } from "../constants";
import type { ProjectDefinition } from "../runtime";
import { Agent } from "./agent";
import { getRunnableDefinition } from "./api/runtime";
export interface AIGNERuntimeOptions {
  id?: string;

  projectDefinition?: ProjectDefinition;
}

export class AIGNERuntime<
  Agents extends { [name: string]: Runnable } = {},
  State extends ContextState = ContextState,
  Config extends ContextConfig = ContextConfig,
> implements Context<State>
{
  constructor(public readonly options?: AIGNERuntimeOptions) {
    const id =
      options?.id || options?.projectDefinition?.id || DEFAULT_RUNTIME_ID;
    if (!id) throw new Error("Runtime id is required");
    this.id = id;

    this.agents = Object.fromEntries(
      OrderedRecord.map(options?.projectDefinition?.runnables, (agent) => {
        if (!agent.name) return null;

        return [agent.name, new Agent(this, agent)];
      }).filter(isNonNullable),
    );
  }

  id: string;

  get state(): State {
    throw new Error("Method not implemented.");
  }

  get config(): Config {
    throw new Error("Method not implemented.");
  }

  agents: Agents;

  register(): void {
    throw new Error("Method not implemented.");
  }

  async resolve<T extends Runnable>(id: string): Promise<T> {
    const definition = await getRunnableDefinition({
      projectId: this.id,
      agentId: id,
    });

    return new Agent(this, definition) as unknown as T;
  }

  resolveDependency<T>(): T {
    throw new Error("Method not implemented.");
  }
}
