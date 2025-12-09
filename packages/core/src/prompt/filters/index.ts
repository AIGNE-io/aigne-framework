import * as tson from "@zenoaihq/tson";
import type { Environment } from "nunjucks";
import { stringify } from "yaml";

type Callback = (err: Error | null, result: any) => void;

export function setupFilters(env: Environment) {
  env.addFilter(
    "yaml.stringify",
    async (obj: unknown, cb: Callback) => {
      cb(null, stringify(await obj));
    },
    true,
  );

  env.addFilter(
    "json.stringify",
    async (obj: unknown, ...args: [...any[], Callback]) => {
      const jsonArgs = args.slice(0, -1);
      const cb = args[args.length - 1] as Callback;
      cb(null, JSON.stringify(await obj, ...jsonArgs));
    },
    true,
  );

  env.addFilter(
    "tson.stringify",
    async (obj: any, cb: Callback) => {
      cb(null, tson.dumps(await obj));
    },
    true,
  );
}
