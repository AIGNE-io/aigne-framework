import Decimal from "decimal.js";
import type { TraceData } from "../components/run/types.ts";

const PROVIDERS = [
  "openai",
  "google",
  "anthropic",
  "xai",
  "bedrock",
  "deepseek",
  "openrouter",
  "ollama",
  "doubao",
  "poe",
  "ideogram",
] as const;

function getLocalizedFilename(prefix = "data", locale = "en-US") {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/[/:,]/g, "-")
    .replace(/\s+/, "_");
  const offset = -now.getTimezoneOffset() / 60;
  const offsetLabel = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
  return `${prefix}-${formatted}-${offsetLabel}.json`;
}

export interface ModelPrice {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  output_cost_per_image?: number;
  output_cost_per_video_per_second?: number;
  input_cost_per_pixel?: number;
  output_cost_per_pixel?: number;
  input_cost_per_audio_token?: number;
  output_cost_per_reasoning_token?: number;
  mode?: string;
  model?: string;
  litellm_provider?: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  max_tokens?: number;
  supports_function_calling?: boolean;
  supports_tool_choice?: boolean;
  supports_vision?: boolean;
  supports_audio_input?: boolean;
  supports_audio_output?: boolean;
}

const findModelPrice = (model: string): ModelPrice | undefined => {
  let price = (window as any).modelPrices?.[model];

  for (const provider of PROVIDERS) {
    if (price) {
      break;
    }

    price = (window as any).modelPrices?.[`${provider}/${model}`];
  }

  return price;
};

const calculateCost = (data: TraceData["attributes"]["output"]) => {
  const { model, usage, seconds } = data || {};
  const inputTokens = usage?.inputTokens || 0;
  const outputTokens = usage?.outputTokens || 0;

  if (!model) {
    return {
      inputCost: new Decimal(0),
      outputCost: new Decimal(0),
    };
  }

  const price = findModelPrice(model);
  if (!price) {
    return {
      inputCost: new Decimal(0),
      outputCost: new Decimal(0),
    };
  }

  const inputCostPerToken = new Decimal(price.input_cost_per_token || 0);
  const outputCostPerToken = new Decimal(price.output_cost_per_token || 0);
  const inputCost = new Decimal(inputTokens).mul(inputCostPerToken);
  let outputCost = new Decimal(outputTokens).mul(outputCostPerToken);

  if (price.mode === "image_generation") {
    outputCost = new Decimal(price.output_cost_per_image || 0);
  }

  if (price.mode === "video_generation") {
    outputCost = new Decimal(price.output_cost_per_video_per_second || 0).mul(seconds || 0);
  }

  return {
    inputCost,
    outputCost,
  };
};

export { getLocalizedFilename, findModelPrice, calculateCost };
