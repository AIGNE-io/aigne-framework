import type { Context, RunnableDefinition } from "@aigne/core";
import { Agent, type LLMModel, TYPES } from "@aigne/core";
import type { ChatCompletionResponse } from "@blocklet/ai-kit/api/types/index";
import {
  defaultImageModel,
  getSupportedImagesModels,
} from "@blocklet/ai-runtime/common";
import {
  parseIdentity,
  stringifyIdentity,
} from "@blocklet/ai-runtime/common/aid";
import {
  type CallAI,
  type CallAIImage,
  type GetAgentOptions,
  type GetAgentResult,
  type RunAssistantCallback,
  RuntimeExecutor,
  nextTaskId,
} from "@blocklet/ai-runtime/core";
import {
  type Assistant,
  AssistantResponseType,
} from "@blocklet/ai-runtime/types";
import { inject, injectable } from "tsyringe";
import logger from "./logger";
import { resourceManager } from "./resource-blocklet";

export * from "@blocklet/ai-runtime/core";
export * from "./types";
export * from "./resource-blocklet";

@injectable()
export class AgentV1<I extends {} = {}, O extends {} = {}> extends Agent<I, O> {
  constructor(
    @inject(TYPES.definition)
    public override definition: RunnableDefinition & {
      blockletDid?: string;
      projectId?: string;
    },
    @inject(TYPES.context) context: Context,
    @inject(TYPES.llmModel) private llmModel: LLMModel,
  ) {
    super(definition, context);
  }

  async process(inputs: I) {
    const { imageGenerations } = await import("@blocklet/ai-kit/api/call");

    const taskId = nextTaskId();
    const messageId = nextTaskId();
    const { llmModel } = this;

    const callAI: CallAI = async ({ input }) => {
      return new ReadableStream<ChatCompletionResponse>({
        async start(controller) {
          try {
            const { responseFormat } = input;

            const stream = await llmModel.run(
              {
                messages: input.messages,
                responseFormat: responseFormat as any,
                tools: input.tools,
                toolChoice: input.toolChoice,
                modelOptions: {
                  model: input.model,
                  temperature: input.temperature,
                  topP: input.topP,
                  presencePenalty: input.presencePenalty,
                  frequencyPenalty: input.frequencyPenalty,
                },
              },
              { stream: true },
            );

            for await (const chunk of stream) {
              controller.enqueue({
                delta: {
                  content: chunk.$text,
                  toolCalls: chunk.delta?.toolCalls,
                },
              });
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });
    };

    // TODO: use imageGenerationModel instead of callAIImage
    const callAIImage: CallAIImage = async ({ assistant, input }) => {
      const imageAssistant = assistant.type === "image" ? assistant : undefined;
      const supportImages = await getSupportedImagesModels();
      const imageModel = supportImages.find(
        (i) => i.model === (imageAssistant?.model || defaultImageModel),
      );

      const model = {
        model: input.model || imageModel?.model,
        n: input.n || imageModel?.nDefault,
        quality: input.quality || imageModel?.qualityDefault,
        style: input.style || imageModel?.styleDefault,
        size: input.size || imageModel?.sizeDefault,
      };
      return imageGenerations({
        ...input,
        ...model,
        responseFormat: "url",
      }) as any;
    };

    // TODO: don't use any
    const project = (this.context as any).options.projectDefinition;

    const { definition } = this;
    if (!definition) throw new Error("No such agent");

    const getAgent = async (options: GetAgentOptions) => {
      const identity = parseIdentity(options.aid, {
        rejectWhenError: true,
      });

      let agent: GetAgentResult | undefined;

      if (identity.blockletDid) {
        const { blockletDid, projectId, agentId } = identity;

        const res = await resourceManager.getAgent({
          blockletDid,
          projectId,
          agentId,
        });

        if (res) {
          agent = {
            ...res.agent,
            project: res.project,
            identity: {
              blockletDid,
              projectId,
              agentId,
              aid: stringifyIdentity({ blockletDid, projectId, agentId }),
            },
          };
        }
      } else if (identity.projectId === project.id) {
        const a = project.runnables?.[identity.agentId] as any as Assistant;
        if (a) {
          agent = {
            ...a,
            project,
            identity: {
              projectId: project.id,
              agentId: a.id,
              aid: stringifyIdentity({
                projectId: project.id,
                agentId: a.id,
              }),
            },
          };
        }
      }

      if (options.rejectOnEmpty && !agent) throw new Error("No such agent");

      return agent!;
    };

    const agent = await getAgent({
      aid: stringifyIdentity({
        blockletDid: definition.blockletDid || project.blockletDid,
        projectId: definition.projectId || project.id,
        agentId: definition.id,
      }),
      rejectOnEmpty: true,
    });

    const execute = (callback: RunAssistantCallback) => {
      const executor = new RuntimeExecutor(
        {
          entry: { project },
          callback,
          callAI,
          callAIImage,
          getMemoryVariables: async (options) => {
            if (options.blockletDid) {
              const p = await resourceManager.getProject({
                blockletDid: options.blockletDid,
                projectId: options.projectId,
              });
              return p?.memory.variables ?? [];
            }

            if (options.projectId === project.id) return project.memories ?? [];
            logger.warn(
              "Unsupported to get memory variables from other projects",
            );
            return [];
          },
          getAgent,
          entryProjectId: project.id,
          sessionId: project.id,
          messageId,
          user: this.context?.state.user as any,
          clientTime: new Date().toISOString(),
          queryCache: async () => {
            // TODO: implement cache
            return null;
          },
          setCache: async () => {
            // TODO: implement cache
          },
          getSecret(args) {
            throw new Error("Not implemented");
          },
        },
        agent,
        {
          inputs,
          taskId,
        },
      );

      return executor.execute();
    };

    return new ReadableStream({
      async start(controller) {
        try {
          const result = await execute((e) => {
            if (e.type === AssistantResponseType.CHUNK) {
              if (e.taskId === taskId) {
                const { content, object } = e.delta;

                controller.enqueue({
                  $text: content || undefined,
                  delta: object as any,
                });
              }
            }
          });

          controller.enqueue({ delta: result });
        } catch (error) {
          controller.error(error);
        }

        controller.close();
      },
    });
  }
}
