import { joinURL } from "ufo";

export async function getAIGNEHubMountPoint(url: string, component: string) {
  const { origin } = new URL(url);
  const BLOCKLET_JSON_PATH = "__blocklet__.js?type=json";
  const blockletInfo = await fetch(joinURL(origin, BLOCKLET_JSON_PATH));
  const blocklet = await blockletInfo.json();
  const comp = (blocklet?.componentMountPoints || []).find(
    (m: { did: string }) => m.did === component,
  );
  if (!comp) throw new Error(`Component ${component} not found in blocklet ${url}`);

  return joinURL(origin, comp.mountPoint);
}
