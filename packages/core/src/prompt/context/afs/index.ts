import type { AFSRootListOptions, AFSSearchOptions } from "@aigne/afs";
import type { Agent } from "../../../agents/agent.js";
import { pick } from "../../../utils/type-utils.js";
import { AFS_DESCRIPTION_PROMPT_TEMPLATE } from "../../prompts/afs-builtin-prompt.js";
import { getAFSSkills } from "../../skills/afs/index.js";
import { getHistories } from "./history.js";

export function createAFSContext(agent?: Agent<any, any>) {
  const afs = agent?.afs;

  return {
    get enabled() {
      return !!afs;
    },
    description: AFS_DESCRIPTION_PROMPT_TEMPLATE,
    get modules() {
      return afs
        ?.listModules()
        .then((list) => list.map((i) => pick(i, ["name", "path", "description"])));
    },
    get histories(): Promise<{ role: "user" | "agent"; content: unknown }[]> {
      if (!agent) return Promise.resolve([]);
      return getHistories(agent);
    },
    get skills() {
      const afs = agent?.afs;
      if (!afs) return [];
      return getAFSSkills(afs).then((skills) =>
        skills.map((s) => pick(s, ["name", "description"])),
      );
    },
    async list(path: string, options?: AFSRootListOptions) {
      if (!afs) throw new Error("AFS is not configured for this agent.");
      return (await afs.list(path, { ...options, format: options?.format || "tree" })).data;
    },
    async read(path: string) {
      if (!afs) throw new Error("AFS is not configured for this agent.");
      return (await afs.read(path)).data;
    },
    async search(path: string, query: string, options: AFSSearchOptions = {}) {
      if (!afs) throw new Error("AFS is not configured for this agent.");
      return (await afs.search(path, query, options)).data;
    },
  };
}
