#!/usr/bin/env npx -y bun

import { AFS, type AFSAccessMode } from "@aigne/afs";
import { AFSGit } from "@aigne/afs-git";
import { AFSHistory } from "@aigne/afs-history";
import { loadAIGNEWithCmdOptions, runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent } from "@aigne/core";
import yargs from "yargs";

const argv = yargs()
  .option("path", {
    type: "string",
    describe: "Path to the git repo to mount",
  })
  .option("url", {
    type: "string",
    describe: "URL of the remote git repository",
  })
  .option("description", {
    type: "string",
    default: "Working directory mounted from local file system",
    describe: "Description of the mounted file system",
  })
  .option("access-mode", {
    type: "string",
    choices: ["readonly", "readwrite"],
    default: "readonly",
    describe: "Access mode for the mounted repo",
  })
  .option("auto-commit", {
    type: "boolean",
    default: false,
    describe: "Automatically commit changes to the mounted repo",
  })
  .strict(false)
  .parseSync(process.argv);

// Default to current directory if neither path nor url is provided
const repoPath = argv.path || (argv.url ? undefined : ".");

const aigne = await loadAIGNEWithCmdOptions();

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } })) // In-memory history for this example
  .mount(
    new AFSGit({
      repoPath: argv.url ? undefined : repoPath,
      remoteUrl: argv.url,
      description: argv.description,
      accessMode: argv.accessMode as AFSAccessMode,
      autoCommit: argv.autoCommit,
    }),
  );

const agent = AIAgent.from({
  instructions: `\
You are a friendly chatbot that can retrieve files from a virtual file system.
You should use the provided functions to list, search, and read files as needed to answer user questions.

<afs_modules>
{{ $afs.description }}

{{ $afs.modules | yaml.stringify }}
</afs_modules>
  `,
  inputKey: "message",
  afs,
});

await runWithAIGNE(agent, {
  aigne,
  chatLoopOptions: {
    welcome:
      "Hello! I'm a chatbot that can help you interact with a git repo mounted on AFS. Ask me anything about the repo!",
  },
});
