import type { LLMModelConfiguration } from "./llm-model";
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
  state: State;

  config: Config;

  resolve<T extends Runnable>(id: string | RunnableDefinition | T): Promise<T>;

  register<R extends Array<RunnableDefinition | Runnable> = []>(
    ...definition: R
  ): void;

  resolveDependency<T>(token: string | symbol): T;
}
