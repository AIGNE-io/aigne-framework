import * as tson from "@zenoaihq/tson";
import type { Environment } from "nunjucks";
import { stringify } from "yaml";

export function setupFilters(env: Environment) {
  env.addFilter("yaml.stringify", (obj: unknown) => {
    return stringify(obj);
  });

  env.addFilter("json.stringify", (obj: unknown, ...args: any[]) => {
    return JSON.stringify(obj, ...args);
  });

  env.addFilter("tson.stringify", (obj: any) => {
    return tson.dumps(obj);
  });
}
