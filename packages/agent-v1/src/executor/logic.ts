import crypto from "node:crypto";

import { Sandbox } from "@blocklet/quickjs";
import { call, getComponentMountPoint } from "@blocklet/sdk/lib/component";
import config from "@blocklet/sdk/lib/config";
import equal from "fast-deep-equal";
import Joi from "joi";
import pick from "lodash/pick";

import { parseIdentity, stringifyIdentity } from "../common/aid";
import logger from "../logger";
import { AssistantResponseType, type FunctionAssistant } from "../types";
import { renderMustacheStream } from "../types/assistant/mustache/ReadableMustache";
import { geti } from "../utils/geti";
import { nextId } from "../utils/task-id";
import { AgentExecutorBase } from "./base";

async function parseJSONInVM(str: string) {
  return Sandbox.callFunction({
    code: `\
function parse(json) {
  return eval(\`const j = \${json}; j\`)
}
`,
    filename: "parserJSONInVm.js",
    functionName: "parse",
    args: [str.trim()],
  });
}

export class LogicAgentExecutor extends AgentExecutorBase<FunctionAssistant> {
  override async process({ inputs }: { inputs: { [key: string]: any } }) {
    const {
      agent,
      options: { taskId },
    } = this;

    if (!agent.code) throw new Error(`Assistant ${agent.id}'s code is empty`);

    const args = Object.fromEntries(
      await Promise.all(
        (agent.parameters ?? [])
          .filter((i): i is typeof i & { key: string } => !!i.key && !i.hidden)
          .map(async (i) => [i.key, inputs?.[i.key] ?? i.defaultValue]),
      ),
    );

    const $json = (variables: any, ...rest: any[]) => {
      const taggedFn = async (t: TemplateStringsArray, ...rest: any[]) => {
        const template = t
          .map((s, i) => `${s}${i === t.length - 1 ? "" : rest[i]}`)
          .join("");

        const renderCtx = {
          ...args,
          ...variables,
          ...this.globalContext,
          get: () => async (template: string, render: Function) => {
            const s = await render(template);
            return geti(renderCtx, s);
          },
          runAgent: () => async (template: string, render: Function) => {
            const t = (await parseJSONInVM(template))?.template;

            const s = await render(template);
            const j = await parseJSONInVM(s);
            const { agentId, inputs } = await Joi.object<{
              agentId: string;
              inputs: any;
            }>({
              agentId: Joi.string().required(),
              inputs: Joi.object().pattern(Joi.string(), Joi.any()).required(),
            }).validateAsync(j, { stripUnknown: true });

            const a = await this.context.getAgent({
              aid: stringifyIdentity({
                ...parseIdentity(agent.identity.aid, { rejectWhenError: true }),
                agentId,
              }),
              working: agent.identity.working,
              rejectOnEmpty: true,
            });

            const result = await this.context.execute(a, {
              taskId: nextId(),
              parentTaskId: taskId,
              inputs,
            });
            return this.renderMessage(
              t,
              { ...renderCtx, $result: result },
              { escapeJsonSymbols: true },
            );
          },
        };

        const result = renderMustacheStream(template, (enqueue) => ({
          ...renderCtx,
          runAgent: () => enqueue(renderCtx.runAgent()),
        }));

        let object: any;

        for await (const chunk of result) {
          const newObj = await parseJSONInVM(chunk);

          // skip if the object is equal
          // TODO: throttle the output
          if (equal(object, newObj)) {
            continue;
          }

          object = newObj;

          try {
            const obj = await this.validateOutputs({
              outputs: object,
              partial: true,
            });

            this.context.callback?.({
              type: AssistantResponseType.CHUNK,
              taskId,
              assistantId: agent.id,
              delta: { object: obj },
            });
          } catch (error) {
            logger.error("validate LLM outputs error", error, object);
          }
        }

        return object;
      };

      // 支持 $json({foo:"xxx"})`` 和 $json`` 两种调用方式
      if (Array.isArray(variables)) {
        return taggedFn(variables as any as TemplateStringsArray, ...rest);
      }

      return taggedFn;
    };

    const log = (...args: any) =>
      this.context.callback({
        type: AssistantResponseType.LOG,
        log: JSON.stringify(args),
        timestamp: Date.now(),
        taskId,
        assistantId: agent.id,
      });

    const global = {
      console: <typeof console>{
        // NOTE: do not return logger.xxx result, it will cause memory leak
        log: (...args) => log(...args),
        info: (...args) => log(...args),
        debug: (...args) => log(...args),
        warn: (...args) => log(...args),
        error: (...args) => log(...args),
      },
      getComponentMountPoint,
      call: (...args: Parameters<typeof call>) =>
        call(...args).then((res) => ({ data: res.data })),
      crypto: { randomInt: crypto.randomInt },
      config: {
        env: pick(config.env, "appId", "appName", "appDescription", "appUrl"),
      },
    };

    const allArgs = {
      $json,
      runAgent: async ({
        agentId,
        inputs,
        streaming,
      }: {
        agentId: string;
        inputs: { [key: string]: any };
        streaming?: boolean;
      }) => {
        const a = await this.context.getAgent({
          aid: stringifyIdentity({
            ...parseIdentity(agent.identity.aid, { rejectWhenError: true }),
            agentId,
          }),
          working: agent.identity.working,
          rejectOnEmpty: true,
        });

        const { callback } = this.context;
        const currentTaskId = nextId();

        return this.context
          .copy(
            streaming
              ? {
                  callback: function hello(args) {
                    callback(args);

                    if (
                      args.type === AssistantResponseType.CHUNK &&
                      args.delta.content &&
                      args.taskId === currentTaskId
                    ) {
                      callback({ ...args, taskId });
                    }
                  },
                }
              : {},
          )
          .execute(a, { taskId: currentTaskId, parentTaskId: taskId, inputs });
      },
      ...this.globalContext,
      ...args,
    };
    const argKeys = Object.keys(allArgs);

    const resultPromise = await Sandbox.callFunction({
      code: `\
async function main({${argKeys.join(", ")}) {
  ${agent.code}
}
`,
      filename: `${agent.name || agent.id}.js`,
      global,
      functionName: "main",
      args: [allArgs],
    });

    return resultPromise;
  }
}
