import {
  type Agent,
  AIAgent,
  type AIAgentOptions,
  type AIAgentToolChoice,
  type Message,
} from "@aigne/core";
import { type Instructions, instructionsToPromptBuilder } from "@aigne/core/loader/schema.js";
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
    interface AIAgentLoadSchema {
      instructions?: Instructions;
      autoReorderSystemMessages?: boolean;
      autoMergeSystemMessages?: boolean;
      inputKey?: string;
      inputFileKey?: string;
      outputKey?: string;
      outputFileKey?: string;
      toolChoice?: AIAgentToolChoice;
      toolCallsConcurrency?: number;
      keepTextInToolUses?: boolean;
    }

    const schema = AIAgent.schema<AIAgentLoadSchema>(options);
    const valid = await schema.parseAsync(options.parsed);
    return new AgentSkillManagerAgent<I, O>({
      ...options.parsed,
      ...valid,
      instructions: valid.instructions && instructionsToPromptBuilder(valid.instructions),
    });
  }

  constructor(options: AgentSkillManagerOptions<I, O>) {
    super({
      ...options,
      instructions: options.instructions || AgentSkillManagerSystemPrompt,
    });
  }
}
