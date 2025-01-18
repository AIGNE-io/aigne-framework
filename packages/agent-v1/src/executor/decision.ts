import crypto from "node:crypto";
import type { ReadableStream } from "node:stream/web";

import {
  type ChatCompletionChunk,
  type ChatCompletionInput,
  type ChatCompletionResponse,
  isChatCompletionChunk,
  isChatCompletionUsage,
} from "@blocklet/ai-kit/api/types/index";
import { logger } from "@blocklet/sdk/lib/config";
import jsonLogic from "json-logic-js";
import { formatQuery } from "react-querybuilder/formatQuery";

import selectAgentName from "../assistant/select-agent";
import {
  type RunAssistantCallback,
  ToolCompletionDirective,
} from "../assistant/type";
import { parseIdentity, stringifyIdentity } from "../common/aid";
import {
  getAllParameters,
  getRequiredFields,
} from "../libs/openapi/request/util";
import {
  type Assistant,
  AssistantResponseType,
  ExecutionPhase,
  OnTaskCompletion,
  type RouterAssistant,
  RuntimeOutputVariable,
  type Tool,
} from "../types";
import { isNonNullable } from "../utils/is-non-nullable";
import { nextId } from "../utils/task-id";
import { toolCallsTransform } from "../utils/tool-calls-transform";
import { AgentExecutorBase } from "./base";

const md5 = (str: string) => crypto.createHash("md5").update(str).digest("hex");

export class DecisionAgentExecutor extends AgentExecutorBase<RouterAssistant> {
  override async process({ inputs }: { inputs: { [key: string]: any } }) {
    const { agent } = this;
    if (agent.decisionType === "json-logic") {
      return this.processWithJsonLogic({ inputs });
    }

    return this.processWithLLM({ inputs });
  }

  async processWithJsonLogic({ inputs }: { inputs: { [key: string]: any } }) {
    const {
      agent,
      options: { taskId },
    } = this;
    const { callback } = this.context;

    const matchedRoute = (agent.routes || []).find((route) => {
      if (!route.condition) return false;
      const condition = formatQuery(route.condition, { format: "jsonlogic" });
      const isValid = jsonLogic.apply(condition, inputs);

      logger.debug("route.condition is valid:", {
        json: JSON.stringify(route.condition, null, 2),
        jsonLogic: JSON.stringify(condition, null, 2),
        inputs,
        isValid,
      });

      return isValid;
    });

    const matchedId = matchedRoute?.id || agent.defaultToolId;

    if (!matchedId) {
      logger.warn(
        "No matched route or default tool, please check your agent configuration",
      );
      return {};
    }

    const identity = parseIdentity(agent.identity.aid, {
      rejectWhenError: true,
    });
    const matched = agent.routes?.find((x) => x.id === matchedId);
    logger.debug("matched route", {
      matchedId,
      matched,
      isDefault: matchedId === agent.defaultToolId,
    });

    const executor = !matched?.id
      ? undefined
      : matched.from === "blockletAPI"
        ? (await this.context.getBlockletAgent(matched.id))?.agent
        : await this.context.getAgent({
            aid: stringifyIdentity({
              blockletDid: identity.blockletDid,
              projectId: identity.projectId,
              projectRef: identity.projectRef,
              agentId: matched.id,
            }),
            working: agent.identity.working,
            rejectOnEmpty: true,
          });

    if (!executor) {
      logger.warn("No matched tool, please check your agent configuration");
      return {};
    }

    const parameters = Object.fromEntries(
      await Promise.all(
        Object.entries(matched?.parameters || {}).map(async ([key, value]) => {
          return [
            key,
            value
              ? await this.renderMessage(value, inputs)
              : inputs?.[key] || "",
          ];
        }),
      ),
    );

    const currentTaskId = nextId();

    const cb: RunAssistantCallback = (args) => {
      callback(args);

      if (
        args.type === AssistantResponseType.CHUNK &&
        args.taskId === currentTaskId
      ) {
        if (
          Object.values(executor.outputVariables || {}).find(
            (x) => x.name === RuntimeOutputVariable.text,
          ) &&
          Object.values(agent.outputVariables || {}).find(
            (x) => x.name === RuntimeOutputVariable.text,
          ) &&
          args.delta.content
        ) {
          callback({ ...args, taskId });
        }
      }
    };

    const result = await this.context
      .copy({ callback: cb })
      .executor(executor, {
        taskId: currentTaskId,
        parentTaskId: taskId,
        inputs: parameters,
        variables: { ...inputs },
      })
      .execute();

    logger.debug("executor selected", {
      executorId: executor.id,
      executorName: executor.name,
      result: JSON.stringify(result, null, 2),
    });

    return result;
  }

  async processWithLLM({ inputs }: { inputs: { [key: string]: any } }) {
    const {
      agent,
      options: { parentTaskId, taskId },
    } = this;

    if (!agent.prompt) {
      throw new Error("Route Assistant Prompt is required");
    }

    const message = await this.renderMessage(agent.prompt);
    const routes = agent?.routes || [];

    const blocklet = await this.context.getBlockletAgent(agent.id);

    logger.info("start get tool function");
    const toolAssistants = (
      await Promise.all(
        routes.map(async (tool) => {
          if (tool?.from === "blockletAPI") {
            const dataset = (blocklet.openApis || []).find(
              (x) => x.id === tool.id,
            );
            if (!dataset) return undefined;

            const name =
              tool?.functionName ||
              dataset.summary ||
              dataset.description ||
              "";
            const functionTranslateName = await this.getEnglishFunctionName({
              assistant: agent,
              tool,
              name,
            });
            logger.info("function call api name", functionTranslateName);

            const datasetParameters = getAllParameters(dataset)
              .filter((i): i is typeof i => !!i && !tool.parameters?.[i.name])
              .map((i) => [
                i.name,
                { type: "string", name, description: i.description ?? "" },
              ]);

            const required = getRequiredFields(dataset);

            return {
              tool,
              toolAssistant: dataset,
              function: {
                name:
                  (functionTranslateName || name)
                    .replace(/[^a-zA-Z0-9_-]/g, "_")
                    ?.slice(0, 64) || dataset.path,
                descriptions: dataset.description || name || "",
                parameters: {
                  type: "object",
                  properties: Object.fromEntries(datasetParameters),
                  required: required?.length ? required : undefined,
                },
              },
            };
          }

          const identity = parseIdentity(agent.identity.aid, {
            rejectWhenError: true,
          });

          const toolAssistant = await this.context.getAgent({
            aid: stringifyIdentity({
              blockletDid: tool.blockletDid || identity.blockletDid,
              projectId: tool.projectId || identity.projectId,
              projectRef: identity.projectRef,
              agentId: tool.id,
            }),
            working: agent.identity.working,
          });
          if (!toolAssistant) return undefined;
          const toolParameters = (toolAssistant.parameters ?? [])
            .filter(
              (i): i is typeof i & Required<Pick<typeof i, "key">> =>
                !!i.key &&
                !tool.parameters?.[i.key] &&
                i.type !== "source" &&
                !i.hidden,
            )
            .map((parameter) => {
              return [
                parameter.key,
                {
                  type: "string",
                  description: parameter.placeholder ?? "",
                  enum:
                    parameter.type === "select"
                      ? parameter.options?.map((i) => i.value)
                      : undefined,
                },
              ];
            });

          const required = (toolAssistant.parameters ?? [])
            .filter(
              (i): i is typeof i & { key: string } =>
                !!i.key && i.type !== "source" && !i.hidden,
            )
            .filter((i) => !tool?.parameters?.[i.key] && i.required)
            .map((x) => x.key);

          const name =
            tool?.functionName ||
            toolAssistant?.description ||
            toolAssistant?.name ||
            "";
          const functionTranslateName = await this.getEnglishFunctionName({
            assistant: agent,
            tool,
            name,
          });
          logger.info("function call agent name", functionTranslateName);

          return {
            tool,
            toolAssistant,
            function: {
              name:
                (functionTranslateName || name)
                  ?.replace(/[^a-zA-Z0-9_-]/g, "_")
                  .slice(0, 64) || toolAssistant.id,
              descriptions: toolAssistant.description,
              parameters: {
                type: "object",
                properties: Object.fromEntries(toolParameters),
                required: required?.length ? required : undefined,
              },
            },
          };
        }),
      )
    ).filter(isNonNullable);

    const runFunctionCall = async ({
      tools,
      toolChoice,
    }: {
      tools: ChatCompletionInput["tools"];
      toolChoice: ChatCompletionInput["toolChoice"];
    }) => {
      const identity = parseIdentity(agent.identity.aid, {
        rejectWhenError: true,
      });

      const executor = agent.executor?.agent?.id
        ? await this.context.getAgent({
            aid: stringifyIdentity({
              blockletDid:
                agent.executor.agent.blockletDid || identity.blockletDid,
              projectId: agent.executor.agent.projectId || identity.projectId,
              projectRef: identity.projectRef,
              agentId: agent.executor.agent.id,
            }),
            working: agent.identity.working,
            rejectOnEmpty: true,
          })
        : undefined;

      const messages: ChatCompletionInput["messages"] = [
        { role: "system", content: message },
      ];

      this.context.callback?.({
        type: AssistantResponseType.INPUT,
        assistantId: agent.id,
        parentTaskId,
        taskId,
        assistantName: `${agent.name}`,
        promptMessages: messages,
      });

      const input = {
        model: agent?.model,
        temperature: agent?.temperature,
        topP: agent?.topP,
        presencePenalty: agent?.presencePenalty,
        frequencyPenalty: agent?.frequencyPenalty,
        messages,
        tools,
        toolChoice,
      };

      logger.debug("Run decision agent", JSON.stringify(input, null, 2));

      const response = executor
        ? ((
            await this.context
              .executor(executor, {
                taskId: nextId(),
                parentTaskId: taskId,
                inputs: {
                  ...inputs,
                  ...agent.executor?.inputValues,
                  [executor.parameters?.find(
                    (i) => i.type === "llmInputMessages" && !i.hidden,
                  )?.key!]: messages,
                  [executor.parameters?.find(
                    (i) => i.type === "llmInputTools" && !i.hidden,
                  )?.key!]: tools,
                  [executor.parameters?.find(
                    (i) => i.type === "llmInputToolChoice" && !i.hidden,
                  )?.key!]: toolChoice,
                },
              })
              .execute()
          )[
            RuntimeOutputVariable.llmResponseStream
          ] as ReadableStream<ChatCompletionResponse>)
        : await this.context.callAI({
            assistant: agent,
            input,
          });

      const calls: NonNullable<ChatCompletionChunk["delta"]["toolCalls"]> = [];

      for await (const chunk of response) {
        if (isChatCompletionUsage(chunk)) {
          this.context.callback?.({
            type: AssistantResponseType.USAGE,
            taskId,
            assistantId: agent.id,
            usage: chunk.usage,
          });
        }

        if (isChatCompletionChunk(chunk)) {
          toolCallsTransform(calls, chunk);
        }
      }

      return calls;
    };

    const tools: {
      type: "function";
      function: {
        name: string;
        description?: string | undefined;
        parameters: Record<string, any>;
      };
    }[] = toolAssistants.map((i) => ({
      type: "function",
      function: {
        name: i.function.name,
        description: i.function.descriptions,
        parameters: i.function.parameters,
      },
    }));

    const calls = await runFunctionCall({
      tools,
      toolChoice: "required",
    });

    this.context.callback?.({
      type: AssistantResponseType.EXECUTE,
      assistantId: agent.id,
      parentTaskId,
      taskId,
      execution: { currentPhase: ExecutionPhase.EXECUTE_ASSISTANT_END },
    });

    const toolAssistantMap = Object.fromEntries(
      toolAssistants.map((i) => [i.function.name, i]),
    );
    const defaultTool = toolAssistants.find(
      (i) => i.tool.id === agent.defaultToolId,
    );

    const matchAgentName = async () => {
      // requestCalls 没有找到，检查 jsonResult 是否存在

      let selectedAgent: { category_name?: string } = {};
      try {
        const categories = toolAssistants
          .map((x) => x.function.name)
          .filter((x) => x)
          .map((x) => JSON.stringify({ category_name: x }))
          .join(",");

        selectedAgent = await selectAgentName({
          assistant: agent,
          message,
          categories,
          callAI: this.context.callAI,
          maxRetries: this.context.maxRetries,
        });
      } catch (error) {
        logger.error("select agent name failed");
      }

      logger.info("Get Current Selected Agent Name", {
        from: "ai",
        value: selectedAgent?.category_name,
      });
      if (selectedAgent?.category_name) {
        const found = toolAssistantMap[selectedAgent.category_name];
        if (found) return selectedAgent.category_name;
      }

      logger.info("Get Current Selected Agent Name", {
        from: "default agent",
        value: agent?.defaultToolId,
      });
      // 使用默认 Agent
      if (agent?.defaultToolId) {
        const found = toolAssistantMap[agent.defaultToolId];
        if (found) return defaultTool?.function.name;
      }

      logger.debug("Get Current Selected Agent Name", {
        from: "from first agent",
        value: toolAssistants[0]?.function.name,
      });
      // 没有找到符合条件的请求，使用默认请求
      return toolAssistants[0]?.function?.name;
    };

    const matchRequestCalls = async () => {
      logger.debug("Get Current Selected Agent Name", {
        from: "function call",
        value: calls && JSON.stringify(calls),
      });

      // 首先检查 call function 返回的值是否存在
      if (calls?.length) {
        const found = calls.find(
          (call) =>
            call.function?.name && toolAssistantMap[call.function?.name],
        );

        if (found) {
          return [found];
        }
      }

      // TODO: 使用  toolChoice: 'required' 之后，肯定会返回数据，下面会用不到, 先观察一下使用情况
      const agentName = await matchAgentName();
      const tool = toolAssistants.find((x) => x.function.name === agentName);
      if (tool) {
        const defaultCalls = await runFunctionCall({
          tools: [tool].map((i) => ({
            type: "function",
            function: {
              name: i.function.name,
              description: i.function.descriptions,
              parameters: i.function.parameters,
            },
          })),
          toolChoice: {
            type: "function",
            function: {
              name: tool.function.name,
              description: tool.function.descriptions,
            },
          },
        });

        if (defaultCalls?.length) {
          const found = defaultCalls.find(
            (call) =>
              call.function?.name && toolAssistantMap[call.function?.name],
          );
          if (found) {
            return [found];
          }
        }
      }

      return [
        { type: "function", function: { name: agentName, arguments: "{}" } },
      ];
    };

    const requestCalls = await matchRequestCalls();

    const result =
      requestCalls &&
      (await Promise.all(
        requestCalls.map(async (call) => {
          if (!call.function?.name || !call.function.arguments)
            return undefined;

          const tool = toolAssistantMap[call.function.name];
          if (!tool) return undefined;

          const requestData = JSON.parse(call.function.arguments);
          const currentTaskId = nextId();
          const toolAssistant = tool?.toolAssistant as Assistant;

          const { callback } = this.context;

          const cb: RunAssistantCallback = (args) => {
            callback(args);

            if (
              args.type === AssistantResponseType.CHUNK &&
              args.taskId === currentTaskId
            ) {
              // called agent 有 text stream && 当前输出也有 text stream, 直接回显 text stream
              if (
                Object.values(toolAssistant?.outputVariables || {}).find(
                  (x) => x.name === RuntimeOutputVariable.text,
                ) &&
                Object.values(agent?.outputVariables || {}).find(
                  (x) => x.name === RuntimeOutputVariable.text,
                ) &&
                args?.delta?.content
              ) {
                callback({ ...args, taskId });
              }
            }
          };

          if (tool.tool.from === "blockletAPI") {
            const blocklet = await this.context.getBlockletAgent(tool.tool.id);
            if (!blocklet.agent) {
              throw new Error("Blocklet agent api not found.");
            }

            const result = await this.context
              .copy({ callback: cb })
              .executor(blocklet.agent, {
                inputs: tool.tool.parameters,
                variables: { ...inputs, ...requestData },
                taskId: currentTaskId,
                parentTaskId: taskId,
              })
              .execute();

            return result;
          }

          await Promise.all(
            toolAssistant.parameters
              ?.filter((i) => !i.hidden)
              ?.map(async (item) => {
                const message = tool.tool?.parameters?.[item.key!];
                if (message) {
                  requestData[item.key!] = await this.renderMessage(message);
                }
              }) ?? [],
          );

          const res = await this.context
            .copy({ callback: cb })
            .executor(toolAssistant as any, {
              taskId: currentTaskId,
              parentTaskId: taskId,
              inputs: requestData,
            })
            .execute();

          if (tool.tool?.onEnd === OnTaskCompletion.EXIT) {
            throw new ToolCompletionDirective(
              "The task has been stop. The tool will now exit.",
              OnTaskCompletion.EXIT,
            );
          }

          return res;
        }),
      ));

    const obj = result?.length === 1 ? result[0] : result;

    return obj;
  }

  private async getEnglishFunctionName({
    assistant,
    tool,
    name,
  }: {
    assistant: RouterAssistant;
    tool: Tool;
    name: string;
  }) {
    if (functionNameRegex.test(name)) return name;

    const key = md5(
      [
        assistant.id,
        tool.id,
        tool.functionName,
        assistant.name,
        assistant.description,
      ]
        .filter(Boolean)
        .join("/"),
    );

    if (!cacheTranslateFunctionNames[key]) {
      const result = await this.context.callAI({
        assistant: this.agent,
        input: {
          messages: [
            {
              content: `\
  # Role
  You are an engineer who is proficient in programming. Please generate a function \
  name that conforms to programming standards according to the following requirements

  - The name of the function to be called. Must be a-z, A-Z, 0-9, or contain \
  underscores and dashes, with a maximum length of 64.

  # Output

  - Do not explain
  - Directly output the generated function name

  # Requirements
  - Semantic function name
    - ${name}
    - ${tool.functionName}
    - ${assistant.name}
  - Function description: ${assistant.description}
                  `,
              role: "system",
            },
          ],
          model: assistant?.model,
          temperature: assistant?.temperature,
          topP: assistant?.topP,
          presencePenalty: assistant?.presencePenalty,
          frequencyPenalty: assistant?.frequencyPenalty,
        },
      });

      let generated = "";

      for await (const i of result) {
        if (isChatCompletionChunk(i)) {
          generated += i.delta.content || "";
        }
      }

      if (typeof generated !== "string" || !functionNameRegex.test(generated)) {
        throw new Error(`Generated function name is invalid: ${generated}`);
      }

      cacheTranslateFunctionNames[key] = generated;
    }

    return cacheTranslateFunctionNames[key]!;
  }
}

const cacheTranslateFunctionNames: { [key: string]: string } = {};

const functionNameRegex = /^[a-zA-Z0-9_-]{1,64}$/;
