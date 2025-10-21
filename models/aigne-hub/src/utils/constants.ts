export const AIGNE_HUB_URL = "https://hub.aigne.io/";

export const AIGNE_HUB_BLOCKLET_DID = "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ";

export const AIGNE_HUB_DEFAULT_MODEL = "openai/gpt-5-mini";

export const AIGNE_HUB_IMAGE_MODEL = "openai/gpt-image-1";

export const AIGNE_HUB_VIDEO_MODEL = "openai/sora-2";

export const aigneHubBaseUrl = () =>
  process.env.BLOCKLET_AIGNE_API_URL || process.env.AIGNE_HUB_API_URL || AIGNE_HUB_URL;
