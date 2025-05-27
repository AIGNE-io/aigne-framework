interface BlockletConfig {
  componentMountPoints: Array<{
    mountPoint: string;
    title: string;
    did: string;
  }>;
}

export async function getComponentMountPoint(appUrl: string, did: string): Promise<string> {
  const url = new URL(appUrl);
  const blockletJsUrl = `${url.origin}/__blocklet__.js?type=json`;

  const blockletJs = await fetch(blockletJsUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!blockletJs.ok) {
    throw new Error(
      `Failed to fetch blocklet json: ${blockletJs.status} ${blockletJs.statusText}, ${blockletJsUrl}`,
    );
  }

  const config: BlockletConfig = await blockletJs.json();
  const component = config.componentMountPoints.find((component) => component.did === did);
  if (!component) {
    throw new Error(`Component ${did} not found in blocklet: ${appUrl}`);
  }

  return component.mountPoint;
}
