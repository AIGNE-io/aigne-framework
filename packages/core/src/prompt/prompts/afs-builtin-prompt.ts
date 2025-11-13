import type { AFS } from "@aigne/afs";
import { stringify } from "yaml";
import { pick } from "../../utils/type-utils.js";

export async function getAFSSystemPrompt(afs: AFS): Promise<string> {
  return `\

<afs_usage>
AFS (Agentic File System) provides tools to interact with a virtual file system,
allowing you to list, search, read, and write files, or execute a useful tool from the available modules.
Use these tools to manage and retrieve files as needed.

Provided modules:
${stringify((await afs.listModules()).map((i) => pick(i, ["name", "path", "description"])))}

Global tools to interact with the AFS:
1. afs_list: Browse directory contents like filesystem ls/tree command - shows files and folders in a given path
2. afs_search: Find files by content keywords - use specific keywords related to what you're looking for
3. afs_read: Read file contents - path must be an exact file path from list or search results
4. afs_write: Write content to a file in the AFS
5. afs_exec: Execute a executable tool from the available modules
</afs_usage>
`;
}

export const AFS_EXECUTABLE_TOOLS_PROMPT_TEMPLATE = `\
<afs_executable_tools>
Here are the executable tools available in the AFS you can use:

{{ tools | yaml.stringify }}
</afs_executable_tools>
`;
