import { rimrafSync } from "rimraf";

console.log("clean .blocklet folder");
rimrafSync(".blocklet");
console.log("clean .blocklet folder done!");
