import { callBlockletApi } from "../libs/openapi/request";
import type { BlockletAgent } from "../types";
import { AgentExecutorBase } from "./base";

export class BlockletAgentExecutor extends AgentExecutorBase<BlockletAgent> {
  override async process({ inputs }: { inputs: { [key: string]: any } }) {
    const blocklet = await this.context.getBlockletAgent(this.agent.id);

    if (!blocklet.agent) {
      throw new Error("Blocklet agent api not found.");
    }

    if (!blocklet.agent.openApi) {
      throw new Error("Blocklet agent api not found.");
    }

    const params: { [key: string]: string | undefined } = {
      userId: this.context.user?.did,
      projectId: this.context.entryProjectId,
      sessionId: this.context.sessionId,
      assistantId: this.agent.id,
    };

    const response = await callBlockletApi(
      blocklet.agent.openApi,
      inputs || {},
      { user: this.context.user, params },
    );

    return response.data;
  }
}
