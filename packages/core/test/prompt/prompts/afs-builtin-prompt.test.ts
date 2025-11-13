import { expect, test } from "bun:test";
import { AFS, AFSHistory } from "@aigne/afs";
import { getAFSSystemPrompt } from "@aigne/core/prompt/prompts/afs-builtin-prompt";

test("getAFSSystemPrompt should inject afs modules to the system prompt", async () => {
  const afs = new AFS({}).mount(new AFSHistory());

  expect(await getAFSSystemPrompt(afs)).toMatchInlineSnapshot(`
    "
    <afs_usage>
    AFS (Agentic File System) provides tools to interact with a virtual file system,
    allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
    Use these tools to manage and retrieve files as needed.

    Provided modules:
    - path: /modules/history
      name: history


    Global tools to interact with the AFS:
    1. afs_list: Browse directory contents like filesystem ls/tree command - shows files and folders in a given path
    2. afs_search: Find files by content keywords - use specific keywords related to what you're looking for
    3. afs_read: Read file contents - path must be an exact file path from list or search results
    4. afs_write: Write content to a file in the AFS
    5. afs_exec: Execute a executable tool from the available modules
    </afs_usage>
    "
  `);
});
