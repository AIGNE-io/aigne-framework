import type { AFS } from "@aigne/afs";
import { stringify } from "yaml";

export async function getAFSSystemPrompt(afs: AFS): Promise<string> {
  return `\

<afs_usage>
AFS (AIGNE File System) provides tools to interact with a virtual file system, allowing you to list, search, read, and write files. Use these tools to manage and retrieve files as needed.

Modules:
${stringify(await afs.listModules())}

Available Tools:
1. afs_list: Browse directory contents like filesystem ls/tree command - shows files and folders in a given path
2. afs_search: Find files by content keywords - use specific keywords related to what you're looking for
3. afs_read: Read file contents - path must be an exact file path from list or search results
4. afs_write: Write content to a file in the AFS

Workflow: Use afs_list to browse directories, afs_search to find specific content, then afs_read to access file contents.
</afs_usage>
`;
}
