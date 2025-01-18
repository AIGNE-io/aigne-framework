import { logger } from "@blocklet/sdk/lib/config";
import pick from "lodash/pick";

import type { GetAgentResult } from "../assistant/type";
import { parseIdentity, stringifyIdentity } from "../common/aid";
import {
  AssistantResponseType,
  type CallAssistant,
  type OutputVariable,
  RuntimeOutputVariable,
  type Tool,
} from "../types";
import { isNonNullable } from "../utils/is-non-nullable";
import { nextId } from "../utils/task-id";
import { AgentExecutorBase } from "./base";

export class CallAgentExecutor extends AgentExecutorBase<CallAssistant> {
  private async getCalledAgents(agent: CallAssistant & GetAgentResult) {
    if (!agent.agents || agent.agents.length === 0) {
      throw new Error("Must choose an agent to execute");
    }

    const identity = parseIdentity(agent.identity.aid, {
      rejectWhenError: true,
    });

    return await Promise.all(
      agent.agents.map(async (item) => ({
        item,
        agent: await this.context.getAgent({
          aid: stringifyIdentity({
            blockletDid: identity.blockletDid,
            projectId: identity.projectId,
            projectRef: identity.projectRef,
            agentId: item.id,
          }),
          working: agent.identity.working,
          rejectOnEmpty: true,
        }),
      })),
    );
  }

  private getLastTextSteamAgentId(
    calledAgents: { item: Tool; agent: GetAgentResult }[],
  ) {
    const map: { [key: string]: string } = {};
    calledAgents.forEach((item) => {
      const foundText = item.agent.outputVariables?.find(
        (i) => i.name === RuntimeOutputVariable.text,
      );
      if (foundText) map[RuntimeOutputVariable.text] = item.item.id;
    });

    return map[RuntimeOutputVariable.text];
  }

  private getOutputVariables(
    agent: CallAssistant & GetAgentResult,
    calledAgents: { item: Tool; agent: GetAgentResult }[],
  ) {
    const agentOutputVariables: OutputVariable[] = calledAgents.flatMap(
      (item) => item.agent.outputVariables || [],
    );

    const outputVariables = (agent?.outputVariables || []).map((i) => {
      if (i.from?.type === "output") {
        const fromId = i.from.id;
        const output = agentOutputVariables.find((r) => r.id === fromId);
        if (output) return output;
      }

      return i;
    });

    return outputVariables;
  }

  override async process(options: { inputs: { [key: string]: any } }) {
    const { agent } = this;

    if (!agent.agents || agent.agents.length === 0) {
      throw new Error("Must choose an agent to execute");
    }

    const calledAgents = await this.getCalledAgents(agent);

    // 获取最后输出的文本流
    const lastAgentIdWithTextSteam = this.getLastTextSteamAgentId(calledAgents);

    const outputVariables = this.getOutputVariables(agent, calledAgents);
    const hasTextStream = outputVariables?.some(
      (i) => i.name === RuntimeOutputVariable.text,
    );

    // 获取被调用的 agent
    const fn = async (callAgent: { item: Tool; agent: GetAgentResult }) => {
      const parameters = Object.fromEntries(
        await Promise.all(
          Object.entries(callAgent.item.parameters || {}).map(
            async ([key, value]) => {
              return [
                key,
                value
                  ? await this.renderMessage(value)
                  : options.inputs?.[key] || "",
              ];
            },
          ),
        ),
      );

      const taskId = nextId();
      const result = await this.context
        .copy({
          callback: (message) => {
            this.context.callback?.(message);

            // 如果是文本流，并 assistantId 是最后一个，则转发给上层
            if (
              hasTextStream &&
              message.type === AssistantResponseType.CHUNK &&
              message.delta.content &&
              message.assistantId &&
              message.assistantId === lastAgentIdWithTextSteam &&
              message.taskId === taskId
            ) {
              this.context.callback?.({ ...message, ...options });
            }
          },
        })
        .executor(callAgent.agent, {
          inputs: { ...(options.inputs || {}), ...(parameters || {}) },
          taskId,
          parentTaskId: this.options.taskId,
        })
        .execute();

      return result;
    };

    const obj = {};

    for (const agent of calledAgents) {
      Object.assign(obj, ...[await fn(agent)].flat());
    }

    const result = pick(
      obj,
      outputVariables.map((i) => i.name).filter(isNonNullable),
    );

    logger.info("parallel call agent output", JSON.stringify(obj, null, 2));
    logger.info("filter call agent output", JSON.stringify(result, null, 2));

    return result;
  }
}
