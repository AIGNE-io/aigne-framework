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

const modelPriceCache = new Map<string, ModelPrice | undefined>();

const findModelPrice = (model: string): ModelPrice | undefined => {
  if (modelPriceCache.get(model)) {
    return modelPriceCache.get(model);
  }

  const modelPrices = (window as any).modelPrices;
  if (!modelPrices) {
    modelPriceCache.set(model, undefined);
    return undefined;
  }

  let price = modelPrices[model];

  if (!price) {
    for (const provider of PROVIDERS) {
      price = modelPrices[`${provider}/${model}`];
      if (price) break;
    }
  }

  modelPriceCache.set(model, price);
  return price;
};

const ZERO = new Decimal(0);

const calculateCost = (data: TraceData["attributes"]["output"]) => {
  const { model, usage, seconds } = data || {};
  const inputTokens = usage?.inputTokens || 0;
  const outputTokens = usage?.outputTokens || 0;

  if (!model) {
    return { inputCost: ZERO, outputCost: ZERO };
  }

  const price = findModelPrice(model);
  if (!price) {
    return { inputCost: ZERO, outputCost: ZERO };
  }

  const inputCostPerToken = price.input_cost_per_token || 0;
  const outputCostPerToken = price.output_cost_per_token || 0;
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

const getTraceStats = (trace: TraceData | null) => {
  let count = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let inputCost = ZERO;
  let outputCost = ZERO;

  function traverse(node: TraceData | null) {
    if (!node) return;
    count += 1;
    if (node.attributes.output?.usage) {
      inputTokens += node.attributes.output.usage.inputTokens || 0;
      outputTokens += node.attributes.output.usage.outputTokens || 0;
      const cost = calculateCost(node.attributes.output);
      inputCost = inputCost.add(cost.inputCost);
      outputCost = outputCost.add(cost.outputCost);
    }
    if (node.children) node.children.forEach(traverse);
  }
  traverse(trace);

  const totalCost = inputCost.add(outputCost);

  return {
    count,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost: inputCost.gt(0) ? `$${inputCost.toString()}` : "",
    outputCost: outputCost.gt(0) ? `$${outputCost.toString()}` : "",
    totalCost: totalCost.gt(0) ? `$${totalCost.toString()}` : "",
  };
};

interface TraceCostStats {
  count: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: Decimal;
  outputCost: Decimal;
  totalCost: Decimal;
}

const getTraceCostMap = (trace: TraceData | null): Map<string, TraceCostStats> => {
  const costMap = new Map<string, TraceCostStats>();

  function calculateSubtree(node: TraceData | null): TraceCostStats {
    if (!node) {
      return {
        count: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCost: ZERO,
        outputCost: ZERO,
        totalCost: ZERO,
      };
    }

    let count = 1;
    let inputTokens = 0;
    let outputTokens = 0;
    let inputCost = ZERO;
    let outputCost = ZERO;

    if (node.attributes.output?.usage) {
      inputTokens = node.attributes.output.usage.inputTokens || 0;
      outputTokens = node.attributes.output.usage.outputTokens || 0;
      const cost = calculateCost(node.attributes.output);
      inputCost = cost.inputCost;
      outputCost = cost.outputCost;
    }

    if (node.children) {
      for (const child of node.children) {
        const childStats = calculateSubtree(child);
        count += childStats.count;
        inputTokens += childStats.inputTokens;
        outputTokens += childStats.outputTokens;
        inputCost = inputCost.add(childStats.inputCost);
        outputCost = outputCost.add(childStats.outputCost);
      }
    }

    const stats: TraceCostStats = {
      count,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost,
      outputCost,
      totalCost: inputCost.add(outputCost),
    };

    costMap.set(node.id, stats);
    return stats;
  }

  calculateSubtree(trace);
  return costMap;
};

const clearModelPriceCache = () => {
  modelPriceCache.clear();
};

const truncateString = (str: string, maxLength = 200): string => {
  if (str.length <= maxLength * 2) return str;

  return `${str.slice(0, maxLength)}......${str.slice(-maxLength)}`;
};

export {
  getLocalizedFilename,
  findModelPrice,
  calculateCost,
  getTraceStats,
  getTraceCostMap,
  clearModelPriceCache,
  truncateString,
};
export type { TraceCostStats };
