import debug from "debug";

const base = debug("aigne");

export const logger = Object.assign(debug, {
  core: base.extend("core"),
  mcp: base.extend("mcp"),
});
