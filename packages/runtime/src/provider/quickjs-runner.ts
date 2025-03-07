import crypto from "node:crypto";

import { SandboxFunctionRunner, type SandboxFunctionRunnerInput } from "@aigne/core";
import { Sandbox } from "@blocklet/quickjs/sandbox";
import { call, getComponentMountPoint } from "@blocklet/sdk/lib/component";
import config from "@blocklet/sdk/lib/config";
import pick from "lodash/pick";
import { injectable } from "tsyringe";

@injectable()
export class QuickJSRunner extends SandboxFunctionRunner {
  async process(input: SandboxFunctionRunnerInput) {
    if (input.language && input.language !== "javascript" && input.language !== "typescript") {
      throw new Error(`Unsupported language ${input.language}`);
    }

    // TODO: respond log to the result stream or the callback in the context
    const { log } = console;

    const global = {
      console: <typeof console>{
        // NOTE: do not return logger.xxx result, it will cause memory leak
        log: (...args) => log(...args),
        info: (...args) => log(...args),
        debug: (...args) => log(...args),
        warn: (...args) => log(...args),
        error: (...args) => log(...args),
      },
      getComponentMountPoint,
      call: (...args: Parameters<typeof call>) => call(...args).then((res) => ({ data: res.data })),
      crypto: { randomInt: crypto.randomInt },
      config: {
        env: pick(config.env, "appId", "appName", "appDescription", "appUrl"),
      },
    };

    const allArgs = {
      ...input.input,
    };
    const argKeys = Object.keys(allArgs);

    const result = await Sandbox.callFunction({
      code: `\
async function main({${argKeys.join(", ")}) {
  ${input.code}
}
`,
      filename: `${input.name}.js`,
      global,
      functionName: "main",
      args: [allArgs],
    });

    return result;
  }
}
