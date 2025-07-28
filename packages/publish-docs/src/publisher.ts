import { joinURL } from "ufo";
import { DISCUSS_KIT_DID } from "./constants.js";
import type { DocNode } from "./generator.js";
import type { PublishResult } from "./types.js";
import { getComponentMountPoint } from "./utils/get-component-mount-point.js";

export async function publisher(input: {
  data: {
    boardId: string;
    docs: DocNode[];
  };
  appUrl: string;
  accessToken: string;
}): Promise<PublishResult> {
  try {
    const { data, appUrl, accessToken } = input;

    const url = new URL(appUrl);
    const mountPoint = await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);
    console.log(`Found Discuss Kit mount point: ${mountPoint}`);

    const publishUrl = joinURL(url.origin, mountPoint, "/api/docs/create-docs-collection");
    console.log(`Publishing docs collection to ${publishUrl}`);

    const response = await fetch(publishUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to publish docs post: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    return { success: true, docs: result.docs, boardId: data.boardId };
  } catch (error) {
    console.error("Error publishing docs post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
