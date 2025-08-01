import open from "open";
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
  autoOpen?: boolean;
}): Promise<PublishResult> {
  try {
    const { data, appUrl, accessToken, autoOpen } = input;

    const url = new URL(appUrl);
    const mountPoint = await getComponentMountPoint(appUrl, DISCUSS_KIT_DID);

    const publishUrl = joinURL(url.origin, mountPoint, "/api/docs/create-docs-collection");

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

    const docsUrl = joinURL(url.origin, mountPoint, "/docs", data.boardId);

    console.log(`Publishing docs collection...`);
    console.log(`📖 Docs available at: ${docsUrl}`);

    // Auto open docs page in browser
    if (autoOpen) {
      try {
        await open(docsUrl);
        console.log(`✅ Opened docs in browser`);
      } catch (openError) {
        console.log(
          `⚠️  Failed to open browser: ${openError instanceof Error ? openError.message : String(openError)}`,
        );
      }
    }

    return { success: true, docs: result.docs, boardId: data.boardId, docsUrl };
  } catch (error) {
    console.error("Error publishing docs post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
