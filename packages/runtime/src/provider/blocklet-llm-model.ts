import { agentV1ToRunnableDefinition, getAdapter } from "@aigne/agent-v1";
import type { Context, Runnable } from "@aigne/core";
import { LLMModel, type LLMModelInputs, TYPES, logger } from "@aigne/core";
import {
  type ChatCompletionChunk,
  type ChatCompletionInput,
  type ChatCompletionResponse,
  isChatCompletionChunk,
  isChatCompletionError,
} from "@blocklet/ai-kit/api/types/chat";
import { inject, injectable } from "tsyringe";

import { getDefaultValue } from "../utils/default-value";

const defaultLLMModel = "gpt-4o-mini";

@injectable()
export class BlockletLLMModel extends LLMModel {
  constructor(@inject(TYPES.context) context?: Context) {
    super(context);
  }

  async *process(input: LLMModelInputs) {
    const { chatCompletions } = await import("@blocklet/ai-kit/api/call");

    const config = this.context?.config.llmModel;

    const model =
      getDefaultValue("model", config?.override, input.modelOptions, config?.default) ||
      defaultLLMModel;

    const chatInput: ChatCompletionInput = {
      ...input.modelOptions,
      model,
      ...getDefaultValue(
        ["temperature", "topP", "presencePenalty", "frequencyPenalty"],
        config?.override,
        input.modelOptions,
        config?.default,
      ),
      messages: input.messages as ChatCompletionInput["messages"],
      responseFormat: input.responseFormat,
      tools: input.tools,
      toolChoice: input.toolChoice,
    };

    logger.debug("BlockletLLMModel.run inputs", chatInput);

    let stream: ReadableStream<ChatCompletionResponse> | undefined;

    if (this.context) {
      const adapter = await getAdapter("llm", model);
      if (adapter) {
        const runnable = await this.context.resolve<
          Runnable<
            ChatCompletionInput & Record<string, any>,
            { $llmResponseStream: ReadableStream<ChatCompletionResponse> }
          >
        >({
          ...agentV1ToRunnableDefinition(adapter.agent),
          // @ts-ignore
          blockletDid: adapter.blockletDid,
          projectId: adapter.projectId,
        });
        stream = (
          await runnable.run(chatInput, {
            stream: false,
          })
        ).$llmResponseStream;
      }
    }

    if (!stream) {
      stream = (await chatCompletions({
        ...chatInput,
        stream: true,
      })) as any as ReadableStream<ChatCompletionResponse>; // TODO: fix chatCompletions response type in @blocklet/ai-kit;
    }

    let toolCalls: ChatCompletionChunk["delta"]["toolCalls"] = [];

    for await (const chunk of stream!) {
      if (isChatCompletionChunk(chunk)) {
        const { content, toolCalls: calls } = chunk.delta;

        if (calls?.length) {
          toolCalls = calls;
        }

        yield {
          $text: content || undefined,
          delta: toolCalls ? { toolCalls } : undefined,
        };
      } else if (isChatCompletionError(chunk)) {
        throw new Error(chunk.error.message);
      }
    }
  }
}
