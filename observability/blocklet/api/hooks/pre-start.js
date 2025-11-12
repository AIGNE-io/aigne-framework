/* eslint-disable global-require */

const isDevelopment = process.env.BLOCKLET_MODE === "development";

if (isDevelopment) {
  // rename `require` to skip deps resolve when bundling
  const r = require;
  r("ts-node").register();
  r("../src/hooks/pre-start");
} else {
  require("../dist/hooks/pre-start.js");
}
