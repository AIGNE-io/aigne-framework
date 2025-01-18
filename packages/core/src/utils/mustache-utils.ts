import Mustache from "mustache";

export function renderMessage(
  template: string,
  variables?: { [key: string]: any },
) {
  return Mustache.render(template, variables, undefined, {
    escape: (v) => {
      return typeof v === "object" ? JSON.stringify(v) : v;
    },
  });
}
