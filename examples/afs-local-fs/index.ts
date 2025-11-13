#!/usr/bin/env npx -y bun

import { AFS, AFSHistory } from "@aigne/afs";
import { LocalFS } from "@aigne/afs-local-fs";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import yargs from "yargs";

const argv = yargs()
  .option("path", {
    type: "string",
    describe: "Path to the directory to mount",
    default: ".",
  })
  .option("description", {
    type: "string",
    default: "Working directory mounted from local file system",
    describe: "Description of the mounted file system",
  })
  .demandOption("path")
  .strict(false)
  .parseSync(process.argv);

const aigne = await loadAIGNEWithCmdOptions();

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } })) // In-memory history for this example
  .mount(new LocalFS({ localPath: argv.path, description: argv.description }));

const agent = AIAgent.from({
  instructions:
    "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions.",
  inputKey: "message",
  afs,
});

await runWithAIGNE(agent, {
  aigne,
  chatLoopOptions: {
    welcome:
      "Hello! I'm a chatbot that can help you interact with a local file system mounted on AFS. Ask me anything about the files!",
  },
});
