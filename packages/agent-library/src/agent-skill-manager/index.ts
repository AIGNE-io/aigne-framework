import {
  type Agent,
  AIAgent,
  type AIAgentLoadSchema,
  type AIAgentOptions,
  type Message,
} from "@aigne/core";
import { AgentSkillManagerSystemPrompt } from "./prompt.js";

export interface AgentSkillManagerOptions<I extends Message = Message, O extends Message = Message>
  extends AIAgentOptions<I, O> {}

export default class AgentSkillManagerAgent<
  I extends Message = Message,
  O extends Message = Message,
> extends AIAgent<I, O> {
  static override async load<I extends Message = any, O extends Message = any>(options: {
    filepath: string;
    parsed: object;
  }): Promise<Agent<I, O>> {
    const schema = AIAgent.schema<AIAgentLoadSchema>(options);
    const valid = await schema.parseAsync(options.parsed);
    return AIAgent.load({
      ...options,
      parsed: {
        ...options.parsed,
        instructions: valid.instructions || [
          { role: "system", content: AgentSkillManagerSystemPrompt, path: options.filepath },
        ],
      },
    });
  }
}
