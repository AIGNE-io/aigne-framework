import type { AFSEntry } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import type { Agent } from "../../../agents/agent.js";
import { isNonNullable } from "../../../utils/type-utils.js";

export async function getHistories(
  agent: Agent,
): Promise<{ role: "user" | "agent"; content: unknown }[]> {
  const afs = agent?.afs;
  if (!afs) return [];

  const historyModule = (await afs.listModules()).find((m) => m.module instanceof AFSHistory);
  if (!historyModule) return [];

  const history: AFSEntry[] = (
    await afs.list(historyModule.path, {
      limit: agent.historyConfig?.maxItems || 10,
      orderBy: [["createdAt", "desc"]],
    })
  ).data;

  return history
    .reverse()
    .map((i) => {
      if (!i.content) return;

      const { input, output } = i.content;
      if (!input || !output) return;

      return [
        { role: "user" as const, content: input },
        { role: "agent" as const, content: output },
      ];
    })
    .filter(isNonNullable)
    .flat();
}
