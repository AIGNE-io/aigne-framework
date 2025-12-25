import { AIAgent, type AIAgentOptions, type Message } from "@aigne/core";
import { AgentSkillManagerSystemPrompt } from "./prompt.js";

export interface AgentSkillManagerOptions<I extends Message = Message, O extends Message = Message>
  extends AIAgentOptions<I, O> {}

export default class AgentSkillManagerAgent<
  I extends Message = Message,
  O extends Message = Message,
> extends AIAgent<I, O> {
  constructor(options: AgentSkillManagerOptions<I, O>) {
    super({
      instructions: AgentSkillManagerSystemPrompt,
      ...options,
    });
  }
}
