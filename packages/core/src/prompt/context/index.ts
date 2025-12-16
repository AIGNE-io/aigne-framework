import { pick } from "../../utils/type-utils.js";
import type { PromptBuildOptions } from "../prompt-builder.js";
import { createAFSContext } from "./afs/index.js";

export function createPromptBuilderContext(options: PromptBuildOptions) {
  return {
    userContext: options.context?.userContext,
    ...options.context?.userContext,
    ...options.input,
    $afs: createAFSContext(options.agent),
    $agent: {
      get skills() {
        return options.agent?.skills.map((s) => pick(s, ["name", "description"]));
      },
    },
  };
}
