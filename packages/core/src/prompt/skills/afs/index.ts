import type { AFS } from "@aigne/afs";
import type { Agent } from "../../../agents/agent.js";
import { isNonNullable } from "../../../utils/type-utils.js";
import { loadAgentSkillFromAFS } from "./agent-skill/skill-loader.js";
import { AFSDeleteAgent } from "./delete.js";
import { AFSEditAgent } from "./edit.js";
import { AFSExecAgent } from "./exec.js";
import { AFSListAgent } from "./list.js";
import { AFSReadAgent } from "./read.js";
import { AFSRenameAgent } from "./rename.js";
import { AFSSearchAgent } from "./search.js";
import { AFSWriteAgent } from "./write.js";

export async function getAFSSkills(afs: AFS): Promise<Agent[]> {
  return [
    new AFSListAgent({ afs }),
    new AFSSearchAgent({ afs }),
    new AFSReadAgent({ afs }),
    new AFSWriteAgent({ afs }),
    new AFSEditAgent({ afs }),
    new AFSDeleteAgent({ afs }),
    new AFSRenameAgent({ afs }),
    new AFSExecAgent({ afs }),
    await loadAgentSkillFromAFS({ afs }),
  ].filter(isNonNullable);
}
