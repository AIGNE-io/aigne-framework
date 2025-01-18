import type { Context, RunnableDefinition } from "@aigne/core";
import {
  type LLMModel,
  type RunOptions,
  Runnable,
  type RunnableResponse,
  type RunnableResponseStream,
  TYPES,
} from "@aigne/core";
import type { ChatCompletionResponse } from "@blocklet/ai-kit/api/types/index";
import { inject, injectable } from "tsyringe";

import type {
  CallAI,
  CallAIImage,
  GetAgentResult,
  RunAssistantCallback,
} from "./assistant/type";
import { defaultImageModel, getSupportedImagesModels } from "./common";
import { parseIdentity, stringifyIdentity } from "./common/aid";
import { RuntimeExecutor } from "./executor";
import { resourceManager } from "./resource-blocklet";
import { type Agent, AssistantResponseType } from "./types";
import { nextId } from "./utils/task-id";

export * from "./type";
export * from "./resource-blocklet";

@injectable()
export class AgentV1<I extends {} = {}, O extends {} = {}> extends Runnable<
  I,
  O
> {
  constructor(
    @inject(TYPES.definition) public override definition: RunnableDefinition,
    @inject(TYPES.context) context: Context,
    @inject(TYPES.llmModel) private llmModel: LLMModel,
  ) {
    super(definition, context);
  }

  async run(
    inputs: I,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<O>>;
  async run(inputs: I, options?: RunOptions & { stream?: boolean }): Promise<O>;
  async run(inputs: I, options?: RunOptions): Promise<RunnableResponse<O>> {
    const { imageGenerations } = await import("@blocklet/ai-kit/api/call");

    const taskId = nextId();
    const messageId = nextId();
    const { llmModel } = this;

    const callAI: CallAI = async ({ input }) => {
      return new ReadableStream<ChatCompletionResponse>({
        async start(controller) {
          try {
            const stream = await llmModel.run(
              {
                messages: input.messages,
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

    const execute = (callback: RunAssistantCallback) => {
      const executor = new RuntimeExecutor(
        {
          entry: { project },
          callback,
          callAI,
          callAIImage,
          getMemoryVariables: async () => {
            // if (options.projectId === project.id) return project.memories ?? [];
            // logger.warn('Unsupported to get memory variables from other projects');
            return [];
          },
          getAgent: async (options) => {
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
              const a = project.runnables?.[identity.agentId] as any as Agent;
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

            if (options.rejectOnEmpty && !agent)
              throw new Error("No such agent");

            return agent!;
          },
          entryProjectId: project.id,
          sessionId: project.id,
          messageId,
          clientTime: new Date().toISOString(),
          queryCache: async () => {
            // TODO: implement cache
            return null;
          },
          setCache: async () => {
            // TODO: implement cache
          },
        },
        // TODO:
        {
          ...definition,
          identity: {
            projectId: project.id,
            agentId: definition.id,
            aid: stringifyIdentity({
              projectId: project.id,
              agentId: definition.id,
            }),
          },
          project,
        } as any,
        {
          inputs,
          taskId,
        },
      );

      return executor.execute();
    };

    if (options?.stream) {
      return new ReadableStream({
        async start(controller) {
          try {
            const result = await execute((e) => {
              if (e.type === AssistantResponseType.CHUNK) {
                const { content, object } = e.delta;

                controller.enqueue({
                  $text: content || undefined,
                  delta: object as any,
                });
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

    return execute(() => {});
  }
}
