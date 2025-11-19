import type { AIProviderType } from "./constants.js";
import { PROVIDER_RANK } from "./constants.js";

interface ModelConfig {
  pattern: RegExp;
  vendor?: string;
  defaultProvider?: AIProviderType;
  supportedProviders?: AIProviderType[];
}

const MODEL_CONFIGS: ModelConfig[] = [
  {
    pattern: /^gemini|^imagen|^veo/,
    vendor: "google",
    defaultProvider: "google",
    supportedProviders: ["google", "openrouter", "poe"],
  },
  {
    pattern: /^gpt-|^o[13]-|^dall-e-|^text-embedding|^sora-/,
    vendor: "openai",
    defaultProvider: "openai",
    supportedProviders: ["openai", "openrouter", "poe"],
  },
  {
    pattern: /^claude/,
    vendor: "anthropic",
    defaultProvider: "anthropic",
    supportedProviders: ["anthropic", "bedrock", "openrouter", "poe"],
  },
  {
    pattern: /^deepseek/,
    vendor: "deepseek",
    defaultProvider: "deepseek",
    supportedProviders: ["deepseek", "openrouter", "ollama"],
  },
  {
    pattern: /^grok/,
    vendor: "xai",
    defaultProvider: "xai",
    supportedProviders: ["xai", "openrouter", "poe"],
  },
  {
    pattern: /^doubao/,
    vendor: "doubao",
    defaultProvider: "doubao",
    supportedProviders: ["doubao"],
  },
  {
    pattern: /^llama/,
    vendor: "meta",
    supportedProviders: ["openrouter", "ollama", "bedrock"],
  },
  {
    pattern: /^mistral|^mixtral/,
    vendor: "mistral",
    supportedProviders: ["openrouter", "ollama", "bedrock"],
  },
  {
    pattern: /^qwen/,
    vendor: "qwen",
    supportedProviders: ["openrouter", "ollama", "bedrock"],
  },
  {
    pattern: /^gemma/,
    vendor: "google",
    supportedProviders: ["openrouter", "ollama", "bedrock"],
  },
  {
    pattern: /^yi/,
    vendor: "yi",
    supportedProviders: ["openrouter", "ollama", "bedrock"],
  },
  {
    pattern: /^phi/,
    vendor: "microsoft",
    supportedProviders: ["openrouter", "ollama", "bedrock"],
  },
];

function findModelConfig(model: string): ModelConfig | undefined {
  if (!model) return undefined;
  const id = model.toLowerCase();
  return MODEL_CONFIGS.find((config) => config.pattern.test(id));
}

export function inferVendorFromModel(model: string): string | undefined {
  return findModelConfig(model)?.vendor;
}

export function getDefaultProviderForModel(model: string): AIProviderType | null {
  const config = findModelConfig(model);
  if (!config) return null;
  return config.defaultProvider ?? (config.supportedProviders?.[0] || null);
}

export function getSupportedProviders(model: string): AIProviderType[] {
  const config = findModelConfig(model);
  if (!config?.supportedProviders) return [];

  return config.supportedProviders.sort((a, b) => PROVIDER_RANK[a] - PROVIDER_RANK[b]);
}
