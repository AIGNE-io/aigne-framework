/* eslint-disable no-console */
import { rimrafSync } from "rimraf";

console.log("clean dist, lib folder");
rimrafSync("lib");
rimrafSync("dist");
console.log("clean dist, lib folder done!");
