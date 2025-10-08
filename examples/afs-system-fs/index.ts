#!/usr/bin/env npx -y bun

import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import yargs from "yargs";

const argv = yargs()
  .option("path", {
    type: "string",
    describe: "Path to the directory to mount",
  })
  .option("mount", {
    type: "string",
    default: "/fs",
    describe: "Mount point in the virtual file system",
  })
  .option("description", {
    type: "string",
    default: "Mounted file system",
    describe: "Description of the mounted file system",
  })
  .demandOption("path")
  .strict(false)
  .parseSync(process.argv);

await runWithAIGNE(
  () =>
    AIAgent.from({
      name: "afs-system-fs-chatbot",
      instructions:
        "You are a friendly chatbot that can retrieve files from a virtual file system.",
      inputKey: "message",
      afs: new AFS().use(
        new SystemFS({ mount: argv.mount, path: argv.path, description: argv.description }),
      ),
    }),
  {
    chatLoopOptions: {
      welcome:
        "Hello! I'm a chatbot that can help you find files in the /docs directory. Ask me anything!",
    },
  },
);
