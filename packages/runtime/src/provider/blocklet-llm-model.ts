import { agentV1ToRunnableDefinition, getAdapter } from "@aigne/agent-v1";
import type { Context, Runnable } from "@aigne/core";
import { LLMModel, type LLMModelInputs, TYPES } from "@aigne/core";
import {
  type ChatCompletionChunk,
  type ChatCompletionInput,
  type ChatCompletionResponse,
  isChatCompletionChunk,
  isChatCompletionError,
} from "@blocklet/ai-kit/api/types/chat";
import { inject, injectable } from "tsyringe";

import { uniqBy } from "lodash";
import {
  DEFAULT_COOLDOWN_PERIOD,
  DEFAULT_MAX_CONSECUTIVE_FAILURES,
  DEFAULT_RETRY_DELAY,
} from "../constants";
import logger from "../logger";
import { getDefaultValue } from "../utils/default-value";

const defaultLLMModel = "gpt-4o-mini";

interface ModelStatus {
  consecutiveFailures: number;
  cooldownUntil?: number;
  lastErrorTime?: number;
  lastError?: string;
}

interface ModelConfig {
  maxConsecutiveFailures: number;
  cooldownPeriod: number;
  retryDelay: number;
}

@injectable()
export class BlockletLLMModel extends LLMModel {
  private readonly defaultConfig: ModelConfig = {
    maxConsecutiveFailures: DEFAULT_MAX_CONSECUTIVE_FAILURES,
    cooldownPeriod: DEFAULT_COOLDOWN_PERIOD,
    retryDelay: DEFAULT_RETRY_DELAY,
  };

  private modelStatus: Map<string, ModelStatus> = new Map();

  constructor(@inject(TYPES.context) context?: Context) {
    super(context);
  }

  private getModelStatus(model: string): ModelStatus {
    if (!this.modelStatus.has(model)) {
      this.modelStatus.set(model, { consecutiveFailures: 0 });
    }

    return this.modelStatus.get(model)!;
  }

  private isModelInCooldown(model: string): boolean {
    const status = this.getModelStatus(model);
    return !!status.cooldownUntil && Date.now() < status.cooldownUntil;
  }

  private updateModelStatus(model: string, failed: boolean) {
    const status = this.getModelStatus(model);
    const config = this.defaultConfig;

    if (failed) {
      status.consecutiveFailures++;
      status.lastErrorTime = Date.now();

      if (status.consecutiveFailures >= config.maxConsecutiveFailures) {
        status.cooldownUntil = Date.now() + config.cooldownPeriod;
      }
    } else {
      status.consecutiveFailures = 0;
      status.cooldownUntil = undefined;
    }
  }

  async *process(input: LLMModelInputs) {
    const config = this.context?.config.llmModel;

    const models = uniqBy(
      [
        config?.override,
        input.modelOptions,
        config?.default,
        ...(config?.fallback || []),
        { model: defaultLLMModel },
      ].filter((x) => !!x?.model),
      "model",
    );
    logger.debug("models", models);

    for (let configIndex = 0; configIndex < models.length; configIndex++) {
      const currentConfig = models[configIndex];
      const model = getDefaultValue("model", currentConfig);

      logger.debug("modelStatus", this.modelStatus);

      if (!model) {
        logger.debug(`Model ${model} not found in config, skipping...`);
        continue;
      }

      if (this.isModelInCooldown(model)) {
        logger.debug(`Model ${model} is in cooldown, skipping...`);
        continue;
      }

      try {
        const chatInput: ChatCompletionInput = {
          ...input.modelOptions,
          model,
          ...getDefaultValue(
            ["temperature", "topP", "presencePenalty", "frequencyPenalty"],
            currentConfig,
            input.modelOptions,
            config?.default,
          ),
          messages: input.messages as ChatCompletionInput["messages"],
          responseFormat: input.responseFormat,
          tools: input.tools,
          toolChoice: input.toolChoice,
        };

        logger.debug("BlockletLLMModel.run inputs", chatInput);

        yield* await this.executeWithRetry(chatInput);
        this.updateModelStatus(model, false);
        return;
      } catch (error) {
        logger.error(
          `Model ${model} execution failed after all retries:`,
          error,
        );

        const status = this.getModelStatus(model);
        status.lastError = error.message;
        status.lastErrorTime = Date.now();
      }
    }

    // TODO: 检查是否所有模型都在冷却中, 如果都是在冷却中，如何处理？？
    const allInCooldown = models
      .filter((cfg) => !!cfg?.model)
      .every((cfg) => this.isModelInCooldown(cfg?.model!));

    if (allInCooldown) throw new Error("All models in cooldown");
  }

  private async *executeWithRetry(chatInput: ChatCompletionInput) {
    const config = this.defaultConfig;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < config.maxConsecutiveFailures; attempt++) {
      try {
        const stream = await this.getResponseStream(chatInput);
        const toolCalls: ChatCompletionChunk["delta"]["toolCalls"] = [];

        for await (const chunk of stream!) {
          if (isChatCompletionChunk(chunk)) {
            const { content, toolCalls: calls } = chunk.delta;

            if (calls?.length) {
              toolCalls.push(...calls);
            }

            yield {
              $text: content || undefined,
              delta: toolCalls ? { toolCalls } : undefined,
            };
          } else if (isChatCompletionError(chunk)) {
            throw new Error(chunk.error.message);
          }
        }

        return;
      } catch (error) {
        lastError = error;

        logger.error(
          `Attempt ${attempt + 1} failed for model ${chatInput.model}:`,
          error,
        );

        this.updateModelStatus(chatInput?.model!, true);

        if (attempt < config.maxConsecutiveFailures - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, config.retryDelay),
          );
        }
      }
    }

    throw lastError;
  }

  async getResponseStream(chatInput: ChatCompletionInput) {
    const { chatCompletions } = await import("@blocklet/ai-kit/api/call");

    const model = chatInput.model;

    let stream: ReadableStream<ChatCompletionResponse> | undefined;

    if (this.context) {
      const adapter = await getAdapter("llm", model!);
      if (adapter) {
        const runnable = await this.context.resolve<
          Runnable<
            ChatCompletionInput,
            { $llmResponseStream: ReadableStream<ChatCompletionResponse> }
          >
        >(agentV1ToRunnableDefinition(adapter.agent));
        stream = (await runnable.run(chatInput, { stream: false }))
          .$llmResponseStream;
      }
    }

    if (!stream) {
      stream = (await chatCompletions({
        ...chatInput,
        stream: true,
      })) as any as ReadableStream<ChatCompletionResponse>; // TODO: fix chatCompletions response type in @blocklet/ai-kit;
    }

    return stream;
  }
}
