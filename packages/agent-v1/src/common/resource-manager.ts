import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { getResources } from "@blocklet/sdk/lib/component";
import config from "@blocklet/sdk/lib/config";
import { exists } from "fs-extra";
import { groupBy, throttle } from "lodash";
import { parse } from "yaml";

import { AIGNE_STUDIO_COMPONENT_DID } from "../constants";
import logger from "../logger";
import {
  type Assistant,
  type ResourceProject,
  type ResourceType,
  ResourceTypes,
  validateResourceProject,
} from "../types";
import { isNonNullable, isPropsNonNullable } from "../utils/is-non-nullable";

export type ResourceProjectItem = ResourceProject & {
  blocklet: { did: string };
  dir: string;
  agentMap: {
    [agentId: string]: Assistant;
  };
};

export type ResourceBlockletItem = {
  did: string;
  status?: number;
  projectMap: {
    [projectId: string]: ResourceProjectItem;
  };
};

// TODO: Define the type of `knowledge` property
export interface ResourceKnowledge {
  knowledge: any & { public?: boolean };
  blockletDid: string;
  documents: any[];
  contents: any[];
  segments: any[];
  vectorsPath: string;
  uploadPath: string;
  sourcesPath: string;
  processedPath: string;
  logoPath: string;
  title: string;
  did: string;
}

export interface Resources {
  knowledge: {
    knowledgeList: ResourceKnowledge[];
    blockletMap: {
      [blockletDid: string]: {
        knowledgeMap: {
          [knowledgeId: string]: ResourceKnowledge;
        };
      };
    };
  };
  agents: {
    [type: string]: {
      projects: ResourceProjectItem[];
      blockletMap: {
        [blockletDid: string]: ResourceBlockletItem;
      };
    };
  };
}

const getResourceList = () => {
  return ResourceTypes.flatMap((type) =>
    getResources({
      types: [{ did: AIGNE_STUDIO_COMPONENT_DID, type }],
      skipRunningCheck: true,
    }).map((i) => ({
      ...i,
      type,
    })),
  ).filter(isPropsNonNullable("path"));
};

async function loadProjectsFromResourceBlockletDir({
  did,
  path,
}: {
  did: string;
  path: string;
}): Promise<ResourceProjectItem[]> {
  if (!(await exists(path))) return [];

  const projectYamlPaths = (await readdir(path)).map((filename: string) =>
    join(path, filename, `${filename}.yaml`),
  );

  return (
    await Promise.all(
      projectYamlPaths.map(async (filepath) => {
        try {
          const project: ResourceProject = await validateResourceProject(
            parse((await readFile(filepath)).toString()),
          );
          return {
            ...project,
            blocklet: { did },
            dir: dirname(filepath),
            agentMap: Object.fromEntries(project.agents.map((i) => [i.id, i])),
          };
        } catch (error) {
          logger.error("parse aigne project resource file error", { error });
          return null;
        }
      }),
    )
  ).filter(isNonNullable);
}

const loadResourceKnowledge = async () => {
  const dirs = getResourceList().filter((i) => i.type === "knowledge");

  if (dirs.length === 0) return [];

  return (
    await Promise.all(
      dirs.map(async (item) => {
        try {
          if (!(await exists(item.path))) return undefined;
          const knowledgeIds = await readdir(item.path);
          if (!knowledgeIds.length) return undefined;

          return await Promise.all(
            knowledgeIds.map(async (knowledgeId) => {
              try {
                const knowledgePath = join(item.path, knowledgeId);
                const vectorsPath = join(knowledgePath, "vectors");
                const uploadPath = join(knowledgePath, "uploads");
                const sourcesPath = join(knowledgePath, "sources");
                const processedPath = join(knowledgePath, "processed");
                const logoPath = join(knowledgePath, "logo.png");

                const knowledgeJsonPath = join(knowledgePath, "knowledge.yaml");
                const knowledge: any & { public?: boolean } = parse(
                  (await readFile(knowledgeJsonPath)).toString(),
                );

                const documentsPath = join(knowledgePath, "documents.yaml");
                const documents = parse(
                  (await readFile(documentsPath)).toString(),
                );

                const contentsPath = join(knowledgePath, "contents.yaml");
                const contents = (await exists(contentsPath))
                  ? parse((await readFile(contentsPath)).toString())
                  : [];

                const segmentsPath = join(knowledgePath, "segments.yaml");
                const segments = (await exists(segmentsPath))
                  ? parse((await readFile(segmentsPath)).toString())
                  : [];

                return {
                  title: item.title,
                  did: item.did,
                  knowledge: { projectId: knowledge.appId, ...knowledge },
                  documents,
                  segments,
                  contents,
                  blockletDid: item.did,
                  vectorsPath,
                  uploadPath, // old source
                  sourcesPath, // new source
                  processedPath,
                  logoPath,
                };
              } catch (error) {
                logger.error("read knowledge resource error", { error });
              }
              return undefined;
            }),
          );
        } catch (error) {
          logger.error("read knowledge resource error", { error });
        }

        return undefined;
      }),
    )
  )
    .flat()
    .filter(isNonNullable);
};

async function loadResources(): Promise<Resources> {
  const list = getResourceList().filter((i) => i.type !== "knowledge");

  const resources = groupBy(
    await Promise.all(
      list.map(async (item) => ({
        ...item,
        projects: await loadProjectsFromResourceBlockletDir(item),
      })),
    ),
    (i) => i.type,
  );

  const knowledgeList = await loadResourceKnowledge();

  return {
    knowledge: {
      knowledgeList,
      blockletMap: Object.fromEntries(
        Object.entries(groupBy(knowledgeList, (i) => i.blockletDid)).map(
          ([blockletDid, kbs]) => [
            blockletDid,
            {
              knowledgeMap: Object.fromEntries(
                kbs.map((i) => [i.knowledge.id, i]),
              ),
            },
          ],
        ),
      ),
    },
    agents: Object.fromEntries(
      Object.entries(resources).map(([type, group]) => {
        const blocklets: ResourceBlockletItem[] = Object.entries(
          groupBy(
            group.flatMap((i) => i.projects),
            (i) => i.blocklet.did,
          ),
        ).map(([blockletDid, projects]) => ({
          did: blockletDid,
          status: group[0]?.status,
          projectMap: Object.fromEntries(
            projects.map((i) => [i.project.id, i]),
          ),
        }));

        return [
          type,
          {
            projects: group.flatMap((i) => i.projects),
            blockletMap: Object.fromEntries(blocklets.map((i) => [i.did, i])),
          },
        ];
      }),
    ),
  };
}

export class ResourceManager {
  constructor({
    wait = 5000,
    watch = true,
  }: { wait?: number; watch?: boolean } = {}) {
    if (watch) {
      const reload = throttle(
        async () => {
          logger.info("reload resource states");
          await this.reload()
            .then((resource) => {
              logger.info("reload resource states success", {
                projects: Object.values(resource.agents).reduce(
                  (res, i) => i.projects.length + res,
                  0,
                ),
                knowledge: resource.knowledge.knowledgeList.length,
              });
            })
            .catch((error) => {
              logger.error("reload resource states error", { error });
            });
        },
        wait,
        { leading: false, trailing: true },
      );

      config.events.on(config.Events.componentAdded, reload);
      config.events.on(config.Events.componentRemoved, reload);
      config.events.on(config.Events.componentStarted, reload);
      config.events.on(config.Events.componentStopped, reload);
      config.events.on(config.Events.componentUpdated, reload);
    }
  }

  private promise?: Promise<Resources>;

  get resources() {
    if (!this.promise) {
      this.promise = loadResources();
    }

    return this.promise;
  }

  async reload() {
    this.promise = loadResources();
    return this.resources;
  }

  async getProjects({
    blockletDid,
    type,
  }: { blockletDid?: string; type: ResourceType }) {
    const resources = await this.resources;
    const list = resources.agents[type]?.projects ?? [];

    if (blockletDid) {
      return list.filter((i) => i.blocklet.did === blockletDid);
    }

    return list;
  }

  async getProject({
    blockletDid,
    projectId,
    type,
  }: {
    blockletDid: string;
    projectId: string;
    type?: ResourceType | ResourceType[];
  }) {
    const resources = await this.resources;
    for (const t of type ? [type].flat() : ResourceTypes) {
      const p =
        resources.agents[t]?.blockletMap[blockletDid]?.projectMap[projectId];
      if (p) return p;
    }
    return undefined;
  }

  async getAgent({
    blockletDid,
    projectId,
    agentId,
    type = ResourceTypes,
  }: {
    blockletDid: string;
    projectId: string;
    agentId: string;
    type?: ResourceType | ResourceType[];
  }) {
    const resources = await this.resources;
    for (const t of [type].flat()) {
      const blocklet = resources.agents[t]?.blockletMap[blockletDid];
      const project = blocklet?.projectMap[projectId];
      const agent = project?.agentMap[agentId];
      if (agent)
        return {
          agent,
          project: project.project,
          blocklet: { did: blockletDid },
        };
    }

    return undefined;
  }

  async getKnowledgeList() {
    const resources = await this.resources;
    return resources.knowledge.knowledgeList;
  }

  async getKnowledge({
    blockletDid,
    knowledgeId,
  }: { blockletDid: string; knowledgeId: string }) {
    const resources = await this.resources;
    return resources.knowledge.blockletMap[blockletDid]?.knowledgeMap[
      knowledgeId
    ];
  }
}
