import Joi from "joi";

import type { Assistant, ConfigFile, CronFile, MemoryFile } from "../assistant";
import { type ProjectSettings, projectSettingsSchema } from "./project";

export * from "./project";

export type ResourceType =
  | "application"
  | "tool"
  | "llm-adapter"
  | "aigc-adapter"
  | "knowledge"
  | "template"
  | "example";

export const ResourceTypes: ResourceType[] = [
  "application",
  "tool",
  "llm-adapter",
  "aigc-adapter",
  "knowledge",
  "template",
  "example",
];

export interface ResourceProject {
  project: ProjectSettings;
  agents: (Assistant & { public?: boolean; parent: string[] })[];
  config: ConfigFile;
  cron: CronFile;
  memory: MemoryFile;
  dir?: string;
}

const resourceProjectSchema = Joi.object<ResourceProject>({
  project: projectSettingsSchema.required(),
  agents: Joi.array().items(Joi.object()).required(),
  config: Joi.object().default({}),
  cron: Joi.object().default({}),
  memory: Joi.object().default({}),
}).options({ stripUnknown: true });

export async function validateResourceProject(value: any) {
  return resourceProjectSchema.validateAsync({
    ...value,
    agents: value.agents || value.assistants,
    cron: value.cron || value.cronConfig,
  });
}
