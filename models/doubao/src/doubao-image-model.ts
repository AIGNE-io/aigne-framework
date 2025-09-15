import {
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";

import { snakelize } from "@aigne/core/utils/camelize.js";
import { checkArguments, pick } from "@aigne/core/utils/type-utils.js";
import { joinURL } from "ufo";
import { z } from "zod";

const DOUBAO_DEFAULT_IMAGE_MODEL = "doubao-seedream-4-0-250828";
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";

export interface DoubaoImageModelInput extends ImageModelInput {
  size?: string;
  seed?: number;
  sequentialImageGeneration?: boolean;
  sequentialImageGenerationOptions?: {
    maxImages: number;
  };
  stream?: boolean;
  guidanceScale?: number;
  watermark?: boolean;
}

export interface DoubaoImageModelOutput extends ImageModelOutput {}

export interface DoubaoImageModelOptions
  extends ImageModelOptions<DoubaoImageModelInput, DoubaoImageModelOutput> {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  modelOptions?: Omit<Partial<DoubaoImageModelInput>, "model">;
  clientOptions?: Record<string, any>;
}

const doubaoImageModelInputSchema = imageModelInputSchema.extend({});

const doubaoImageModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z.object({}).optional(),
  clientOptions: z.object({}).optional(),
});

export class DoubaoImageModel extends ImageModel<DoubaoImageModelInput, DoubaoImageModelOutput> {
  constructor(public options?: DoubaoImageModelOptions) {
    super({
      ...options,
      inputSchema: doubaoImageModelInputSchema,
      description: options?.description ?? "Draw or edit image by Doubao image models",
    });

    if (options) checkArguments(this.name, doubaoImageModelOptionsSchema, options);
  }

  protected apiKeyEnvName = "DOUBAO_API_KEY";

  override get credential() {
    return {
      url: this.options?.baseURL || process.env.DOUBAO_BASE_URL || DOUBAO_BASE_URL,
      apiKey: this.options?.apiKey || process.env[this.apiKeyEnvName],
      model: this.options?.model || DOUBAO_DEFAULT_IMAGE_MODEL,
    };
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  private extractDataObjects(text: string) {
    const dataObjects = [];
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("data:")) {
        const jsonPart = trimmed.slice(5).trim();
        if (jsonPart === "[DONE]") continue;

        try {
          const obj = JSON.parse(jsonPart);
          dataObjects.push(obj);
        } catch (e) {
          console.warn("Failed to parse JSON data object:", jsonPart, e);
        }
      }
    }

    return dataObjects;
  }

  override async process(input: DoubaoImageModelInput): Promise<ImageModelOutput> {
    const model = input.model || this.credential.model;
    const { url, apiKey } = this.credential;
    if (!apiKey) {
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );
    }

    const map: { [key: string]: string[] } = {
      "doubao-seedream-4": [
        "model",
        "prompt",
        "image",
        "size",
        "sequentialImageGeneration",
        "sequentialImageGenerationOptions",
        "stream",
        "responseFormat",
        "watermark",
      ],
      "doubao-seedream-3.0-t2i": [
        "model",
        "prompt",
        "size",
        "seed",
        "guidanceScale",
        "responseFormat",
        "watermark",
      ],
      "doubao-seededit-3.0-i2i": [
        "model",
        "prompt",
        "image",
        "size",
        "seed",
        "guidanceScale",
        "responseFormat",
        "watermark",
      ],
    };

    const key = Object.keys(map).find((key) => model.includes(key));
    if (!key) {
      throw new Error(`${this.name} only support ${Object.keys(map).join(", ")}`);
    }

    if (!map[key]) {
      throw new Error(`${this.name} only support ${Object.keys(map).join(", ")}`);
    }

    const mergeInput = { ...this.modelOptions, ...input };
    const body = { ...snakelize(pick(mergeInput, map[key])), model };
    body.response_format =
      mergeInput.responseFormat === "base64" ? "b64_json" : mergeInput.responseFormat || "url";

    const response = await fetch(joinURL(url, `/images/generations`), {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Doubao API error: ${response.status} ${response.statusText} ${error}`);
    }

    if (body.stream) {
      if (!response.body) throw new Error("Streaming not supported in this environment");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value);
        }
      }

      const dataObjects = this.extractDataObjects(buffer);
      const error = dataObjects.find((i) => i.type === "image_generation.partial_failed");
      if (error) {
        throw new Error(`Doubao API error: ${error.error.message}`);
      }

      const completed = dataObjects.find((i) => i.type === "image_generation.completed");

      return {
        images: dataObjects
          .filter((i) => i.type === "image_generation.partial_succeeded")
          .map((i) => {
            return {
              url: i.url,
              base64: i.b64_json,
            };
          }),
        usage: { inputTokens: 0, outputTokens: completed?.usage.output_tokens || 0 },
        model: model,
      };
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Doubao API error: ${data.error.message}`);
    }

    return {
      images: data.data.map((item: { url?: string; b64_json?: string }) => ({
        url: item.url,
        base64: item.b64_json,
      })),
      usage: {
        inputTokens: 0,
        outputTokens: data?.usage?.output_tokens || 0,
      },
      model: data.model,
    };
  }
}
