import type { FunctionAgentFn, FunctionAgentOptions, Message } from "./agent.js";
import { Agent, FunctionAgent } from "./agent.js";

/**
 * Decorator to wrap a function into a FunctionAgent with custom schemas
 */
export function agent<I extends Message = Message, O extends Message = Message>(
  options?: Omit<FunctionAgentOptions<I, O>, "process">,
) {
  return <T extends FunctionAgentFn<I, O>>(
    target: T,
    context?: ClassMethodDecoratorContext | ClassFieldDecoratorContext,
  ): FunctionAgent<I, O> => {
    const agentName = options?.name || target.name || "AnonymousAgent";

    const agentOptions: FunctionAgentOptions<I, O> = {
      ...options,
      name: agentName,
      process: target,
    };

    const functionAgent = new FunctionAgent(agentOptions);

    if (context && context.kind === "method") {
      context.addInitializer?.(function () {
        if (this instanceof Agent) {
          this.addSkill(functionAgent);
        }
      });
    }

    return functionAgent;
  };
}
