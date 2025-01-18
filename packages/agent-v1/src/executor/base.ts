import { hash } from "node:crypto";

import { memoize } from "@blocklet/quickjs";
import { call } from "@blocklet/sdk/lib/component";
import config from "@blocklet/sdk/lib/config";
import Joi from "joi";
import jsonStableStringify from "json-stable-stringify";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import pick from "lodash/pick";
import toLower from "lodash/toLower";

import type {
  CallAI,
  CallAIImage,
  GetAgent,
  GetAgentResult,
  RunAssistantCallback,
} from "../assistant/type";
import { parseIdentity, stringifyIdentity } from "../common/aid";
import { AIGNE_RUNTIME_COMPONENT_DID } from "../constants";
import { issueVC } from "../libs/blocklet/vc";
import type { DatasetObject } from "../libs/openapi/types";
import logger from "../logger";
import {
  AssistantResponseType,
  ExecutionPhase,
  type OutputVariable,
  type Parameter,
  type ProjectSettings,
  type RuntimeOutputProfile,
  RuntimeOutputVariable,
  type Variable,
  type VariableScope,
  isUserInputParameter,
  outputVariablesToJoiSchema,
} from "../types";
import {
  HISTORY_API_ID,
  KNOWLEDGE_API_ID,
  MEMORY_API_ID,
  getBlockletAgent,
} from "../utils/get-blocklet-agent";
import { isNonNullable } from "../utils/is-non-nullable";
import { renderMessage } from "../utils/render-message";
import { nextId } from "../utils/task-id";

export class ExecutorContext {
  constructor(
    options: Pick<
      ExecutorContext,
      | "entry"
      | "getAgent"
      | "callAI"
      | "callAIImage"
      | "callback"
      | "getMemoryVariables"
      | "user"
      | "sessionId"
      | "messageId"
      | "clientTime"
      | "executor"
      | "entryProjectId"
      | "queryCache"
      | "setCache"
    >,
  ) {
    this.entry = options.entry;
    this.getAgent = memoize(options.getAgent, {
      keyGenerator: (o) => [o.aid, o.working].filter(isNonNullable).join("/"),
    });
    this.callAI = options.callAI;
    this.callAIImage = options.callAIImage;
    this.callback = options.callback;
    this.getMemoryVariables = memoize(options.getMemoryVariables, {
      keyGenerator: (o) =>
        [o.blockletDid, o.projectId, o.projectRef, o.working]
          .filter(isNonNullable)
          .join("/"),
    });
    this.user = options.user;
    this.sessionId = options.sessionId;
    this.messageId = options.messageId;
    this.clientTime = options.clientTime;
    this.executor = options.executor;
    this.entryProjectId = options.entryProjectId;
    this.queryCache = options.queryCache;
    this.setCache = options.setCache;
  }

  entry: {
    blockletDid?: string;
    project: ProjectSettings;
    working?: boolean;
    appUrl?: string;
  };

  getAgent: GetAgent;

  callAI: CallAI;

  callAIImage: CallAIImage;

  queryCache: (options: { aid: string; cacheKey: string }) => Promise<{
    inputs: { [key: string]: any };
    outputs: { [key: string]: any };
  } | null>;

  setCache: (options: {
    aid: string;
    cacheKey: string;
    inputs: { [key: string]: any };
    outputs: { objects: any[] };
  }) => Promise<any>;

  callback: RunAssistantCallback;

  sessionId: string;

  messageId: string;

  clientTime: string;

  promise?: Promise<{
    agents: (GetAgentResult & { openApi: DatasetObject })[];
    agentsMap: { [key: string]: GetAgentResult & { openApi: DatasetObject } };
    openApis: DatasetObject[];
  }>;

  entryProjectId: string;

  user?: {
    id: string;
    did: string;
    role?: string;
    fullName?: string;
    provider?: string;
    walletOS?: string;
    isAdmin?: boolean;
  };

  getMemoryVariables: (options: {
    blockletDid?: string;
    projectId: string;
    projectRef?: string;
    working?: boolean;
  }) => Promise<Variable[]>;

  maxRetries = 5;

  executor: <T extends GetAgentResult>(
    agent: T,
    options: AgentExecutorOptions,
  ) => AgentExecutorBase<T>;

  async execute<T extends GetAgentResult>(
    agent: T,
    options: AgentExecutorOptions,
  ) {
    return this.executor(agent, options).execute();
  }

  copy(options: Partial<ExecutorContext>) {
    return new ExecutorContext({ ...this, ...options });
  }

  async getBlockletAgent(agentId: string) {
    this.promise ??= getBlockletAgent();

    const { openApis, agentsMap } = await this.promise;

    return { agent: agentsMap[agentId]!, openApis };
  }
}

export interface AgentExecutorOptions {
  inputs?: { [key: string]: any };
  taskId: string;
  parentTaskId?: string;
  variables?: { [key: string]: any };
}

export abstract class AgentExecutorBase<T> {
  constructor(
    public readonly context: ExecutorContext,
    public readonly agent: GetAgentResult & T,
    public readonly options: AgentExecutorOptions,
  ) {}

  abstract process(options: { inputs: { [key: string]: any } }): Promise<any>;

  async execute(): Promise<any> {
    const { agent, options } = this;

    this.context.callback?.({
      type: AssistantResponseType.INPUT,
      assistantId: agent.id,
      taskId: options.taskId,
      parentTaskId: options.parentTaskId,
      assistantName: agent.name,
      inputParameters: this.hideSecretInputs(options.inputs || {}, agent),
    });

    this.finalInputs = await this.prepareInputs();

    const partial = await this.validateOutputs({
      inputs: this.finalInputs,
      partial: true,
    });
    if (!isEmpty(partial)) {
      this.context.callback?.({
        type: AssistantResponseType.CHUNK,
        taskId: options.taskId,
        assistantId: agent.id,
        delta: { object: this.hideSecretInputs(partial, agent) },
      });
    }

    this.context.callback?.({
      type: AssistantResponseType.EXECUTE,
      taskId: options.taskId,
      parentTaskId: options.parentTaskId,
      assistantId: agent.id,
      assistantName: agent.name,
      execution: { currentPhase: ExecutionPhase.EXECUTE_ASSISTANT_RUNNING },
    });

    this.context.callback?.({
      type: AssistantResponseType.INPUT,
      assistantId: agent.id,
      taskId: options.taskId,
      parentTaskId: options.parentTaskId,
      assistantName: agent.name,
      inputParameters: this.hideSecretInputs(this.finalInputs, agent),
    });

    let result: any;

    // query cache if the agent has cache enabled
    const cacheKey = this.globalContext.$cache.key;
    if (agent.cache?.enable && agent.identity) {
      try {
        const cache = await this.context.queryCache({
          aid: agent.identity.aid,
          cacheKey,
        });
        if (cache) {
          result = await this.validateOutputs({
            inputs: this.finalInputs,
            outputs: cache.outputs,
          });
          if (isEmpty(result)) result = undefined;
        }
      } catch (error) {
        logger.error("query and validate cache error", { error });
      }

      if (typeof result?.$text === "string") {
        this.context.callback?.({
          type: AssistantResponseType.CHUNK,
          taskId: options.taskId,
          assistantId: agent.id,
          delta: { content: result.$text },
        });
      }
    }

    if (result === undefined) {
      const outputs = await this.process({ inputs: this.finalInputs });
      result = await this.validateOutputs({
        inputs: this.finalInputs,
        outputs,
        processCallAgentOutputs: true,
      });

      // set cache if needed
      if (!isEmpty(result) && agent.cache?.enable && agent.identity) {
        await this.context.setCache({
          aid: agent.identity.aid,
          cacheKey,
          inputs: this.finalInputs,
          outputs: result,
        });
      }
    }

    await this.postProcessOutputs(agent, { outputs: result });

    this.context.callback?.({
      type: AssistantResponseType.CHUNK,
      taskId: options.taskId,
      assistantId: agent.id,
      delta: { object: result },
    });

    this.context.callback?.({
      type: AssistantResponseType.EXECUTE,
      taskId: options.taskId,
      parentTaskId: options.parentTaskId,
      assistantId: agent.id,
      assistantName: agent.name,
      execution: { currentPhase: ExecutionPhase.EXECUTE_ASSISTANT_END },
    });

    return result;
  }

  private _finalInputs: { [key: string]: any } | undefined;

  private get finalInputs() {
    if (!this._finalInputs) throw new Error("Final inputs is not ready");
    return this._finalInputs;
  }

  private set finalInputs(value: NonNullable<typeof this._finalInputs>) {
    this._finalInputs = value;
  }

  private cacheKey({
    userRelated,
    onlyUserInputs,
  }: { userRelated?: boolean; onlyUserInputs?: boolean } = {}) {
    // TODO: support custom cache key by specifying inputs of agent
    const i = Object.fromEntries(
      (this.agent.parameters ?? [])
        .filter(
          (i): i is typeof i & { key: string } =>
            !!i.key &&
            !i.hidden &&
            (onlyUserInputs ? isUserInputParameter(i) : true),
        )
        .map((i) => [i.key, this.finalInputs[i.key]]),
    );

    return hash(
      "md5",
      jsonStableStringify({
        ...i,
        "$sys.user.did": userRelated
          ? this.globalContext.$sys.user?.did
          : undefined,
      })!,
      "hex",
    );
  }

  get globalContext() {
    const executor = this;
    const { agent } = this;

    return {
      $sys: {
        sessionId: this.context.sessionId,
        messageId: this.context.messageId,
        clientTime: this.context.clientTime,
        user: this.context.user,
        env: pick(config.env, "appId", "appName", "appDescription", "appUrl"),
      },
      $storage: {
        async getItem(
          key: string,
          {
            scope = "global",
            onlyOne,
          }: { scope?: VariableScope; onlyOne?: boolean } = {},
        ) {
          return executor.getMemory({ key, agentId: agent.id, scope, onlyOne });
        },
        async setItem(
          key: string,
          value: any,
          {
            scope = "global",
            onlyOne,
          }: { scope?: VariableScope; onlyOne?: boolean } = {},
        ) {
          return executor.setMemory({
            key,
            data: value,
            agentId: agent.id,
            scope,
            reset: onlyOne,
          });
        },
      },
      $cache: {
        get key() {
          return executor.cacheKey({ onlyUserInputs: true });
        },
        async getItem(key: string, { agentId }: { agentId?: string } = {}) {
          if (agent.type === "blocklet")
            throw new Error(
              "Unsupported calling query cache in blocklet agent",
            );
          const identity = parseIdentity(agent.identity.aid, {
            rejectWhenError: true,
          });
          return executor.context.queryCache({
            aid: stringifyIdentity({
              ...identity,
              agentId: agentId || identity.agentId,
            }),
            cacheKey: key,
          });
        },
      },
      $blocklet: {
        issueVC: (
          args: Omit<Parameters<typeof issueVC>[0], "userDid" | "project">,
        ) => {
          const userDid = executor.context.user?.did;
          if (!userDid) throw new Error("Issue VC requires user did");
          return issueVC({
            ...args,
            userDid,
            context: this.context,
          });
        },
      },
    };
  }

  private async prepareInputs() {
    const {
      agent,
      options: { inputs, taskId, variables },
    } = this;

    const inputParameters = Object.fromEntries(
      await Promise.all(
        (agent.parameters || [])
          .filter(
            (i): i is typeof i & { key: string } =>
              !!i.key && i.type !== "source" && !i.hidden,
          )
          .map(async (i) => {
            const inputValue = inputs?.[i.key!];

            if (
              typeof inputValue === "string" &&
              inputValue.match(/{{\s*\S+\s*}}/)
            ) {
              const template = String(inputValue || "").trim();
              return [
                i.key,
                template
                  ? await this.renderMessage(template, variables, {
                      stringify: false,
                    })
                  : inputValue,
              ];
            }

            // NOTE：不应该处理对象类型的参数，以后会逐步移除参数 template 的使用方式
            // 该方式会因为用户输入数据中存在非法的 mustach 语法导致渲染失败，同时也存在泄漏数据的风险：用户可以在输入数据中使用 `{{ xxx }}` 的方式拿到任意变量或者调用上下文函数

            // if (isPlainObject(inputValue)) {
            //   const resolvedEntries = await Promise.all(
            //     Object.entries(inputValue).map(async ([key, value]) => {
            //       return [
            //         key,
            //         typeof value === 'string'
            //           ? await this.renderMessage(value, variables, { stringify: false })
            //           : value,
            //       ];
            //     })
            //   );

            //   return [i.key, Object.fromEntries(resolvedEntries)];
            // }

            // if (Array.isArray(inputValue) && inputValue.length) {
            //   const resolvedArray = await Promise.all(
            //     inputValue.map(async (item: any) => {
            //       if (isPlainObject(item)) {
            //         return Object.fromEntries(
            //           await Promise.all(
            //             Object.entries(item).map(async ([key, value]) => [
            //               key,
            //               typeof value === 'string'
            //                 ? await this.renderMessage(value, variables, { stringify: false })
            //                 : value,
            //             ])
            //           )
            //         );
            //       }

            //       return await this.renderMessage(item, variables, { stringify: false });
            //     })
            //   );

            //   return [i.key, resolvedArray];
            // }

            return [i.key, variables?.[i.key!] || inputs?.[i.key!]];
          }) ?? [],
      ),
    );
    const inputVariables: { [key: string]: any } = {
      ...(inputs || {}),
      ...inputParameters,
    };

    const partial = await this.validateOutputs({
      inputs: inputVariables,
      partial: true,
    });
    if (!isEmpty(partial)) {
      this.context.callback?.({
        type: AssistantResponseType.CHUNK,
        taskId,
        assistantId: agent.id,
        delta: { object: partial },
      });
    }

    const { callback } = this.context;

    const cb: (taskId: string) => RunAssistantCallback = (taskId) => (args) => {
      if (args.type === AssistantResponseType.CHUNK && args.taskId === taskId) {
        callback({ ...args });
        return;
      }
      callback(args);
    };

    const parameters = (agent.parameters || []).filter((i) => !i.hidden);
    for (const parameter of parameters) {
      if (!parameter.key) continue;

      if (parameter.type === "source") {
        if (!agent.project) {
          throw new Error("Agent project not found.");
        }

        if (parameter.source?.variableFrom === "secret") {
          const secret =
            inputs?.[parameter.key] ||
            config.env[(parameter.key || "").toLocaleUpperCase()];
          if (!secret)
            throw new Error(`Missing required agent secret ${parameter.key}`);
          inputVariables[parameter.key!] = secret;
        } else if (
          parameter.source?.variableFrom === "tool" &&
          parameter.source.agent
        ) {
          const currentTaskId = nextId();
          const { agent: tool } = parameter.source;

          const identity = parseIdentity(agent.identity.aid, {
            rejectWhenError: true,
          });

          const toolAgent = await this.context.getAgent({
            aid: stringifyIdentity({
              blockletDid: tool.blockletDid || identity.blockletDid,
              projectId: tool.projectId || identity.projectId,
              projectRef: identity.projectRef,
              agentId: tool.id,
            }),
            working: agent.identity.working,
          });
          if (!toolAgent) continue;

          const result = await this.context
            .executor(toolAgent, {
              inputs: tool.parameters,
              variables: { ...inputParameters, ...inputVariables },
              taskId: currentTaskId,
              parentTaskId: taskId,
            })
            .execute();

          inputVariables[parameter.key] = result ?? parameter.defaultValue;
        } else if (parameter.source?.variableFrom === "datastore") {
          const currentTaskId = nextId();
          const key =
            toLower(parameter.source.variable?.key) || toLower(parameter.key);
          const scope = parameter.source.variable?.scope || "session";

          const blocklet = await this.context.getBlockletAgent(MEMORY_API_ID);
          if (!blocklet.agent) {
            throw new Error("Blocklet agent api not found.");
          }

          const data = await this.context
            .executor(blocklet.agent, {
              inputs: {
                projectId: this.context.entryProjectId,
                sessionId: this.context.sessionId,
                scope,
                key,
              },
              taskId: currentTaskId,
              parentTaskId: taskId,
            })
            .execute();

          const m = await this.context.getMemoryVariables({
            ...parseIdentity(agent.identity.aid, { rejectWhenError: true }),
            working: agent.identity.working,
          });
          const list = (data.datastores || [])
            .map((x: any) => x?.data)
            .filter((x: any) => x);
          const storageVariable = m.find(
            (x) =>
              toLower(x.key || "") === toLower(key || "") && x.scope === scope,
          );
          let result =
            list?.length > 0
              ? list
              : [
                  storageVariable?.type?.type === "number" &&
                  typeof storageVariable?.defaultValue === "string"
                    ? Number(storageVariable.defaultValue)
                    : storageVariable?.defaultValue,
                ];
          if (storageVariable?.reset) {
            result = (result?.length > 1 ? result : result[0]) ?? "";
          }

          inputVariables[parameter.key] = result ?? parameter.defaultValue;
        } else if (
          parameter.source?.variableFrom === "knowledge" &&
          parameter.source.knowledge
        ) {
          const currentTaskId = nextId();
          const tool = parameter.source.knowledge;
          const blockletDid =
            parameter.source.knowledge.blockletDid ||
            parseIdentity(agent.identity.aid, { rejectWhenError: true })
              .blockletDid;

          const blocklet =
            await this.context.getBlockletAgent(KNOWLEDGE_API_ID);
          if (!blocklet.agent) {
            throw new Error("Blocklet agent api not found.");
          }

          const data = await this.context
            .copy({ callback: cb(currentTaskId) })
            .executor(blocklet.agent, {
              inputs: tool?.parameters,
              variables: {
                ...inputVariables,
                blockletDid,
                datasetId: tool.id,
                knowledgeId: tool.id,
              },
              taskId: currentTaskId,
              parentTaskId: taskId,
            })
            .execute();

          inputVariables[parameter.key] =
            JSON.stringify(data?.docs || []) ?? parameter.defaultValue;
        } else if (
          parameter.source?.variableFrom === "history" &&
          parameter.source.chatHistory
        ) {
          const currentTaskId = nextId();
          const chat = parameter.source.chatHistory;

          const blocklet = await this.context.getBlockletAgent(HISTORY_API_ID);
          if (!blocklet.agent) {
            throw new Error("Blocklet agent api not found.");
          }

          const result = await this.context
            .executor(blocklet.agent, {
              inputs: {
                sessionId: this.context.sessionId,
                limit: chat.limit || 50,
                keyword: await this.renderMessage(
                  chat.keyword || "",
                  inputVariables,
                  { stringify: false },
                ),
              },
              taskId: currentTaskId,
              parentTaskId: taskId,
            })
            .execute();

          const memories: {
            role: string;
            content: string;
            agentId?: string;
          }[] = Array.isArray(result?.messages) ? result.messages : [];
          const agentIds = new Set(
            memories
              .map((i) => i.agentId)
              .filter((i): i is NonNullable<typeof i> => !!i),
          );
          const identity = parseIdentity(agent.identity.aid, {
            rejectWhenError: true,
          });
          const assistantNameMap = Object.fromEntries(
            (
              await Promise.all(
                [...agentIds].map((agentId) =>
                  this.context
                    .getAgent({
                      aid: stringifyIdentity({ ...identity, agentId }),
                      working: agent.identity.working,
                    })
                    .catch((error) => {
                      logger.error(
                        "get assistant in conversation history error",
                        { error },
                      );
                      return null;
                    }),
                ),
              )
            )
              .filter(isNonNullable)
              .map((i) => [
                i.id,
                (
                  i.outputVariables?.find(
                    (j) => j.name === RuntimeOutputVariable.profile,
                  )?.initialValue as RuntimeOutputProfile
                )?.name ||
                  i.name ||
                  i.id,
              ]),
          );

          inputVariables[parameter.key] = memories.map((i) => ({
            ...i,
            name: i.agentId && assistantNameMap[i.agentId],
          }));
        } else if (
          parameter.source?.variableFrom === "blockletAPI" &&
          parameter.source.api
        ) {
          const currentTaskId = nextId();

          const blocklet = await this.context.getBlockletAgent(
            parameter.source.api.id,
          );
          if (!blocklet.agent) {
            throw new Error("Blocklet agent api not found.");
          }

          const result = await this.context
            .copy({ callback: cb?.(currentTaskId) })
            .executor(blocklet.agent, {
              inputs: parameter.source.api.parameters,
              variables: inputVariables,
              taskId: currentTaskId,
              parentTaskId: taskId,
            })
            .execute();

          inputVariables[parameter.key] = result;
        }
      } else if (
        [
          "llmInputMessages",
          "llmInputTools",
          "llmInputToolChoice",
          "llmInputResponseFormat",
        ].includes(parameter.type!)
      ) {
        const v = inputs?.[parameter.key];
        const tryParse = (s: string) => {
          try {
            return JSON.parse(s);
          } catch {
            // ignore
          }
          return undefined;
        };

        const schema = {
          llmInputMessages: Joi.array().items(
            Joi.object({
              role: Joi.string()
                .valid("system", "user", "assistant")
                .empty([null, ""])
                .default("user"),
              content: Joi.string().required(),
              name: Joi.string().empty([null, ""]),
            }),
          ),
          llmInputTools: Joi.array()
            .items(
              Joi.object({
                type: Joi.string().valid("function").required(),
                function: Joi.object({
                  name: Joi.string().required(),
                  description: Joi.string().empty([null, ""]),
                  parameters: Joi.object()
                    .pattern(Joi.string(), Joi.any())
                    .required(),
                }).required(),
              }),
            )
            .empty(Joi.array().length(0)),
          llmInputToolChoice: Joi.alternatives()
            .try(
              Joi.string().valid("auto", "none", "required"),
              Joi.object({
                type: Joi.string().valid("function").required(),
                function: Joi.object({
                  name: Joi.string().required(),
                  description: Joi.string(),
                }).required(),
              }),
            )
            .empty([null, ""])
            .optional(),
          llmInputResponseFormat: Joi.object({
            type: Joi.string()
              .valid("text", "json_object", "json_schema")
              .empty([null, ""]),
          }).when(Joi.object({ type: Joi.valid("json_schema") }), {
            then: Joi.object({
              jsonSchema: Joi.object({
                name: Joi.string().required(),
                description: Joi.string().empty([null, ""]),
                schema: Joi.object()
                  .pattern(Joi.string(), Joi.any())
                  .required(),
                strict: Joi.boolean().empty([null, ""]),
              }),
            }),
          }),
        }[parameter.type as string]!;

        const val =
          parameter.type === "llmInputMessages"
            ? await schema.validateAsync(
                (Array.isArray(v) ? v : tryParse(v)) ?? [
                  {
                    role: "user",
                    content: typeof v === "string" ? v : JSON.stringify(v),
                  },
                ],
                { stripUnknown: true },
              )
            : parameter.type === "llmInputTools"
              ? await schema.validateAsync(Array.isArray(v) ? v : tryParse(v), {
                  stripUnknown: true,
                })
              : await schema.validateAsync(tryParse(v) || v, {
                  stripUnknown: true,
                });

        inputVariables[parameter.key] = val;
      } else if (parameter.type === "boolean") {
        const val = inputVariables[parameter.key];
        inputVariables[parameter.key] = Boolean(
          isNil(val) ? parameter.defaultValue : val,
        );
      } else if (parameter.type === "number") {
        const val = inputVariables[parameter.key];
        const parsedValue =
          val && typeof val === "number"
            ? val
            : (Number(val) ?? parameter.defaultValue ?? null);
        inputVariables[parameter.key] = Number.isNaN(parsedValue)
          ? (parameter.defaultValue ?? null)
          : parsedValue;
      } else {
        const val = inputVariables[parameter.key];
        if (!isNil(val)) inputVariables[parameter.key] = val || null;
      }
    }

    return inputVariables;
  }

  protected renderMessage: typeof renderMessage = async (
    template,
    variables,
    options,
  ) => {
    return renderMessage(
      template,
      { ...this._finalInputs, ...variables, ...this.globalContext },
      options,
    );
  };

  protected async validateOutputs({
    inputs,
    outputs,
    partial,
    processCallAgentOutputs,
  }: {
    inputs?: { [key: string]: any };
    outputs?: { [key: string]: any };
    partial?: boolean;
    processCallAgentOutputs?: boolean;
  }) {
    const { agent } = this;

    const joiSchema = outputVariablesToJoiSchema(agent, {
      partial,
      variables: agent.identity
        ? await this.context.getMemoryVariables({
            ...parseIdentity(agent.identity.aid, { rejectWhenError: true }),
            working: agent.identity.working,
          })
        : [],
    });
    const outputVariables = (agent.outputVariables ?? []).filter(
      (i) => !i.hidden,
    );

    const outputInputs = outputVariables.reduce((res, output) => {
      let input: Parameter | undefined;
      if (output.from?.type === "input") {
        const fromId = output.from.id;
        input = agent.parameters?.find(
          (input) => input.id === fromId && !input.hidden,
        );
      }

      if (input?.key && output.name) {
        const val = inputs?.[input.key];
        if (!isNil(val)) return { ...res, [output.name]: val };
      }

      return res;
    }, {});

    const result = await joiSchema.validateAsync(
      { ...outputs, ...outputInputs },
      { stripUnknown: true },
    );

    if (processCallAgentOutputs && this.agent.outputVariables) {
      const callAgentOutputs = this.agent.outputVariables.filter(
        (
          i,
        ): i is typeof i & {
          name: string;
          from: { type: "callAgent"; callAgent: { agentId: string } };
        } =>
          i.from?.type === "callAgent" &&
          !!i.from.callAgent?.agentId &&
          !!i.name,
      );
      const templateOutputs = this.agent.outputVariables.filter(
        (
          i,
        ): i is typeof i & Required<Pick<typeof i, "name" | "valueTemplate">> =>
          !!i.valueTemplate?.trim() && !!i.name,
      );

      const isOutputActive = async (output: OutputVariable) => {
        if (!output.activeWhen?.trim()) return true;

        return Joi.boolean().validate(
          await this.renderMessage(
            output.activeWhen,
            { ...outputs, ...result },
            { stringify: false },
          ),
        ).value;
      };

      const v = Object.fromEntries(
        (
          await Promise.all(
            callAgentOutputs.map(async (i) => {
              if (!(await isOutputActive(i))) return null;

              return [
                i.name,
                await (async () => {
                  if (!this.agent.identity)
                    throw new Error("Agent identity not found");

                  const identity = parseIdentity(this.agent.identity.aid, {
                    rejectWhenError: true,
                  });

                  const toolAgent = await this.context.getAgent({
                    aid: stringifyIdentity({
                      blockletDid:
                        i.from.callAgent.blockletDid || identity.blockletDid,
                      projectId:
                        i.from.callAgent.projectId || identity.projectId,
                      projectRef: identity.projectRef,
                      agentId: i.from.callAgent.agentId,
                    }),
                    working: this.agent.identity.working,
                  });
                  if (!toolAgent) throw new Error("Tool agent not found");

                  const currentTaskId = nextId();

                  return await this.context
                    .executor(toolAgent, {
                      inputs: i.from.callAgent.inputs,
                      variables: { ...inputs, ...outputs },
                      taskId: currentTaskId,
                      parentTaskId: this.options.taskId,
                    })
                    .execute();
                })(),
              ];
            }),
          )
        ).filter(isNonNullable),
      );

      Object.assign(result, v);

      const v1 = Object.fromEntries(
        (
          await Promise.all(
            templateOutputs.map(async (i) => {
              if (!(await isOutputActive(i))) return null;
              return [
                i.name,
                await this.renderMessage(
                  i.valueTemplate!,
                  { ...outputs, ...v },
                  { stringify: false },
                ),
              ];
            }),
          )
        ).filter(isNonNullable),
      );

      Object.assign(result, v1);
    }

    return result;
  }

  private async postProcessOutputs(
    agent: GetAgentResult,
    { outputs }: { outputs: { [key: string]: any } },
  ) {
    const memoryVariables = agent.identity
      ? await this.context.getMemoryVariables({
          ...parseIdentity(agent.identity.aid, { rejectWhenError: true }),
          working: agent.identity.working,
        })
      : [];
    const outputVariables = (agent.outputVariables ?? []).filter(
      (i) => !i.hidden,
    );

    for (const output of outputVariables) {
      if (!output?.variable?.key || !output?.name) continue;

      const value = outputs[output.name];
      if (isNil(value)) continue;

      const variable = memoryVariables.find(
        (x) =>
          toLower(x.key || "") === toLower(output.variable?.key || "") &&
          x.scope === output.variable?.scope,
      );

      await this.setMemory({
        key: toLower(output.variable.key),
        data: value,
        scope: output.variable.scope,
        agentId: agent.id,
        reset: variable?.reset,
      });
    }
  }

  private async setMemory({
    key,
    data,
    scope,
    agentId,
    reset,
  }: {
    key: string;
    data: any;
    scope: VariableScope;
    agentId: string;
    reset?: boolean;
  }): Promise<{ id: string; key: string; data: any; scope: VariableScope }> {
    const res = await call({
      name: AIGNE_RUNTIME_COMPONENT_DID,
      path: "/api/memories",
      method: "POST",
      params: {
        userId: this.context.user?.did,
        projectId: this.context.entryProjectId,
        agentId,
        sessionId: this.context.sessionId,
        reset,
      },
      data: { key, data, scope },
    });

    return res.data;
  }

  private async getMemory(query: {
    key: string;
    scope: VariableScope;
    agentId: string;
    onlyOne: true;
  }): Promise<{
    id: string;
    key: string;
    data: any;
    scope: VariableScope;
  } | null>;
  private async getMemory(query: {
    key: string;
    scope: VariableScope;
    agentId: string;
    onlyOne?: false;
  }): Promise<{ id: string; key: string; data: any; scope: VariableScope }[]>;
  private async getMemory(query: {
    key: string;
    scope: VariableScope;
    agentId: string;
    onlyOne?: boolean;
  }): Promise<
    | { id: string; key: string; data: any; scope: VariableScope }[]
    | { id: string; key: string; data: any; scope: VariableScope }
    | null
  >;
  private async getMemory({
    key,
    scope,
    onlyOne,
  }: { key: string; scope: VariableScope; onlyOne?: boolean }) {
    const res = await call({
      name: AIGNE_RUNTIME_COMPONENT_DID,
      path: "/api/memories/variable-by-query",
      method: "GET",
      params: {
        userId: this.context.user?.did,
        projectId: this.context.entryProjectId,
        sessionId: this.context.sessionId,
        key,
        scope,
      },
    });

    const list = res.data?.datastores;
    if (!Array.isArray(list) || !list.length) return null;

    return onlyOne ? list.at(-1)?.data : list.map((i) => i.data);
  }

  hideSecretInputs(partial: { [key: string]: any }, agent: GetAgentResult) {
    const authInputs = (agent.parameters || []).filter(
      (i) =>
        i.key &&
        i.type === "source" &&
        i.source?.variableFrom === "secret" &&
        !i.hidden,
    );

    const secretInputs = authInputs.reduce(
      (res, i) => {
        res[i.key!] = "******";
        return res;
      },
      {} as { [key: string]: any },
    );

    return {
      ...(partial || {}),
      ...secretInputs,
    };
  }
}
