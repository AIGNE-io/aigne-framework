import type { LLMModelConfiguration } from "./llm-model";
import type { Memorable } from "./memorable";
import type { Runnable, RunnableDefinition } from "./runnable";

export interface ContextState {
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface ContextConfig {
  llmModel?: LLMModelConfiguration;
}

export interface Context<
  State extends ContextState = ContextState,
  Config extends ContextConfig = ContextConfig,
> {
  id: string;

  state: State;

  config: Config;

  historyManager?: Memorable<{ input: object; output: object }>;

  resolve<T extends Runnable>(id: string | RunnableDefinition | T): Promise<T>;

  register<R extends Array<RunnableDefinition | Runnable> = []>(
    ...definition: R
  ): void;

  resolveDependency<T>(token: string | symbol): T;
}
