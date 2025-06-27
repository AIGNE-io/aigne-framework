import jsonata from "jsonata";
import { Agent, type AgentOptions, type Message } from "./agent.js";

export interface TransformAgentOptions<I extends Message, O extends Message>
  extends AgentOptions<I, O> {
  jsonata: string;
}

export class TransformAgent<I extends Message = Message, O extends Message = Message> extends Agent<
  I,
  O
> {
  static type = "TransformAgent";

  static from<I extends Message, O extends Message>(options: TransformAgentOptions<I, O>) {
    return new TransformAgent(options);
  }

  constructor(options: TransformAgentOptions<I, O>) {
    super(options);
    this.jsonata = options.jsonata;
  }

  private jsonata: string;

  async process(input: I): Promise<O> {
    return await jsonata(this.jsonata).evaluate(input);
  }
}
