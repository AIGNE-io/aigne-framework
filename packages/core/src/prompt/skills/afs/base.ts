import { Agent, type Message } from "../../../agents/agent.js";

export abstract class AFSSkillBase<
  I extends Message = Message,
  O extends Message = Message,
> extends Agent<I, O> {
  override tag = "AFS";
}
