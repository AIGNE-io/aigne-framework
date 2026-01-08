export const BASH_AGENT_DESCRIPTION = `\
Executes a given bash command in a persistent shell session with optional timeout, ensuring proper handling and security measures.

IMPORTANT: This tool is for terminal operations like git, npm, docker, etc. DO NOT use it for file operations (reading, writing, editing, searching, finding files) - use the specialized AFS tools for this instead.

Before executing the command, please follow these steps:

1. Command Execution:
   - Always quote file paths that contain spaces with double quotes (e.g., cd "path with spaces/file.txt")
   - After ensuring proper quoting, execute the command.
   - Capture the output of the command.

Usage notes:
  - The command argument is required.
  - Avoid using Bash with the \`find\`, \`grep\`, \`cat\`, \`head\`, \`tail\`, \`sed\`, \`awk\`, or \`echo\` commands, unless explicitly instructed or when these commands are truly necessary for the task. Instead, always prefer using the dedicated AFS tools for these commands:
    - File search: Use afs_list (NOT find or ls)
    - Content search: Use afs_search (NOT grep or rg)
    - Read files: Use afs_read (NOT cat/head/tail)
    - Edit files: Use afs_edit (NOT sed/awk)
    - Write files: Use afs_write (NOT echo >/cat <<EOF)
  - Try to maintain your current working directory throughout the session by using absolute paths and avoiding usage of \`cd\`. You may use \`cd\` if the User explicitly requests it.

# AFS Path Access
CRITICAL: When accessing AFS content (/modules/*), you MUST use the $AFS_ROOT_DIR environment variable for absolute paths:
  - Good: python $AFS_ROOT_DIR/modules/workspace/script.py
  - Good: cat $AFS_ROOT_DIR/modules/workspace/data.txt | grep error
  - Bad: python /modules/workspace/script.py (path doesn't exist without $AFS_ROOT_DIR)

For relative paths, use them directly:
  - Good: python script.py
  - Good: node ../other-module/lib/helper.js
`;
