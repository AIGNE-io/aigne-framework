import crypto from "node:crypto";

import { getComponentMountPoint } from "@blocklet/sdk/lib/component";
import { env } from "@blocklet/sdk/lib/config";
import { isNil } from "lodash";
import { joinURL, withQuery } from "ufo";

import { NFT_BLENDER_COMPONENT_DID } from "../constants";
import type { ImageBlenderAssistant } from "../types";
import { AgentExecutorBase } from "./base";

export class ImageBlenderAgentExecutor extends AgentExecutorBase<ImageBlenderAssistant> {
  override async process() {
    const { agent } = this;

    if (!agent.templateId)
      throw new Error(`Missing templateId in image blender agent ${agent.id}`);

    const dynamicData = Object.fromEntries(
      await Promise.all(
        Object.entries(agent.dynamicData ?? {}).map(async ([key, val]) => [
          key,
          isNil(val) || typeof val === "string"
            ? await this.renderMessage(val.trim() || `{{${key}}}`)
            : val,
        ]),
      ),
    );

    return {
      $images: [
        {
          url: withQuery(
            joinURL(
              env.appUrl,
              getComponentMountPoint(NFT_BLENDER_COMPONENT_DID),
              "/api/templates/preview",
              agent.templateId,
            ),
            {
              sn: crypto.randomInt(1, 1000000),
              dynamicData: JSON.stringify(dynamicData),
            },
          ),
        },
      ],
    };
  }
}
