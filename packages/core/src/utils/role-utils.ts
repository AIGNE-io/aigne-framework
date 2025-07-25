import type { Role } from "../agents/chat-model.js";

/**
 * Standard role mapping for most chat model providers
 * Maps AIGNE framework roles to common provider role names
 */
export const STANDARD_ROLE_MAP: { [key in Role]: string } = {
  system: "system",
  user: "user",
  agent: "assistant",
  tool: "tool",
} as const;

/**
 * Creates a role mapper function for a specific provider
 *
 * @param roleMap - Custom role mapping for the provider
 * @returns Function that maps AIGNE roles to provider roles
 *
 * @example
 * ```typescript
 * // For standard providers (OpenAI, Anthropic, etc.)
 * const mapRole = createRoleMapper(STANDARD_ROLE_MAP);
 *
 * // For providers with different role names
 * const customMap = { ...STANDARD_ROLE_MAP, agent: "bot" };
 * const customMapper = createRoleMapper(customMap);
 * ```
 */
export function createRoleMapper<T extends string>(
  roleMap: { [key in Role]: T },
): (role: Role) => T {
  return (role: Role) => roleMap[role] as T;
}

/**
 * Standard role mapper using the default role mapping
 */
export const mapStandardRole = createRoleMapper(STANDARD_ROLE_MAP);
