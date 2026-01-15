import type { AFS, AFSEntry } from "@aigne/afs";
import fm from "front-matter";
import { AgentSkill } from "./agent-skill.js";

export interface Skill {
  path: string;
  name: string;
  description: string;
  content: string;
}

function parseSkill(content: string, path: string): Skill {
  const meta = fm<{ name: string; description: string }>(content);

  return {
    path,
    name: meta.attributes.name as string,
    description: meta.attributes.description as string,
    content: meta.body,
  };
}

export async function discoverSkillsFromAFS(afs: AFS): Promise<Skill[]> {
  const modules = await afs.listModules();
  const filtered = modules.filter(({ module: m }) => m.agentSkills === true);
  if (!filtered.length) return [];

  const skills: Skill[] = [];
  for (const module of filtered) {
    const data: AFSEntry[] = (
      await afs
        .list(module.path, {
          pattern: "**/SKILL.md",
          maxDepth: 10,
        })
        .catch(() => ({ data: [] }))
    ).data;

    for (const entry of data) {
      const { data: file } = await afs.read(entry.path);
      if (typeof file?.content !== "string") continue;

      const dirname = entry.path.split("/").slice(0, -1).join("/");

      const skill = parseSkill(file.content, dirname);
      skills.push(skill);
    }
  }

  return skills;
}

export async function loadAgentSkillFromAFS({
  afs,
}: {
  afs: AFS;
}): Promise<AgentSkill | undefined> {
  const skills = await discoverSkillsFromAFS(afs);
  if (!skills.length) return;

  return new AgentSkill({
    agentSkills: skills,
  });
}
