import type { GetAgentResult } from "../assistant/type";
import { parseIdentity, stringifyIdentity } from "../common/aid";
import logger from "../logger";
import { AgentExecutor } from "./agent";
import { AIGCAgentExecutor } from "./aigc";
import { APIAgentExecutor } from "./api";
import {
  AgentExecutorBase,
  type AgentExecutorOptions,
  ExecutorContext,
} from "./base";
import { BlockletAgentExecutor } from "./blocklet";
import { CallAgentExecutor } from "./call-agent";
import { DecisionAgentExecutor } from "./decision";
import { ImageBlenderAgentExecutor } from "./image-blender";
import { LLMAgentExecutor } from "./llm";
import { LogicAgentExecutor } from "./logic";

export class RuntimeExecutor extends AgentExecutorBase<GetAgentResult> {
  constructor(
    context: Omit<ConstructorParameters<typeof ExecutorContext>[0], "executor">,
    agent: GetAgentResult,
    options: AgentExecutorOptions,
    private parentAgent?: GetAgentResult,
  ) {
    super(
      new ExecutorContext({
        ...context,
        executor(agent, options) {
          return new RuntimeExecutor(this, agent, options, agent);
        },
      }),
      agent,
      options,
    );
  }

  override async process() {
    // ignore
  }

  override async execute(): Promise<any> {
    const { agent, options } = this;

    if (this.parentAgent?.identity && agent.identity) {
      const parent = parseIdentity(this.parentAgent.identity.aid, {
        rejectWhenError: true,
      });
      const identity = parseIdentity(agent.identity.aid, {
        rejectWhenError: true,
      });

      agent.identity.aid = stringifyIdentity({
        ...identity,
        blockletDid: identity.blockletDid || parent.blockletDid,
        projectId: identity.projectId || parent.projectId,
        projectRef: identity.projectRef || parent.projectRef,
      });
      agent.identity.working ||= this.parentAgent.identity.working;
    }

    switch (agent.type) {
      case "agent": {
        return new AgentExecutor(this.context, agent, options).execute();
      }
      case "prompt": {
        return new LLMAgentExecutor(this.context, agent, options).execute();
      }
      case "image": {
        return new AIGCAgentExecutor(this.context, agent, options).execute();
      }
      case "api": {
        return new APIAgentExecutor(this.context, agent, options).execute();
      }
      case "function": {
        return new LogicAgentExecutor(this.context, agent, options).execute();
      }
      case "router": {
        return new DecisionAgentExecutor(
          this.context,
          agent,
          options,
        ).execute();
      }
      case "callAgent": {
        return new CallAgentExecutor(this.context, agent, options).execute();
      }
      case "blocklet": {
        return new BlockletAgentExecutor(
          this.context,
          agent,
          options,
        ).execute();
      }
      case "imageBlender": {
        return new ImageBlenderAgentExecutor(
          this.context,
          agent,
          options,
        ).execute();
      }
      default: {
        logger.error("Unsupported agent type", { agent });
        throw new Error(`Unsupported agent type: ${(agent as any)?.type}`);
      }
    }
  }
}
