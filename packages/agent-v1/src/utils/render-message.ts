import { get } from "lodash";

import { Mustache } from "../types/assistant";

export async function renderMessage(
  message: string,
  parameters?: { [key: string]: any },
  {
    stringify = true,
    escapeJsonSymbols,
  }: { stringify?: boolean; escapeJsonSymbols?: boolean } = {},
) {
  const spans = Mustache.parse(message.trim());
  if (!stringify && spans.length === 1) {
    const span = spans[0]!;
    if (span[0] === "name") {
      return get(parameters, span[1]);
    }
  }

  return Mustache.render(message, parameters, undefined, {
    escape: (v: any) => {
      const r = typeof v === "object" ? JSON.stringify(v) : v;

      if (typeof r === "string" && escapeJsonSymbols) {
        return JSON.stringify(r).slice(1, -1);
      }
      return r;
    },
  });
}
