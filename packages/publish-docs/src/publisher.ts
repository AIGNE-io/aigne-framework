import type { DocNode } from "./generator.js";
import { getComponentMountPoint } from "./utils/get-component-mount-point.js";

interface PublishResult {
  success: boolean;
  docs?: unknown[];
  error?: string;
}

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
    const mountPoint = await getComponentMountPoint(
      appUrl,
      "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu",
    );
    console.log(`Found Discuss Kit mount point: ${mountPoint}`);

    const publishUrl = `${url.origin}${mountPoint}/api/docs/create-docs-collection`;
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
        `Failed to publish blog post: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    return { success: true, docs: result.docs };
  } catch (error) {
    console.error("Error publishing blog post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
