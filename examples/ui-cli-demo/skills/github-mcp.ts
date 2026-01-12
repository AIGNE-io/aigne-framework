import { MCPAgent } from "@aigne/core";

/**
 * GitHub MCP skill - Interact with GitHub repositories, issues, and pull requests
 * Uses the official GitHub MCP server via stdio transport
 *
 * Requires GITHUB_PERSONAL_ACCESS_TOKEN environment variable
 */
export async function createGitHubMCPSkill() {
  const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  if (!githubToken) {
    throw new Error(
      'GITHUB_PERSONAL_ACCESS_TOKEN environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'Get your token at: https://github.com/settings/tokens'
    );
  }

  // Create GitHub MCP agent using stdio transport
  // The GitHub MCP server is run via npx
  const githubAgent = await MCPAgent.from({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: githubToken,
    },
  });

  return githubAgent;
}
