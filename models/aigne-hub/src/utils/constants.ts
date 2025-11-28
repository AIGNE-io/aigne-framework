export const AIGNE_HUB_URL = "https://hub.aigne.io/";

export const AIGNE_HUB_BLOCKLET_DID = "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ";

export const AIGNE_HUB_DEFAULT_MODEL = "openai/gpt-5-mini";

export const AIGNE_HUB_IMAGE_MODEL = "openai/gpt-image-1";

export const AIGNE_HUB_VIDEO_MODEL = "openai/sora-2";

export const AIGNE_HUB_PROVIDER = "aignehub";

export const aigneHubBaseUrl = () =>
  process.env.BLOCKLET_AIGNE_API_URL || process.env.AIGNE_HUB_API_URL || AIGNE_HUB_URL;

export const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  BEDROCK: "bedrock",
  DEEPSEEK: "deepseek",
  GOOGLE: "google",
  OLLAMA: "ollama",
  OPENROUTER: "openrouter",
  XAI: "xai",
  DOUBAO: "doubao",
  POE: "poe",
  IDEOGRAM: "ideogram",
} as const;

export type AIProviderType = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

export const PROVIDER_RANK: Record<AIProviderType, number> = {
  openai: 1,
  anthropic: 1,
  google: 1,
  deepseek: 1,
  xai: 1,
  doubao: 1,
  ideogram: 1,
  bedrock: 2,
  openrouter: 3,
  poe: 3,
  ollama: 4,
};
