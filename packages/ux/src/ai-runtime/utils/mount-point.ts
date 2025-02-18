export { joinURL, withQuery, getQuery } from "ufo";

export function getComponentMountPoint(name: string) {
  const m = window.blocklet?.componentMountPoints.find(
    (i) => i.name === name || i.did === name,
  )?.mountPoint;
  if (!m) throw new Error(`No component mount point found for ${name}`);
  return m;
}
