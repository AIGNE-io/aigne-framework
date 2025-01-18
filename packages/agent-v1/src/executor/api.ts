import axios, { isAxiosError } from "axios";
import { pick } from "lodash";

import type { ApiAssistant } from "../types";
import { AgentExecutorBase } from "./base";

export class APIAgentExecutor extends AgentExecutorBase<ApiAssistant> {
  override async process({ inputs }: { inputs: { [key: string]: any } }) {
    const { agent } = this;

    if (!agent.requestUrl)
      throw new Error(`Assistant ${agent.id}'s url is empty`);

    const args = Object.fromEntries(
      await Promise.all(
        (agent.parameters ?? [])
          .filter((i): i is typeof i & { key: string } => !!i.key && !i.hidden)
          .map(async (i) => [i.key, inputs?.[i.key] || i.defaultValue]),
      ),
    );

    const method = agent.requestMethod || "GET";
    const isGet = method === "get";

    try {
      const response = await axios({
        url: agent.requestUrl,
        method,
        params: isGet ? args : undefined,
        data: isGet ? undefined : args,
      });

      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        Object.assign(e, pick(e.response, "status", "statusText", "data"));
      }
      throw e;
    }
  }
}
