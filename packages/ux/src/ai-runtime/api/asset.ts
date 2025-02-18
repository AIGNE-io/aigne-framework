import { joinURL, withQuery } from "ufo";

import { getAIRuntimeApiPrefix } from "./request";

const presets = {
  avatar: { w: 80 },
  default: { w: 1200 },
};

export function getAssetUrl({
  aid,
  filename,
  w,
  preset,
}: {
  aid?: string;
  filename?: string;
  w?: number;
  preset?: keyof typeof presets;
}) {
  const url =
    filename && aid && !filename?.startsWith("http")
      ? joinURL(getAIRuntimeApiPrefix(), "/api/agents", aid, "assets", filename)
      : filename;

  if (!url) return url;

  const width = w ?? presets[preset!]?.w ?? presets.default.w;

  return withQuery(url, {
    imageFilter: width ? "resize" : undefined,
    f: "webp",
    w: width,
  });
}
