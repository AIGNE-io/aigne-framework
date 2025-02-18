import { ResourceManager } from "@blocklet/ai-runtime/common/resource-manager";
import type { SelectParameter } from "./types";

export const resourceManager = new ResourceManager();

export async function getAdapter(
  type: "llm" | "image-generation",
  model: string,
) {
  const projects = await resourceManager.getProjects({
    type: type === "image-generation" ? "aigc-adapter" : "llm-adapter",
  });

  // TODO: 优化缓存，避免每次都遍历查找
  return projects
    .flatMap((x) => {
      return x.agents.map((y) => ({
        blockletDid: x.blocklet.did,
        projectId: x.project.id,
        agent: y,
      }));
    })
    .filter(
      (x) =>
        x.agent.public &&
        x.agent.parameters
          ?.find(
            (x): x is SelectParameter =>
              x.type === "select" && x.key === "model",
          )
          ?.options?.find((x) => x.label === model || x.value === model),
    )[0];
}
